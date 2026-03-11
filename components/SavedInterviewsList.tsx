import React, { useState } from 'react';
import { CompletedInterview } from '../types';

interface SavedInterviewsListProps {
  savedReports: CompletedInterview[];
  onViewReport: (report: CompletedInterview) => void;
  onDeleteReport: (id: string) => void;
  onBack: () => void;
}

const SavedInterviewsList: React.FC<SavedInterviewsListProps> = ({
  savedReports,
  onViewReport,
  onDeleteReport,
  onBack,
}) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // Default to descending

  if (savedReports.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl mx-auto my-8 text-center border border-purple-100">
        <h2 className="text-3xl font-bold mb-5 text-purple-800">אין ראיונות שמורים</h2>
        <p className="text-gray-600 mb-7 text-lg">לא נמצאו דוחות תלמידים שמורים. התחל/י ראיון חדש כדי ליצור אחד!</p>
        <button
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105"
        >
          חזור למסך הראשי
        </button>
      </div>
    );
  }

  const sortedReports = [...savedReports].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.timestamp - a.timestamp; // Most recent first
    } else {
      return a.timestamp - b.timestamp; // Oldest first
    }
  });

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto my-8 border border-purple-100">
      <h2 className="text-3xl font-bold mb-6 text-center text-purple-900">ראיונות שמורים</h2>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-2">
        <label htmlFor="sort-order" className="ml-2 text-gray-700 font-semibold mb-2 sm:mb-0 text-lg">
          מיין לפי תאריך:
        </label>
        <select
          id="sort-order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-right text-base bg-gray-50 appearance-none pr-8"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236B7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'left 0.5rem center', backgroundSize: '1.5em' }}
        >
          <option value="desc">מהחדש לישן</option>
          <option value="asc">מהישן לחדש</option>
        </select>
      </div>
      <div className="space-y-4">
        {sortedReports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col sm:flex-row items-center justify-between bg-gray-100 p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200 ease-in-out"
            >
              <div className="text-right sm:text-left mb-3 sm:mb-0 sm:ml-4 flex-grow">
                <p className="font-semibold text-xl text-purple-800">
                  {report.studentName} (<span className="text-gray-700">{report.studentClass}</span>, גיל {report.studentAge})
                </p>
                <p className="text-gray-600 text-sm">{report.schoolName}</p>
                <p className="text-gray-500 text-xs mt-1">
                  נשמר בתאריך: {new Date(report.timestamp).toLocaleString('he-IL')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-reverse w-full sm:w-auto">
                <button
                  onClick={() => onViewReport(report)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-sm transition duration-300 ease-in-out shadow-md transform hover:scale-105 flex-grow sm:flex-none"
                >
                  הצג דוח
                </button>
                <button
                  onClick={() => onDeleteReport(report.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg text-sm transition duration-300 ease-in-out shadow-md transform hover:scale-105 flex-grow sm:flex-none"
                >
                  מחק
                </button>
              </div>
            </div>
          ))}
      </div>
      <div className="text-center mt-8">
        <button
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105"
        >
          חזור למסך הראשי
        </button>
      </div>
    </div>
  );
};

export default SavedInterviewsList;