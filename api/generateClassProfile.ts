import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgeGroup, AggregatedClassData, InterventionBank } from '../types';
import { AI_CLASS_PROFILE_SYSTEM_PROMPT_TEMPLATE } from '../constants';

const genAI = new GoogleGenerativeAI(process.env.VITE_API_KEY || '');

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { aggregatedData, interventionBank, targetAgeGroup } = req.body;

    if (!aggregatedData || !interventionBank || !targetAgeGroup) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the system prompt
    const systemPrompt = AI_CLASS_PROFILE_SYSTEM_PROMPT_TEMPLATE(
      aggregatedData.schoolName,
      JSON.stringify(aggregatedData, null, 2),
      JSON.stringify(interventionBank, null, 2),
      targetAgeGroup
    );

    // Call Gemini API
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(
      `Generate a class profile report for ${aggregatedData.schoolName}.`
    );

    const reportMarkdown = result.response.text();

    return res.status(200).json({ reportMarkdown });
  } catch (error: any) {
    console.error('Error in generateClassProfile API:', error);
    return res.status(500).json({
      error: 'Failed to generate class profile',
      details: error.message,
    });
  }
}
