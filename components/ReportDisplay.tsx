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
    <div className="bg-white p-8 rounded-xl shadow-xl max-w-4xl mx-auto my-8 border border-purple-100">
      <h2 className="text-3xl font-bold mb-6 text-center text-purple-900">דוח פרופיל תלמיד</h2>
      {exportError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center" role="alert">
          <span className="block sm:inline">{exportError}</span>
        </div>
      )}
      <div ref={reportRef} className="border border-gray-200 p-6 rounded-md bg-gray-50">
        <MarkdownRenderer markdown={markdownContent} interventionBank={interventionBank} />
      </div>
      <div className="flex flex-col sm:flex-row justify-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse"> {/* Added space-x-reverse for RTL */}
        {isViewingSavedReport && onBackToSavedList && (
          <button
            onClick={onBackToSavedList}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105"
          >
            חזור לרשימת ראיונות
          </button>
        )}
        <button
          onClick={handleExportPdf}
          className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-md flex items-center justify-center transform hover:scale-105 ${
            isExporting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isExporting}
        >
          {isExporting ? <Loader /> : '⬇️ ייצא ל-PDF'}
        </button>
        <button
          onClick={onStartNewInterview}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105"
        >
          התחל ראיון חדש
        </button>
      </div>
    </div>
  );
};

export default ReportDisplay;