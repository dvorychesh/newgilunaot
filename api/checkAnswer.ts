import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAssessmentResponse } from '../types';

const genAI = new GoogleGenerativeAI(process.env.VITE_API_KEY || '');

const AI_ASSESSOR_PROMPT = `You are an evaluator of student responses in Hebrew.
Your task: Assess the quality and depth of a student's answer to a pedagogical question.
CRITICAL: Respond ONLY with valid JSON, no additional text.

Respond with JSON in this exact format:
{
  "status": "PASS" or "FAIL",
  "follow_up_question": "optional question to deepen the answer or null"
}

Rules:
- PASS: Answer is detailed, specific, and at least 20 characters
- FAIL: Answer is vague, too short, or lacks substance
- If FAIL, provide a follow-up question to encourage deeper thinking
- Always respond in Hebrew`;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, answer } = req.body;

    if (!topic || !answer) {
      return res.status(400).json({ error: 'Missing topic or answer' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `${AI_ASSESSOR_PROMPT}

Topic: ${topic}
Student Answer: ${answer}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    const assessment: AIAssessmentResponse = JSON.parse(responseText);

    return res.status(200).json(assessment);
  } catch (error: any) {
    console.error('Error in checkAnswer API:', error);
    return res.status(500).json({
      error: 'Failed to assess answer',
      details: error.message,
    });
  }
}
