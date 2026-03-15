import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_API_KEY || '');

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
- If FAIL, provide a follow_up question to encourage deeper thinking
- Always respond in Hebrew`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Missing question or answer' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: AI_ASSESSOR_PROMPT,
    });

    const prompt = `Question: ${question}\nAnswer: ${answer}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      parsed = { status: 'PASS', follow_up_question: null };
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Error in checkAnswer:', error);
    return res.status(500).json({
      error: 'Failed to check answer',
      details: error.message,
    });
  }
}
