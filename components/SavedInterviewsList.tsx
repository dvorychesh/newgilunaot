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
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-3xl font-bold mb-3 text-slate-800">אין ראיונות שמורים</h2>
          <p className="text-slate-600 text-lg mb-8">לא נמצאו דוחות תלמידים שמורים. התחל/י ראיון חדש כדי ליצור אחד!</p>
          <button
            onClick={onBack}
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105"
          >
            ← חזור למסך הראשי
          </button>
        </div>
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
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-l from-green-600 to-emerald-700 bg-clip-text text-transparent">
          📋 ראיונות שמורים
        </h1>
        <p className="text-slate-600 text-lg">צפה בדוחות שנוצרו ({savedReports.length})</p>
      </div>

      {/* Sort Controls */}
      <div className="flex justify-between items-center mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <select
          id="sort-order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right bg-slate-50 text-base font-medium"
        >
          <option value="desc">מהחדש לישן</option>
          <option value="asc">מהישן לחדש</option>
        </select>
        <label htmlFor="sort-order" className="text-slate-700 font-semibold text-base">
          מיין לפי תאריך:
        </label>
      </div>

      {/* Reports List */}
      <div className="space-y-4 mb-10">
        {sortedReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Report Info */}
              <div className="flex-grow text-right">
                <p className="font-bold text-2xl text-slate-800 mb-2">
                  👤 {report.studentName}
                </p>
                <p className="text-slate-600 text-base mb-1">
                  📚 <span className="font-semibold">{report.schoolName}</span> | 🎓 כיתה {report.studentClass} | 🎂 גיל {report.studentAge}
                </p>
                <p className="text-slate-500 text-sm">
                  📅 {new Date(report.timestamp).toLocaleString('he-IL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={() => onViewReport(report)}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-2 px-6 rounded-lg text-sm transition duration-300 ease-in-out shadow-md transform hover:scale-105"
                >
                  👁️ הצג דוח
                </button>
                <button
                  onClick={() => onDeleteReport(report.id)}
                  className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-sm transition duration-300 ease-in-out shadow-md transform hover:scale-105"
                >
                  🗑️ מחק
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105"
        >
          ← חזור למסך הראשי
        </button>
      </div>
    </div>
  );
};

export default SavedInterviewsList;