import React, { useMemo, useState } from 'react';
import { CompletedInterview, AgeGroup } from '../types';
import Loader from './Loader';

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  savedReports: CompletedInterview[];
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ savedReports, onBack }) => {
  const [isExporting, setIsExporting] = useState(false);

  // Memoized calculations for dashboard data
  const dashboardData = useMemo(() => {
    const totalReports = savedReports.length;

    const elementaryReports = savedReports.filter(
      (report) => report.ageGroup === AgeGroup.ELEMENTARY
    ).length;
    const highSchoolReports = savedReports.filter(
      (report) => report.ageGroup === AgeGroup.HIGH_SCHOOL
    ).length;

    const uniqueStudentNames = new Set(
      savedReports.map((report) => report.studentName)
    ).size;

    let totalStrengths = 0;
    let totalChallenges = 0;
    let earliestReportTimestamp = Infinity;
    let latestReportTimestamp = -Infinity;

    savedReports.forEach((report) => {
      // Basic parsing for strengths (💪) and challenges (🚧)
      const strengthsMatch = report.reportMarkdown.match(/💪 \[(.*?)]/g);
      totalStrengths += strengthsMatch ? strengthsMatch.length : 0;

      const challengesMatch = report.reportMarkdown.match(/🚧 \[(.*?)]/g);
      totalChallenges += challengesMatch ? challengesMatch.length : 0;

      // Update earliest and latest timestamps
      if (report.timestamp < earliestReportTimestamp) {
        earliestReportTimestamp = report.timestamp;
      }
      if (report.timestamp > latestReportTimestamp) {
        latestReportTimestamp = report.timestamp;
      }
    });

    const avgStrengths = totalReports > 0 ? (totalStrengths / totalReports).toFixed(1) : '0';
    const avgChallenges = totalReports > 0 ? (totalChallenges / totalReports).toFixed(1) : '0';

    const earliestDate =
      earliestReportTimestamp !== Infinity
        ? new Date(earliestReportTimestamp).toLocaleDateString('he-IL')
        : 'אין';
    const latestDate =
      latestReportTimestamp !== -Infinity
        ? new Date(latestReportTimestamp).toLocaleDateString('he-IL')
        : 'אין';

    return {
      totalReports,
      elementaryReports,
      highSchoolReports,
      uniqueStudentNames,
      avgStrengths,
      avgChallenges,
      earliestDate,
      latestDate,
    };
  }, [savedReports]);

  // Chart data for Age Group Distribution
  const ageGroupChartData = {
    labels: ['יסודי', 'על-יסודי'],
    datasets: [
      {
        label: 'מספר דוחות',
        data: [dashboardData.elementaryReports, dashboardData.highSchoolReports],
        backgroundColor: ['rgba(103, 58, 183, 0.9)', 'rgba(3, 169, 244, 0.9)'], // Deep Purple and Sky Blue
        borderColor: ['rgba(103, 58, 183, 1)', 'rgba(3, 169, 244, 1)'],
        borderWidth: 1,
        borderRadius: 5, // Rounded bars
      },
    ],
  };

  const ageGroupChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          usePointStyle: true,
          font: {
            size: 14,
            family: 'Arial',
          },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'התפלגות דוחות לפי שכבת גיל',
        font: {
          size: 22, // Larger title
          weight: 'bold',
          family: 'Arial',
        },
        color: '#4A0055', // Darker purple title
        rtl: true,
      },
      tooltip: {
        rtl: true,
        titleFont: { family: 'Arial' },
        bodyFont: { family: 'Arial' },
        backgroundColor: 'rgba(0,0,0,0.7)',
        bodyColor: '#fff',
        titleColor: '#fff',
        padding: 10,
        cornerRadius: 5,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: {
            family: 'Arial',
            size: 13,
          },
          color: '#555',
        },
        grid: {
          drawOnChartArea: true, // Draw light horizontal lines
          color: 'rgba(200, 200, 200, 0.2)',
        },
        border: {
          display: false,
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Arial',
            size: 13,
          },
          color: '#555',
        },
        grid: {
          drawOnChartArea: false, // Don't draw vertical lines
        },
        border: {
          display: false,
        }
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    },
    maintainAspectRatio: false,
  };

  // Chart data for Average Strengths vs. Challenges
  const strengthsChallengesChartData = {
    labels: ['מנועי כוח (ממוצע)', 'חסמים (ממוצע)'],
    datasets: [
      {
        label: 'ממוצע לכל דוח',
        data: [parseFloat(dashboardData.avgStrengths), parseFloat(dashboardData.avgChallenges)],
        backgroundColor: ['rgba(76, 175, 80, 0.9)', 'rgba(255, 87, 34, 0.9)'], // Emerald Green and Deep Orange
        borderColor: ['rgba(76, 175, 80, 1)', 'rgba(255, 87, 34, 1)'],
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const strengthsChallengesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          usePointStyle: true,
          font: {
            size: 14,
            family: 'Arial',
          },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'ממוצע מנועי כוח מול חסמים',
        font: {
          size: 22, // Larger title
          weight: 'bold',
          family: 'Arial',
        },
        color: '#4A0055', // Darker purple title
        rtl: true,
      },
      tooltip: {
        rtl: true,
        titleFont: { family: 'Arial' },
        bodyFont: { family: 'Arial' },
        backgroundColor: 'rgba(0,0,0,0.7)',
        bodyColor: '#fff',
        titleColor: '#fff',
        padding: 10,
        cornerRadius: 5,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Arial',
            size: 13,
          },
          color: '#555',
        },
        grid: {
          drawOnChartArea: true,
          color: 'rgba(200, 200, 200, 0.2)',
        },
        border: {
          display: false,
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Arial',
            size: 13,
          },
          color: '#555',
        },
        grid: {
          drawOnChartArea: false,
        },
        border: {
          display: false,
        }
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    },
    maintainAspectRatio: false,
  };


  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const data = dashboardData;
      const csvContent = [
        "מדד,ערך",
        `סה"כ דוחות,${data.totalReports}`,
        `תלמידים ייחודיים,${data.uniqueStudentNames}`,
        `ממוצע מנועי כוח,${data.avgStrengths}`,
        `ממוצע חסמים,${data.avgChallenges}`,
        `דוחות יסודי,${data.elementaryReports}`,
        `דוחות על-יסודי,${data.highSchoolReports}`,
        `תאריך דוח ישן ביותר,${data.earliestDate}`,
        `תאריך דוח חדש ביותר,${data.latestDate}`,
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Student_Reports_Dashboard_${new Date().toLocaleDateString('he-IL')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
      // Optionally display an error to the user
    } finally {
      setIsExporting(false);
    }
  };

  if (savedReports.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl mx-auto my-8 text-center border border-purple-100">
        <h2 className="text-4xl font-extrabold mb-6 text-purple-800">אין נתונים בדשבורד</h2>
        <p className="text-7xl text-purple-600 mb-8">📊</p>
        <p className="text-xl text-gray-700 mb-10">
          כדי לצפות בנתונים מצרפיים, עליך לשמור לפחות דוח תלמיד אחד.
        </p>
        <button
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2 space-x-reverse"
        >
          <span className="text-xl ml-2">➡️</span> חזור למסך הראשי
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-xl shadow-2xl max-w-5xl mx-auto my-8 border border-purple-100">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-purple-900 flex items-center justify-center space-x-3 space-x-reverse">
        <span className="text-4xl">📈</span> דשבורד ראיונות תלמידים
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Total Reports Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-200 text-center transition-all duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-xl font-semibold text-purple-800 mb-2 flex items-center justify-center space-x-2 space-x-reverse">
            <span className="text-2xl">📋</span> סה"כ דוחות
          </h3>
          <p className="text-5xl font-extrabold text-purple-700">
            {dashboardData.totalReports}
          </p>
        </div>

        {/* Unique Students Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200 text-center transition-all duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-xl font-semibold text-blue-800 mb-2 flex items-center justify-center space-x-2 space-x-reverse">
            <span className="text-2xl">🧑‍🎓</span> תלמידים ייחודיים
          </h3>
          <p className="text-5xl font-extrabold text-blue-700">
            {dashboardData.uniqueStudentNames}
          </p>
        </div>

        {/* Average Strengths Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200 text-center transition-all duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-xl font-semibold text-green-800 mb-2 flex items-center justify-center space-x-2 space-x-reverse">
            <span className="text-2xl">💪</span> ממוצע מנועי כוח
          </h3>
          <p className="text-5xl font-extrabold text-green-700">
            {dashboardData.avgStrengths}
          </p>
        </div>

        {/* Average Challenges Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200 text-center transition-all duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-xl font-semibold text-red-800 mb-2 flex items-center justify-center space-x-2 space-x-reverse">
            <span className="text-2xl">🚧</span> ממוצע חסמים
          </h3>
          <p className="text-5xl font-extrabold text-red-700">
            {dashboardData.avgChallenges}
          </p>
        </div>

        {/* Date Range Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-yellow-200 text-center col-span-1 md:col-span-2 lg:col-span-1 transition-all duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-xl font-semibold text-yellow-800 mb-3 flex items-center justify-center space-x-2 space-x-reverse">
            <span className="text-2xl">🗓️</span> טווח תאריכי דוחות
          </h3>
          <p className="text-lg text-gray-700 mb-2 text-right">
            <span className="font-bold text-gray-900">הדוח הישן ביותר:</span> {dashboardData.earliestDate}
          </p>
          <p className="text-lg text-gray-700 text-right">
            <span className="font-bold text-gray-900">הדוח החדש ביותר:</span> {dashboardData.latestDate}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div style={{ height: '380px' }}> {/* Fixed height for better control */}
            <Bar data={ageGroupChartData} options={ageGroupChartOptions} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div style={{ height: '380px' }}> {/* Fixed height for better control */}
            <Bar data={strengthsChallengesChartData} options={strengthsChallengesChartOptions} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
        <button
          onClick={handleExportCsv}
          className={`bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-lg flex items-center justify-center space-x-2 space-x-reverse transform hover:scale-105 ${
            isExporting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isExporting}
        >
          {isExporting ? <Loader /> : (<><span className="text-xl ml-2">🗂️</span> ייצא נתוני דשבורד ל-CSV</>)}
        </button>
        <button
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-lg flex items-center justify-center space-x-2 space-x-reverse transform hover:scale-105"
        >
          <span className="text-xl ml-2">➡️</span> חזור למסך הראשי
        </button>
      </div>
    </div>
  );
};

export default Dashboard;