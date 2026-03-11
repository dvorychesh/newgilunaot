import React, { useRef, useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Loader from './Loader'; // Assuming you have a Loader component
import { InterventionBank } from '../types'; // Import InterventionBank

interface ReportDisplayProps {
  markdownContent: string;
  onStartNewInterview: () => void;
  studentName: string; // Added for PDF filename
  studentClass: string; // Added for PDF filename
  studentAge: string; // Added for PDF filename
  isViewingSavedReport: boolean; // New prop to indicate if it's a saved report
  onBackToSavedList?: () => void; // New prop for going back to saved list
  interventionBank: InterventionBank | null; // New prop for intervention bank
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({
  markdownContent,
  onStartNewInterview,
  studentName,
  studentClass,
  studentAge,
  isViewingSavedReport,
  onBackToSavedList,
  interventionBank, // Destructure the new prop
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportPdf = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);
    setExportError(null);

    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 }); // Scale for better resolution
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Check if the image fits on one page
      if (imgHeight < pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Handle multiple pages
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      const fileName = `Student_Profile_${studentName.replace(/\s/g, '_')}_${studentClass.replace(/\s/g, '_')}_${studentAge.replace(/\s/g, '_')}_age.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setExportError("אירעה שגיאה בייצוא הדוח ל-PDF. אנא נסה/נסי שוב.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
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

      {/* Report Content */}
      <div ref={reportRef} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 mb-10">
        <div className="prose prose-sm max-w-none text-right space-y-6">
          <MarkdownRenderer markdown={markdownContent} interventionBank={interventionBank} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              <Loader />
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