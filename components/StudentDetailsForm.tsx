import React, { useState } from 'react';

interface StudentDetailsFormProps {
  onDetailsSubmit: (schoolName: string, studentName: string, studentClass: string, studentAge: string) => void;
}

const StudentDetailsForm: React.FC<StudentDetailsFormProps> = ({ onDetailsSubmit }) => {
  const [schoolName, setSchoolName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentAge, setStudentAge] = useState(''); // Added studentAge state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (schoolName.trim() && studentName.trim() && studentClass.trim() && studentAge.trim()) {
      onDetailsSubmit(schoolName.trim(), studentName.trim(), studentClass.trim(), studentAge.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-l from-cyan-600 to-blue-700 bg-clip-text text-transparent">
            פרטים אישיים
          </h2>
          <p className="text-slate-600 text-lg">אנא הזן/הזיני את פרטי בית הספר והתלמיד/ה כדי להתחיל</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div className="space-y-2">
            <label htmlFor="schoolName" className="block text-slate-700 text-base font-semibold text-right">
              📚 שם בית הספר
            </label>
            <input
              type="text"
              id="schoolName"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors text-base"
              placeholder="הזן/הזיני שם בית ספר"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="studentName" className="block text-slate-700 text-base font-semibold text-right">
              👤 שם התלמיד/ה
            </label>
            <input
              type="text"
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors text-base"
              placeholder="הזן/הזיני שם מלא"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="studentClass" className="block text-slate-700 text-base font-semibold text-right">
              🎓 כיתה
            </label>
            <input
              type="text"
              id="studentClass"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors text-base"
              placeholder="לדוגמה: י'3, א'2"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="studentAge" className="block text-slate-700 text-base font-semibold text-right">
              🎂 גיל
            </label>
            <input
              type="text"
              id="studentAge"
              value={studentAge}
              onChange={(e) => setStudentAge(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors text-base"
              placeholder="הזן/הזיני גיל (לדוגמה: 13.5)"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-xl text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={!schoolName.trim() || !studentName.trim() || !studentClass.trim() || !studentAge.trim()}
          >
            המשך לראיון →
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentDetailsForm;