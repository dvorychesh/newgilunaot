import React, { useState } from 'react';
import { InterviewAnswer } from '../types';
import { QUESTIONS } from '../constants';

interface ExcelUploaderProps {
  onDataParsed: (data: { schoolName: string; studentName: string; studentClass: string; studentAge: string; answers: InterviewAnswer[] }) => void;
}

// Helper to normalize strings for robust comparison (removes BOM, newlines, extra spaces)
const normalizeString = (str: string) => {
  let cleaned = str.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g, ' ').trim();
  // Remove BOM if present
  if (cleaned.charCodeAt(0) === 0xFEFF) {
    cleaned = cleaned.substring(1);
  }
  return cleaned.toLowerCase();
};

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataParsed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    } else {
      setFile(null);
    }
  };

  const parseCSV = (csvText: string) => {
    // Proper CSV parsing that handles quoted fields and line breaks
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (insideQuotes && nextChar === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === ',' && !insideQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    // Normalize line endings and remove empty lines
    const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedText.split('\n').filter(line => line.trim() !== '');

    if (lines.length < 2) {
      throw new Error("קובץ ה-CSV ריק או מכיל רק כותרות.");
    }

    // Remove BOM if present
    let headerLine = lines[0];
    if (headerLine.charCodeAt(0) === 0xFEFF) {
      headerLine = headerLine.substring(1);
    }

    const headers = parseCSVLine(headerLine).map(h => normalizeString(h));
    const dataRow = parseCSVLine(lines[1]); // Assuming one student per file, or first row is the target student

    let schoolName = '';
    let studentName = '';
    let studentClass = '';
    let studentAge = ''; // Added studentAge variable
    const answers: InterviewAnswer[] = [];

    // Flexible header matching for student details
    const headerKeywordMap: { [key: string]: 'studentName' | 'studentClass' | 'studentAge' | 'schoolName' } = {
      'שם התלמיד': 'studentName',
      'שם תלמיד': 'studentName',
      'תלמיד': 'studentName',
      'שם': 'studentName',
      'name': 'studentName',
      'כיתה': 'studentClass',
      'class': 'studentClass',
      'grade': 'studentClass',
      'גיל': 'studentAge',
      'age': 'studentAge',
      'בית ספר': 'schoolName',
      'school': 'schoolName',
    };

    // Map CSV headers to internal student details - flexible matching
    const studentDetailMap: { [header: string]: 'schoolName' | 'studentName' | 'studentClass' | 'studentAge' } = {};
    headers.forEach(header => {
      for (const keyword in headerKeywordMap) {
        if (header.toLowerCase().includes(keyword.toLowerCase())) {
          studentDetailMap[header] = headerKeywordMap[keyword];
          break;
        }
      }
    });

    // Mapping from normalized CSV header keywords to QUESTION.key from constants.ts
    const csvHeaderKeywordToQuestionKeyMap: { [keyword: string]: string } = {
      // Q1: חוזקות ומוטיבציה
      'חוזק': 'q1',
      'עניין': 'q1',
      'יוזמ/ת': 'q1',

      // Q2: קוגניציה וחשיבה
      'קוגניטיביות': 'q2',
      'חשיבה מתמטית': 'q2',
      'אינטליגנציה דומיננטית': 'q2', // Specific full match
      'אסטרטגיות למידה': 'q2',

      // Q3: שפה ותקשורת
      'שפה': 'q3', // For 'כישורי שפה'
      'קריאה והבנה': 'q3',
      'ניסוח בכתב': 'q3', // For 'יכולת ניסוח בכתב /בע"פ'

      // Q4: תפקוד חברתי
      'שיתוף פעולה': 'q4',
      'השתתפות בשיעורים': 'q4', // This often has social elements too

      // Q5: תפקוד והרגלים
      'התנהלות בכיתה': 'q5',
      'עמידה בזמנים': 'q5',
      'התנהגות': 'q5', // General behavior in class context
      'הכנת שיעורים': 'q5',

      // Q6: אחריות ו-וויסות
      'אחריות אישית': 'q6',
      'נוכחות': 'q6',

      // Q7: מוטיבציה ורגש
      'חיבור לתחום דעת': 'q7',
      'שאיפה למצוינות': 'q7',

      // Q8: בית ומשפחה
      'מצב משפחתי': 'q8',
      'הורים מגוייסים': 'q8', // For 'האם יש הורים מגוייסים/מילואים ?כן /לא'

      // Q9: הערות כלליות
      'הערות כלליות': 'q9',
      // Q10 ('השורה התחתונה') is generated by AI, not directly from CSV.
    };

    // Temporary object to aggregate answers for each questionKey
    const tempAnswers: { [key: string]: string[] } = {};

    headers.forEach((header, index) => {
      const value = dataRow[index];
      // Skip empty cells for non-essential data, but allow for required field validation below
      // if (!value) return;

      // Extract student details
      if (studentDetailMap[header]) {
        switch (studentDetailMap[header]) {
          case 'schoolName':
            schoolName = value; // value could be empty, which is fine for optional schoolName
            break;
          case 'studentName':
            studentName = value;
            break;
          case 'studentClass':
            studentClass = value;
            break;
          case 'studentAge': // Extract student age
            studentAge = value;
            break;
        }
      } else {
        // Map to pedagogical questions
        let matchedQuestionKey: string | null = null;
        for (const keyword in csvHeaderKeywordToQuestionKeyMap) {
          if (header.includes(keyword)) {
            matchedQuestionKey = csvHeaderKeywordToQuestionKeyMap[keyword];
            break;
          }
        }

        if (matchedQuestionKey) {
          if (value) { // Only add value if not empty
            if (!tempAnswers[matchedQuestionKey]) {
              tempAnswers[matchedQuestionKey] = [];
            }
            tempAnswers[matchedQuestionKey].push(value);
          }
        }
      }
    });

    // Final validation for essential *values*
    console.log("Validation - studentName:", studentName, "studentClass:", studentClass, "studentAge:", studentAge);

    if (!studentName.trim()) {
      throw new Error("לא נמצא שדה עבור שם התלמיד/ה. אנא וודא/י שיש עמודה עם שם (שם התלמיד/ה, תלמיד וכ').");
    }
    if (!studentClass.trim()) {
      throw new Error("לא נמצא שדה עבור כיתה. אנא וודא/י שיש עמודה עם כיתה (כיתה, class וכ').");
    }
    if (!studentAge.trim()) {
      throw new Error("לא נמצא שדה עבור גיל. אנא וודא/י שיש עמודה עם גיל (גיל, age וכ').");
    }

    // Construct the final `answers` array based on `QUESTIONS` order
    QUESTIONS.forEach(q => {
      if (q.key === 'q10') { // Q10 is generated by AI, not from CSV
        answers.push({ questionKey: q.key, topic: q.topic, answers: [''] }); // Add an empty answer for Q10
        return;
      }
      const combinedAnswer = tempAnswers[q.key]?.join(' ') || '';
      answers.push({
        questionKey: q.key,
        topic: q.topic,
        answers: [combinedAnswer],
      });
    });

    return { schoolName, studentName, studentClass, studentAge, answers };
  };

  const handleUpload = () => {
    if (!file) {
      setError("אנא בחר/י קובץ להעלאה.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        console.log("CSV text loaded, length:", text.length);
        const parsedData = parseCSV(text);
        console.log("CSV parsed successfully:", parsedData);
        setError(null);
        setFile(null); // Clear file after successful parse
        console.log("Calling onDataParsed callback...");
        onDataParsed(parsedData);
        console.log("onDataParsed callback completed");
      } catch (err: any) {
        console.error("Error parsing CSV:", err);
        setError(`שגיאה בניתוח הקובץ: ${err.message || JSON.stringify(err)}`);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("שגיאה בקריאת הקובץ. אנא נסה/נסי שוב.");
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto my-8 border border-purple-100">
      <h2 className="text-3xl font-bold mb-5 text-center text-purple-800">העלה/העלי קובץ אקסל (CSV)</h2>
      <p className="text-gray-600 mb-7 text-center text-lg">
        אנא העלה/העלי קובץ CSV המכיל את פרטי התלמיד/ה ותשובות לשאלות.
        <br/>
        <strong className="text-purple-700">ודא/י שכותרות העמודות כוללות את מילות המפתח המתאימות לשאלות הפדגוגיות ואת הכותרות 'שם התלמיד/ה', 'כיתה', ו-'גיל'.</strong>
      </p>
      <div className="flex flex-col space-y-5">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-lg text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-lg file:font-semibold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200 transition duration-300 ease-in-out cursor-pointer"
        />
        {error && <p className="text-red-500 text-base text-center mt-3">{error}</p>}
        <button
          onClick={handleUpload}
          className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105 ${
            !file || isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!file || isLoading}
        >
          {isLoading ? 'טוען...' : 'נתח/י קובץ'}
        </button>
      </div>
    </div>
  );
};

export default ExcelUploader;