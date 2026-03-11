import { GoogleGenAI, GenerateContentResponse, Type, FunctionDeclaration } from "@google/genai";
import { AI_INTERVIEWER_SYSTEM_PROMPT, AI_ANALYZER_SYSTEM_PROMPT_TEMPLATE, AI_CLASS_PROFILE_SYSTEM_PROMPT_TEMPLATE } from '../constants';
import { AIAssessmentResponse, AgeGroup, InterventionBank, InterviewAnswer, AggregatedClassData } from '../types';

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!import.meta.env.VITE_API_KEY) {
    throw new Error("Gemini API Key is not configured.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  }
  return aiInstance;
}

export async function checkAnswerQuality(topic: string, userAnswer: string): Promise<AIAssessmentResponse> {
  const ai = getGeminiClient();
  const interviewerFunctionDeclaration: FunctionDeclaration = {
    name: 'checkAnswer',
    description: 'Analyzes the quality of a teacher\'s answer and determines if a follow-up question is needed. Returns status (PASS/FAIL) and a follow-up question if FAIL.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          enum: ['PASS', 'FAIL'],
          description: 'The assessment status of the answer.',
        },
        follow_up_question: {
          type: Type.STRING,
          description: 'A specific, encouraging follow-up question in Hebrew based on the user\'s text, asking for an example. Only present if status is FAIL.',
          nullable: true, // Mark as nullable, as it's optional
        },
      },
      required: ['status'],
    },
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: `Current_Topic_Name: ${topic}` },
            { text: `User_Input_Text: ${userAnswer}` },
            { text: `Analyze the teacher's answer based on detail and relevance. Your ONLY task is to call the 'checkAnswer' tool with the appropriate status and, if necessary, a follow-up question.
            - IF the answer is too short (e.g., less than 6 meaningful words) OR vague/generic (e.g., "He's fine", "No issues", "Average") -> then call the 'checkAnswer' tool with status "FAIL" and generate a specific, empathetic follow-up question in Hebrew that encourages the teacher to provide concrete examples or more detail related to the input.
            - IF the answer is sufficiently detailed and provides specific information -> then call the 'checkAnswer' tool with status "PASS".
            The follow-up question should be polite, professional, and directly prompt for more specific information or examples based on the initial input, without repeating the original question's intent. It should be encouraging and focus on gathering rich data.` }
          ]
        },
      ],
      config: {
        systemInstruction: AI_INTERVIEWER_SYSTEM_PROMPT,
        tools: [{ functionDeclarations: [interviewerFunctionDeclaration] }],
        // responseMimeType and responseSchema are removed as they are not used when primarily expecting a function call.
      },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0];
      if (functionCall.name === 'checkAnswer') {
        // The arguments directly correspond to the AIAssessmentResponse structure
        return {
          status: functionCall.args.status as AIAssessmentResponse['status'],
          follow_up_question: functionCall.args.follow_up_question as string | undefined,
        };
      } else {
        // Log unexpected function call name, and fallback to PASS
        console.warn(`AI made an unexpected function call: ${functionCall.name}. Falling back to PASS status.`);
        return { status: 'PASS' };
      }
    } else {
      // If no function call was made, it's an unexpected scenario for this specific use case.
      // Log it and fallback to PASS to allow the interview to continue.
      console.warn("AI did not make a function call as expected. Falling back to PASS status.");
      // If there happens to be text output, it's not the primary expected format,
      // but we could log it for debugging if needed.
      if (response.text) {
        console.debug("Raw text response when no function call was made:", response.text);
      }
      return { status: 'PASS' };
    }

  } catch (error) {
    console.error("Error checking answer quality:", error);
    // Graceful fallback: if AI fails (e.g., network error), assume pass to continue the interview
    return { status: 'PASS' };
  }
}

export async function generateStudentProfile(
  ageGroup: AgeGroup,
  schoolName: string,
  studentName: string,
  studentClass: string,
  studentAge: string, // Added studentAge
  interviewAnswers: InterviewAnswer[],
  interventionBank: InterventionBank,
): Promise<string> {
  const ai = getGeminiClient();

  const formattedTeacherData = interviewAnswers.map(ans => {
    // Join all answers for a question into a single string
    const combinedAnswer = ans.answers.join(' ');
    return `${ans.topic}: ${combinedAnswer}`;
  }).join('\n');

  const interventionBankJson = JSON.stringify(interventionBank, null, 2);

  const systemPrompt = AI_ANALYZER_SYSTEM_PROMPT_TEMPLATE(
    ageGroup,
    schoolName,
    studentName,
    studentClass,
    studentAge, // Pass studentAge
    formattedTeacherData,
    interventionBankJson
  );

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for more complex reasoning
      contents: [{ parts: [{ text: systemPrompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 6000, // Increased to 6000 for more detailed report
        thinkingConfig: { thinkingBudget: 1000 }, // Kept at 1000, allowing ~5000 tokens for output
      },
    });

    const markdownOutput = response.text;
    if (!markdownOutput) {
      throw new Error("Empty markdown output from AI for student profile.");
    }
    return markdownOutput;
  } catch (error) {
    console.error("Error generating student profile:", error);
    throw new Error("An error occurred while generating the student profile. Please try again.");
  }
}

export async function generateClassProfile(
  aggregatedData: AggregatedClassData,
  interventionBank: InterventionBank,
  targetAgeGroup: AgeGroup | 'mixed',
): Promise<string> {
  const ai = getGeminiClient();

  const aggregatedDataJson = JSON.stringify(aggregatedData, null, 2);
  const interventionBankJson = JSON.stringify(interventionBank, null, 2);

  const systemPrompt = AI_CLASS_PROFILE_SYSTEM_PROMPT_TEMPLATE(
    aggregatedData.schoolName,
    aggregatedDataJson,
    interventionBankJson,
    targetAgeGroup
  );

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for complex reasoning in class profile
      contents: [{ parts: [{ text: systemPrompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 6000, // Ample tokens for a comprehensive class profile
        thinkingConfig: { thinkingBudget: 1500 }, // More thinking budget for complex aggregation
      },
    });

    const markdownOutput = response.text;
    if (!markdownOutput) {
      throw new Error("Empty markdown output from AI for class profile.");
    }
    return markdownOutput;
  } catch (error) {
      console.error("Error generating class profile:", error);
      throw new Error("An error occurred while generating the class profile. Please try again.");
  }
}