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
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto my-8 border border-purple-100">
      <h2 className="text-3xl font-bold mb-5 text-center text-purple-800">פרטים אישיים</h2>
      <p className="text-gray-600 mb-7 text-center text-lg">אנא הזן/הזיני את פרטי בית הספר והתלמיד/ה כדי להתחיל בראיון הפדגוגי.</p>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
        <div>
          <label htmlFor="schoolName" className="block text-gray-700 text-lg font-semibold mb-2 text-right">
            שם בית הספר:
          </label>
          <input
            type="text"
            id="schoolName"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            placeholder="הזן/הזיני שם בית ספר"
            required
          />
        </div>
        <div>
          <label htmlFor="studentName" className="block text-gray-700 text-lg font-semibold mb-2 text-right">
            שם התלמיד/ה:
          </label>
          <input
            type="text"
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            placeholder="הזן/הזיני שם מלא"
            required
          />
        </div>
        <div>
          <label htmlFor="studentClass" className="block text-gray-700 text-lg font-semibold mb-2 text-right">
            כיתה:
          </label>
          <input
            type="text"
            id="studentClass"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            placeholder="לדוגמה: י'3, א'2"
            required
          />
        </div>
        {/* New input for student age */}
        <div>
          <label htmlFor="studentAge" className="block text-gray-700 text-lg font-semibold mb-2 text-right">
            גיל:
          </label>
          <input
            type="text"
            id="studentAge"
            value={studentAge}
            onChange={(e) => setStudentAge(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            placeholder="הזן/הזיני גיל (לדוגמה: 13.5)"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105"
          disabled={!schoolName.trim() || !studentName.trim() || !studentClass.trim() || !studentAge.trim()}
        >
          המשך
        </button>
      </form>
    </div>
  );
};

export default StudentDetailsForm;