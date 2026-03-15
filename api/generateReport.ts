import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_API_KEY || '');

function buildSystemPrompt(ageGroup, schoolName, studentName, studentClass, studentAge, rawTeacherData) {
  return `אתה מנתח AI מתחום בפדגוגיה ופסיכולוגיה חינוכית. על סמך נתוני מורה/ת על תלמיד/ה, צור פרופיל תלמיד מקיף ומעמיק בעברית.

פרטי התלמיד:
- שם: ${studentName}
- כיתה: ${studentClass}
- גיל: ${studentAge}
- בית ספר: ${schoolName}

מידע מהמורה/ת:
${rawTeacherData}

צור דוח פרופיל מקיף הכולל:
1. סיכום מנהלי (קצר וקולע)
2. פרופיל למידה (סגנון, חוזקות, קשיים)
3. תפקוד חברתי-רגשי
4. מוטיבציה ורצונות
5. עצות פרקטיות למורה/ת
6. תוכנית עבודה מומלצת`;
}

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
    const {
      ageGroup,
      schoolName,
      studentName,
      studentClass,
      studentAge,
      answers,
    } = req.body;

    if (!studentName || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const rawTeacherData = answers
      .map((ans) => `${ans.topic}: ${Array.isArray(ans.answers) ? ans.answers.join(' | ') : ans.answers}`)
      .join('\n\n');

    const systemPrompt = buildSystemPrompt(
      ageGroup || '',
      schoolName || '',
      studentName,
      studentClass || '',
      studentAge || '',
      rawTeacherData
    );

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const result = await model.generateContent(systemPrompt);
    const reportMarkdown = result.response.text();

    return res.status(200).json({ reportMarkdown });
  } catch (error) {
    console.error('Error in generateReport API:', error);
    return res.status(500).json({
      error: 'Failed to generate report',
      details: error.message,
    });
  }
}
