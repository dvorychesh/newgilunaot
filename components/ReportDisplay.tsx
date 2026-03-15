import React, { useRef, useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Loader from './Loader';
import { InterventionBank } from '../types';

interface ReportDisplayProps {
  markdownContent: string;
  onStartNewInterview: () => void;
  studentName: string;
  studentClass: string;
  studentAge: string;
  isViewingSavedReport: boolean;
  onBackToSavedList?: () => void;
  interventionBank: InterventionBank | null;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({
  markdownContent,
  onStartNewInterview,
  studentName,
  studentClass,
  studentAge,
  isViewingSavedReport,
  onBackToSavedList,
  interventionBank,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportPdf = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);
    setExportError(null);

    try {
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      if (imgHeight < pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      const fileName = `פרופיל_תלמיד_${studentName.replace(/\s/g, '_')}_${studentClass.replace(/\s/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setExportError("אירעה שגיאה בייצוא הדוח ל-PDF. אנא נסה/נסי שוב.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-l from-cyan-600 to-blue-700 bg-clip-text text-transparent">
          📊 דוח פרופיל תלמיד
        </h1>
        <p className="text-slate-600 text-lg">ניתוח מפורט ותוכנית פעולה מותאמת</p>
      </div>

      {/* Error Alert */}
      {exportError && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-5 mb-8 text-right">
          <p className="text-red-700 font-semibold mb-2">⚠️ שגיאה בייצוא</p>
          <p className="text-red-600 text-sm">{exportError}</p>
        </div>
      )}

      {/* Enhanced Professional Report Content */}
      <div 
        ref={reportRef} 
        className="bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-3xl shadow-2xl border-4 border-cyan-200 overflow-hidden"
      >
        {/* Report Header with Gradient Background */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-8 text-white border-b-4 border-cyan-300">
          <div className="flex items-center justify-between">
            <div className="text-right flex-1">
              <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">🎯 דוח פרופיל תלמיד מקיף</h2>
              <p className="text-cyan-100 text-lg">מערכת AI לניתוח פדגוגי ותכנון אישי</p>
            </div>
            <div className="text-6xl opacity-20">📚</div>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="bg-white m-6 p-6 rounded-2xl border-2 border-cyan-200 shadow-lg">
          <div className="grid grid-cols-3 gap-6 text-right">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-200">
              <p className="text-sm text-slate-500 mb-1">שם התלמיד/ה</p>
              <p className="text-xl font-bold text-cyan-700">{studentName}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <p className="text-sm text-slate-500 mb-1">כיתה</p>
              <p className="text-xl font-bold text-blue-700">{studentClass}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
              <p className="text-sm text-slate-500 mb-1">גיל</p>
              <p className="text-xl font-bold text-indigo-700">{studentAge}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              📅 תאריך יצירת הדוח: {new Date().toLocaleDateString('he-IL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Report Content with Enhanced Styling */}
        <div className="px-10 pb-10">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-8">
            <div className="prose prose-lg max-w-none text-right space-y-6">
              <MarkdownRenderer markdown={markdownContent} interventionBank={interventionBank} />
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className="bg-gradient-to-r from-slate-100 to-cyan-50 p-6 border-t-2 border-cyan-200">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span>מופעל ע"י Gemini 2.0 AI</span>
            </div>
            <div className="text-center flex-1">
              <p className="font-semibold text-slate-700">מערכת AI לפרופיל תלמיד © 2026</p>
              <p className="text-xs text-slate-500 mt-1">ניתוח מעמיק ותכנון פדגוגי מותאם אישית</p>
            </div>
            <div className="flex items-center gap-2">
              <span>מסמך מקצועי</span>
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        {isViewingSavedReport && onBackToSavedList && (
          <button
            onClick={onBackToSavedList}
            className="flex-1 sm:flex-none bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl text-base transition duration-300 ease-in-out shadow-md transform hover:scale-105"
          >
            ← חזור לרשימה
          </button>
        )}
        <button
          onClick={handleExportPdf}
          className={`flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-base transition duration-300 ease-in-out shadow-md transform hover:scale-105 flex items-center justify-center gap-2 ${
            isExporting ? 'opacity-60 cursor-not-allowed hover:scale-100' : ''
          }`}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>מייצא...</span>
            </>
          ) : (
            <>
              📥 ייצא ל-PDF
            </>
          )}
        </button>
        <button
          onClick={onStartNewInterview}
          className="flex-1 sm:flex-none bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-xl text-base transition duration-300 ease-in-out shadow-md transform hover:scale-105"
        >
          ✨ ראיון חדש
        </button>
      </div>
    </div>
  );
};

export default ReportDisplay;
