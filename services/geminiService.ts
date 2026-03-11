import { AIAssessmentResponse, AgeGroup, InterventionBank, InterviewAnswer, AggregatedClassData } from '../types';

export async function checkAnswerQuality(topic: string, userAnswer: string): Promise<AIAssessmentResponse> {
  try {
    const response = await fetch('/api/checkAnswer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, answer: userAnswer }),
    });

    if (!response.ok) {
      console.error('Error checking answer quality:', response.statusText);
      // Graceful fallback: if API fails, assume pass to continue the interview
      return { status: 'PASS' };
    }

    const assessment: AIAssessmentResponse = await response.json();
    return assessment;
  } catch (error) {
    console.error('Error calling checkAnswer API:', error);
    // Graceful fallback: if API fails (e.g., network error), assume pass to continue the interview
    return { status: 'PASS' };
  }
}

export async function generateStudentProfile(
  ageGroup: AgeGroup,
  schoolName: string,
  studentName: string,
  studentClass: string,
  studentAge: string,
  interviewAnswers: InterviewAnswer[],
  interventionBank: InterventionBank,
): Promise<string> {
  try {
    const response = await fetch('/api/generateReport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ageGroup,
        schoolName,
        studentName,
        studentClass,
        studentAge,
        answers: interviewAnswers,
        interventionBank,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.reportMarkdown) {
      throw new Error('Empty report from API');
    }
    return data.reportMarkdown;
  } catch (error) {
    console.error('Error generating student profile:', error);
    throw new Error('An error occurred while generating the student profile. Please try again.');
  }
}

export async function generateClassProfile(
  aggregatedData: AggregatedClassData,
  interventionBank: InterventionBank,
  targetAgeGroup: AgeGroup | 'mixed',
): Promise<string> {
  try {
    const response = await fetch('/api/generateClassProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregatedData,
        interventionBank,
        targetAgeGroup,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.reportMarkdown) {
      throw new Error('Empty report from API');
    }
    return data.reportMarkdown;
  } catch (error) {
    console.error('Error generating class profile:', error);
    throw new Error('An error occurred while generating the class profile. Please try again.');
  }
}