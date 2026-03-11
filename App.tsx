import React, { useState, useCallback, useEffect } from 'react';
import { AgeGroup, InterviewAnswer, AppState, CompletedInterview, InterventionBank } from './types';
import { QUESTIONS, ELEMENTARY_BANK, HIGH_SCHOOL_BANK } from './constants';
import { checkAnswerQuality, generateStudentProfile } from './services/geminiService';
import AgeGroupSelector from './components/AgeGroupSelector';
import InterviewFlow from './components/InterviewFlow';
import ReportDisplay from './components/ReportDisplay';
import Loader from './components/Loader';
import StudentDetailsForm from './components/StudentDetailsForm';
import ExcelUploader from './components/ExcelUploader';
import SavedInterviewsList from './components/SavedInterviewsList';
import Dashboard from './components/Dashboard'; // Import the new Dashboard component
import ClassProfileGenerator from './components/ClassProfileGenerator'; // Import the new ClassProfileGenerator component

const LOCAL_STORAGE_KEY = 'studentProfileAppProgress';
const COMPLETED_INTERVIEWS_KEY = 'completedStudentProfiles'; // New key for completed reports

// Helper to load the entire application state from localStorage
const loadFullAppState = (): AppState => {
  try {
    const serializedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
    const serializedCompleted = localStorage.getItem(COMPLETED_INTERVIEWS_KEY);

    const parsedProgress: AppState = serializedProgress ? JSON.parse(serializedProgress) : {};
    const parsedCompleted: CompletedInterview[] = serializedCompleted ? JSON.parse(serializedCompleted) : [];

    console.log("📂 Loaded from localStorage:", {
      savedReportsCount: parsedCompleted.length,
      studentNames: parsedCompleted.map(r => r.studentName)
    });

    // Return default initial state if nothing is in localStorage or merge with existing progress
    return {
      entryMode: parsedProgress.entryMode ?? 'select_mode',
      schoolName: parsedProgress.schoolName ?? null,
      studentName: parsedProgress.studentName ?? null,
      studentClass: parsedProgress.studentClass ?? null,
      studentAge: parsedProgress.studentAge ?? null,
      ageGroup: parsedProgress.ageGroup ?? null,
      interviewAnswers: parsedProgress.interviewAnswers ?? [],
      currentQuestionIndex: parsedProgress.currentQuestionIndex ?? 0,
      followUpQuestion: parsedProgress.followUpQuestion ?? null,
      reportMarkdown: parsedProgress.reportMarkdown ?? null,
      isExcelFlow: parsedProgress.isExcelFlow ?? false,
      savedReports: parsedCompleted, // Load saved reports
      viewingSavedReport: parsedProgress.viewingSavedReport ?? false,
      followUpQuestionsCount: parsedProgress.followUpQuestionsCount ?? 0, // Load follow-up questions count
    };
  } catch (error) {
    console.error("Error loading state from localStorage:", error);
    // If parsing fails for any reason, return default initial state
    return {
      entryMode: 'select_mode',
      schoolName: null,
      studentName: null,
      studentClass: null,
      studentAge: null,
      ageGroup: null,
      interviewAnswers: [],
      currentQuestionIndex: 0,
      followUpQuestion: null,
      reportMarkdown: null,
      isExcelFlow: false,
      savedReports: [],
      viewingSavedReport: false,
      followUpQuestionsCount: 0, // Default to 0
    };
  }
};

function App() {
  const initialState = loadFullAppState(); // Load full state once on component initialization

  const [entryMode, setEntryMode] = useState<'select_mode' | 'manual_entry' | 'excel_upload' | 'view_saved_interviews' | 'dashboard' | 'class_profile_generator' | null>(initialState.entryMode);
  const [schoolName, setSchoolName] = useState<string | null>(initialState.schoolName);
  const [studentName, setStudentName] = useState<string | null>(initialState.studentName);
  const [studentClass, setStudentClass] = useState<string | null>(initialState.studentClass);
  const [studentAge, setStudentAge] = useState<string | null>(initialState.studentAge);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(initialState.ageGroup);
  const [interviewAnswers, setInterviewAnswers] = useState<InterviewAnswer[]>(initialState.interviewAnswers);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(initialState.currentQuestionIndex);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(initialState.followUpQuestion);
  const [isLoading, setIsLoading] = useState(false); // isLoading is transient, not persisted
  const [error, setError] = useState<string | null>(null); // error is transient, not persisted
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(initialState.reportMarkdown);
  const [isExcelFlow, setIsExcelFlow] = useState<boolean>(initialState.isExcelFlow);
  const [savedReports, setSavedReports] = useState<CompletedInterview[]>(initialState.savedReports); // New state for saved reports
  const [viewingSavedReport, setViewingSavedReport] = useState<boolean>(initialState.viewingSavedReport); // New state to track if we're viewing a saved report
  const [followUpQuestionsCount, setFollowUpQuestionsCount] = useState<number>(initialState.followUpQuestionsCount); // New state for follow-up questions count
  const [currentInterventionBank, setCurrentInterventionBank] = useState<InterventionBank | null>(null); // New state for current intervention bank
  const [showAbout, setShowAbout] = useState(false); // New state for "About" section



  // Effect to save *current interview progress* whenever relevant state changes
  useEffect(() => {
    // Determine if there's meaningful progress to save for the *current* interview
    const hasMeaningfulCurrentProgress =
      schoolName !== null ||
      studentName !== null ||
      studentClass !== null ||
      studentAge !== null ||
      ageGroup !== null ||
      interviewAnswers.length > 0;

    if (hasMeaningfulCurrentProgress && !reportMarkdown && !viewingSavedReport) {
      const progressToSave: AppState = {
        entryMode, // Keep entryMode as is if in progress
        schoolName,
        studentName,
        studentClass,
        studentAge,
        ageGroup,
        interviewAnswers,
        currentQuestionIndex,
        followUpQuestion,
        reportMarkdown: null, // Don't save final report in current progress
        isExcelFlow,
        savedReports: [], // Don't save all saved reports in current progress
        viewingSavedReport: false,
        followUpQuestionsCount,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progressToSave));
    } else {
      // Clear current progress if interview is complete (report generated) or not started
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [
    entryMode,
    schoolName,
    studentName,
    studentClass,
    studentAge,
    ageGroup,
    interviewAnswers,
    currentQuestionIndex,
    followUpQuestion,
    isExcelFlow,
    reportMarkdown,
    viewingSavedReport,
  ]);

  // Effect to save *completed reports* whenever savedReports state changes
  useEffect(() => {
    console.log("💾 Saving reports to localStorage:", savedReports.length, "reports");
    localStorage.setItem(COMPLETED_INTERVIEWS_KEY, JSON.stringify(savedReports));
    console.log("✅ Reports saved successfully");
  }, [savedReports]);


  const handleStudentDetailsSubmit = useCallback((schName: string, sName: string, sClass: string, sAge: string) => {
    setSchoolName(schName);
    setStudentName(sName);
    setStudentClass(sClass);
    setStudentAge(sAge);
    setEntryMode(null); // Move past initial details
    // Auto-determine age group based on age
    const ageNum = parseFloat(sAge);
    const autoAgeGroup = ageNum <= 12 ? AgeGroup.ELEMENTARY : AgeGroup.HIGH_SCHOOL;
    setAgeGroup(autoAgeGroup);
    const relevantBank = autoAgeGroup === AgeGroup.ELEMENTARY ? ELEMENTARY_BANK : HIGH_SCHOOL_BANK;
    setCurrentInterventionBank(relevantBank);
  }, []);

  const handleExcelDataSubmit = useCallback(async (data: { schoolName: string; studentName: string; studentClass: string; studentAge: string; answers: InterviewAnswer[] }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Auto-determine age group based on age
      const ageNum = parseFloat(data.studentAge);
      const autoAgeGroup = ageNum <= 12 ? AgeGroup.ELEMENTARY : AgeGroup.HIGH_SCHOOL;
      const relevantBank = autoAgeGroup === AgeGroup.ELEMENTARY ? ELEMENTARY_BANK : HIGH_SCHOOL_BANK;

      // Generate report immediately with Excel data
      const markdown = await generateStudentProfile(
        autoAgeGroup,
        data.schoolName,
        data.studentName,
        data.studentClass,
        data.studentAge,
        data.answers,
        relevantBank
      );

      // Update state with all the data
      setSchoolName(data.schoolName);
      setStudentName(data.studentName);
      setStudentClass(data.studentClass);
      setStudentAge(data.studentAge);
      setInterviewAnswers(data.answers);
      setAgeGroup(autoAgeGroup);
      setCurrentInterventionBank(relevantBank);
      setReportMarkdown(markdown);
      setIsExcelFlow(true);
      setEntryMode(null);

      // Save the completed report
      const newReport: CompletedInterview = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        schoolName: data.schoolName,
        studentName: data.studentName,
        studentClass: data.studentClass,
        studentAge: data.studentAge,
        ageGroup: autoAgeGroup,
        interviewAnswers: data.answers,
        reportMarkdown: markdown,
        followUpQuestionsCount: 0, // Excel flow doesn't have follow-up questions
      };
      console.log("📌 New Excel report created:", { studentName: data.studentName, studentClass: data.studentClass });
      setSavedReports((prev) => [...prev, newReport]);
      setViewingSavedReport(false);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {
      console.error("❌ Excel flow error:", err);
      setError("אירעה שגיאה בעיבוד הנתונים. אנא נסה/נסי שוב.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAgeGroupSelect = useCallback(async (selectedAgeGroup: AgeGroup) => {
    setAgeGroup(selectedAgeGroup);
    const relevantBank = selectedAgeGroup === AgeGroup.ELEMENTARY ? ELEMENTARY_BANK : HIGH_SCHOOL_BANK;
    setCurrentInterventionBank(relevantBank); // Set the current intervention bank
    // For both manual and Excel flow, continue to interview
  }, []);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  const handleAnswerSubmit = useCallback(async (answer: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let currentQuestionAnswers: string[] = [];
      const existingAnswerIndex = interviewAnswers.findIndex(
        (ans) => ans.questionKey === currentQuestion.key
      );

      if (existingAnswerIndex !== -1) {
        // If a follow-up answer is being submitted for an existing question
        currentQuestionAnswers = [...interviewAnswers[existingAnswerIndex].answers, answer];
      } else {
        // Initial answer for a new question
        currentQuestionAnswers = [answer];
      }

      const aiAssessment = await checkAnswerQuality(currentQuestion.topic, answer);

      if (aiAssessment.status === 'FAIL' && aiAssessment.follow_up_question) {
        setFollowUpQuestion(aiAssessment.follow_up_question);

        setInterviewAnswers((prev) => {
          if (existingAnswerIndex !== -1) {
            const updated = [...prev];
            updated[existingAnswerIndex] = {
              ...updated[existingAnswerIndex],
              answers: currentQuestionAnswers,
            };
            return updated;
          } else {
            return [...prev, { questionKey: currentQuestion.key, topic: currentQuestion.topic, answers: currentQuestionAnswers }];
          }
        });
      } else {
        // Answer is good or follow-up question has been answered sufficiently
        setFollowUpQuestion(null);
        const updatedAnswers = existingAnswerIndex !== -1 ?
          interviewAnswers.map((ans, idx) => idx === existingAnswerIndex ? { ...ans, answers: currentQuestionAnswers } : ans) :
          [...interviewAnswers, { questionKey: currentQuestion.key, topic: currentQuestion.topic, answers: currentQuestionAnswers }];

        setInterviewAnswers(updatedAnswers);

        if (isLastQuestion) {
          // All questions answered, generate report
          const relevantBank = ageGroup === AgeGroup.ELEMENTARY ? ELEMENTARY_BANK : HIGH_SCHOOL_BANK;
          setCurrentInterventionBank(relevantBank); // Set the current intervention bank
          const markdown = await generateStudentProfile(
            ageGroup!,
            schoolName!,
            studentName!,
            studentClass!,
            studentAge!,
            updatedAnswers, // Use updatedAnswers here
            relevantBank
          );
          setReportMarkdown(markdown);

          // Save the completed report
          if (schoolName && studentName && studentClass && studentAge) {
            const newReport: CompletedInterview = {
              id: Date.now().toString(), // Simple unique ID
              timestamp: Date.now(),
              schoolName,
              studentName,
              studentClass,
              studentAge,
              ageGroup: ageGroup!,
              interviewAnswers: updatedAnswers,
              reportMarkdown: markdown,
              followUpQuestionsCount,
            };
            console.log("📌 New manual report created:", { studentName, studentClass });
            setSavedReports((prev) => [...prev, newReport]);
            setViewingSavedReport(false); // New report, not viewing a saved one
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear current progress
          }

        } else {
          // Move to next question
          setCurrentQuestionIndex((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error(err);
      setError("אירעה שגיאה בעיבוד הנתונים. אנא נסה/נסי שוב.");
    } finally {
      setIsLoading(false);
    }
  }, [ageGroup, schoolName, studentName, studentClass, studentAge, currentQuestion, isLastQuestion, interviewAnswers]);


  const handleStartNewInterview = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear current interview progress
    setEntryMode('select_mode');
    setSchoolName(null);
    setStudentName(null);
    setStudentClass(null);
    setStudentAge(null);
    setAgeGroup(null);
    setInterviewAnswers([]);
    setCurrentQuestionIndex(0);
    setFollowUpQuestion(null);
    setIsLoading(false);
    setError(null);
    setReportMarkdown(null);
    // Fix: Corrected typo from setServiceIsExcelFlow to setIsExcelFlow
    setIsExcelFlow(false); // Corrected to setIsExcelFlow
    setViewingSavedReport(false); // Reset viewing saved report state
    setCurrentInterventionBank(null); // Clear the intervention bank
  }, []);

  const handleViewSavedReport = useCallback((report: CompletedInterview) => {
    setSchoolName(report.schoolName);
    setStudentName(report.studentName);
    setStudentClass(report.studentClass);
    setStudentAge(report.studentAge);
    setAgeGroup(report.ageGroup);
    setInterviewAnswers(report.interviewAnswers);
    setReportMarkdown(report.reportMarkdown);
    setViewingSavedReport(true); // Indicate that we're viewing a saved report
    setEntryMode(null); // Clear entry mode to display report
    setCurrentInterventionBank(report.ageGroup === AgeGroup.ELEMENTARY ? ELEMENTARY_BANK : HIGH_SCHOOL_BANK); // Set bank for saved report
  }, []);

  const handleDeleteSavedReport = useCallback((id: string) => {
    setSavedReports((prev) => prev.filter(report => report.id !== id));
  }, []);

  const handleBackToSavedList = useCallback(() => {
    setReportMarkdown(null); // Clear current report display
    setViewingSavedReport(false); // No longer viewing a saved report
    setSchoolName(null); // Clear student details for report display
    setStudentName(null);
    setStudentClass(null);
    setStudentAge(null);
    setAgeGroup(null);
    setInterviewAnswers([]);
    setEntryMode('view_saved_interviews'); // Go back to the list of saved interviews
    setCurrentInterventionBank(null); // Clear the intervention bank
  }, []);

  const handleBackFromDashboard = useCallback(() => {
    setEntryMode('select_mode');
  }, []);

  const handleBackFromClassProfile = useCallback(() => {
    setReportMarkdown(null); // Clear generated class profile
    setIsLoading(false);
    setError(null);
    setEntryMode('select_mode');
  }, []);

  const handleToggleAbout = () => {
    setShowAbout((prev) => !prev);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-cyan-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-l from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              🎯 AI לפרופיל תלמיד
            </h1>
            <p className="text-slate-600 mt-2 text-lg">ניתוח מעמיק ותוכנית פעולה מותאמת אישית</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {entryMode === 'select_mode' && (
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-l from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                בחר/י שיטת הזנה
              </h2>
              <p className="text-gray-600 text-lg">בחר/י כיצד תרצה/י להתחיל ביצירת פרופיל תלמיד</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Manual Entry Card */}
              <div
                onClick={() => setEntryMode('manual_entry')}
                className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200 hover:border-cyan-300 transition-all duration-300 overflow-hidden hover:scale-105 transform"
              >
                <div className="bg-gradient-to-b from-cyan-50 to-blue-50 p-8 text-center">
                  <div className="text-5xl mb-4">✍️</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">הזן/הזיני ידנית</h3>
                  <p className="text-slate-600 mb-4">הזן את פרטי בית הספר ותלמיד/ה וענה על שאלות בצורה אינטראקטיבית</p>
                  <div className="text-sm text-cyan-600 font-semibold">לחץ/י להמשך →</div>
                </div>
              </div>

              {/* Excel Upload Card */}
              <div
                onClick={() => setEntryMode('excel_upload')}
                className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200 hover:border-blue-300 transition-all duration-300 overflow-hidden hover:scale-105 transform"
              >
                <div className="bg-gradient-to-b from-blue-50 to-indigo-50 p-8 text-center">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">העלה קובץ CSV</h3>
                  <p className="text-slate-600 mb-4">העלה קובץ אקסל עם פרטי תלמידים ותשובותיהם לניתוח מהיר</p>
                  <div className="text-sm text-blue-600 font-semibold">לחץ/י להמשך →</div>
                </div>
              </div>
            </div>

            {savedReports.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Saved Interviews Card */}
                <div
                  onClick={() => setEntryMode('view_saved_interviews')}
                  className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200 hover:border-green-300 transition-all duration-300 overflow-hidden hover:scale-105 transform"
                >
                  <div className="bg-gradient-to-b from-green-50 to-emerald-50 p-6 text-center">
                    <div className="text-5xl mb-3">📋</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">ראיונות שמורים</h3>
                    <p className="text-slate-600 text-sm mb-3">צפה בדוחות שהוגנרו ({savedReports.length})</p>
                    <div className="text-sm text-green-600 font-semibold">לחץ/י להמשך →</div>
                  </div>
                </div>

                {/* Dashboard Card */}
                <div
                  onClick={() => setEntryMode('dashboard')}
                  className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200 hover:border-purple-300 transition-all duration-300 overflow-hidden hover:scale-105 transform"
                >
                  <div className="bg-gradient-to-b from-purple-50 to-pink-50 p-6 text-center">
                    <div className="text-5xl mb-3">📈</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">דשבורד</h3>
                    <p className="text-slate-600 text-sm mb-3">צפה בסטטיסטיקות וניתוחים מפורטים</p>
                    <div className="text-sm text-purple-600 font-semibold">לחץ/י להמשך →</div>
                  </div>
                </div>

                {/* Class Profile Card */}
                <div
                  onClick={() => setEntryMode('class_profile_generator')}
                  className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-200 hover:border-teal-300 transition-all duration-300 overflow-hidden hover:scale-105 transform"
                >
                  <div className="bg-gradient-to-b from-teal-50 to-cyan-50 p-6 text-center">
                    <div className="text-5xl mb-3">🧑‍🏫</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">פרופיל כיתתי</h3>
                    <p className="text-slate-600 text-sm mb-3">צור ניתוח מקיף של כל הכיתה</p>
                    <div className="text-sm text-teal-600 font-semibold">לחץ/י להמשך →</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {entryMode === 'manual_entry' && !schoolName && !reportMarkdown && !viewingSavedReport && (
          <StudentDetailsForm onDetailsSubmit={handleStudentDetailsSubmit} />
        )}

        {entryMode === 'excel_upload' && !schoolName && !reportMarkdown && !viewingSavedReport && (
          <ExcelUploader onDataParsed={handleExcelDataSubmit} />
        )}

        {entryMode === 'view_saved_interviews' && (
          <SavedInterviewsList
            savedReports={savedReports}
            onViewReport={handleViewSavedReport}
            onDeleteReport={handleDeleteSavedReport}
            onBack={handleStartNewInterview} // Go back to select mode from here
          />
        )}

        {entryMode === 'dashboard' && (
          <Dashboard
            savedReports={savedReports}
            onBack={handleBackFromDashboard}
          />
        )}

        {entryMode === 'class_profile_generator' && (
          <ClassProfileGenerator
            savedReports={savedReports}
            onBack={handleBackFromClassProfile}
            elementaryBank={ELEMENTARY_BANK}
            highSchoolBank={HIGH_SCHOOL_BANK}
          />
        )}


        {schoolName && studentName && studentClass && studentAge && ageGroup && !reportMarkdown && !viewingSavedReport && currentQuestion && (
          <InterviewFlow
            currentQuestion={currentQuestion}
            followUpQuestion={followUpQuestion}
            onAnswerSubmit={handleAnswerSubmit}
            isLoading={isLoading}
            isLastQuestion={isLastQuestion}
          />
        )}

        {reportMarkdown && (
          <ReportDisplay
            markdownContent={reportMarkdown}
            onStartNewInterview={handleStartNewInterview}
            studentName={studentName || 'תלמיד'} // Fallback for student name
            studentClass={studentClass || ''} // Fallback for student class
            studentAge={studentAge || ''} // Fallback for student age
            isViewingSavedReport={viewingSavedReport}
            onBackToSavedList={handleBackToSavedList}
            interventionBank={currentInterventionBank} // Pass the intervention bank
          />
        )}

        {isLoading && !reportMarkdown && <Loader />}
      </main>

      <footer className="border-t border-slate-200 mt-16 py-10 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-center items-center space-x-6 space-x-reverse">
          <p className="text-slate-600 text-sm">&copy; 2026 מערכת AI לפרופיל תלמיד</p>
          <button
            onClick={handleToggleAbout}
            className="text-cyan-600 hover:text-cyan-700 font-semibold transition duration-300 ease-in-out text-sm"
          >
            📖 אודות
          </button>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg mx-auto text-right border border-slate-200">
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-8 py-8 border-b border-slate-200">
              <h2 className="text-3xl font-bold text-slate-800">ℹ️ אודות המערכת</h2>
            </div>
            <div className="p-8 space-y-5">
              <p className="text-slate-700 text-lg leading-relaxed">
                מערכת זו פותחה כדי לסייע למחנכים ליצור פרופילים פדגוגיים מקיפים לתלמידים. על ידי מענה על 10 שאלות מפתח, המערכת מנתחת את הנתונים ומספקת דוח מפורט הכולל חוזקות, חסמים, תוכנית פעולה והמלצות התערבותיות מותאמות אישית.
              </p>
              <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                <p className="text-slate-700 text-sm">
                  המערכת מופעלת על ידי מודל השפה המתקדם <a href="https://ai.google.dev/models/gemini" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline font-semibold">Gemini Pro</a> מבית Google, המאפשר ניתוח עמוק והפקת תובנות פדגוגיות מבוססות נתונים.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-200 px-8 py-6 flex justify-end">
              <button
                onClick={handleToggleAbout}
                className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;