import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgeGroup, InterviewAnswer, InterventionBank } from '../types';
import { AI_ANALYZER_SYSTEM_PROMPT_TEMPLATE } from '../constants';

const genAI = new GoogleGenerativeAI(process.env.VITE_API_KEY || '');

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      ageGroup,
      schoolName,
      studentName,
      studentClass,
      studentAge,
      answers,
      interventionBank,
    } = req.body;

    // Validate required fields
    if (
      !ageGroup ||
      !schoolName ||
      !studentName ||
      !studentClass ||
      !studentAge ||
      !answers ||
      !interventionBank
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format teacher data from answers
    const rawTeacherData = answers
      .map(
        (ans: InterviewAnswer) =>
          `${ans.topic}: ${ans.answers.join(' | ')}`
      )
      .join('\n\n');

    // Get the system prompt
    const systemPrompt = AI_ANALYZER_SYSTEM_PROMPT_TEMPLATE(
      ageGroup,
      schoolName,
      studentName,
      studentClass,
      studentAge,
      rawTeacherData,
      JSON.stringify(interventionBank, null, 2)
    );

    // Call Gemini API
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(
      `Generate a student profile report for ${studentName}.`
    );

    const reportMarkdown = result.response.text();

    return res.status(200).json({ reportMarkdown });
  } catch (error: any) {
    console.error('Error in generateReport API:', error);
    return res.status(500).json({
      error: 'Failed to generate report',
      details: error.message,
    });
  }
}
