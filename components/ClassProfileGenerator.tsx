import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CompletedInterview, AgeGroup, InterventionBank, AggregatedClassData } from '../types';
import Loader from './Loader';
import ReportDisplay from './ReportDisplay'; // Reuse ReportDisplay for class profile
import AgeGroupSelector from './AgeGroupSelector'; // Reuse AgeGroupSelector
import { generateClassProfile } from '../services/geminiService'; // New service function
import { QUESTIONS } from '../constants'; // For parsing topics

interface ClassProfileGeneratorProps {
  savedReports: CompletedInterview[];
  onBack: () => void;
  elementaryBank: InterventionBank;
  highSchoolBank: InterventionBank;
}

const ClassProfileGenerator: React.FC<ClassProfileGeneratorProps> = ({
  savedReports,
  onBack,
  elementaryBank,
  highSchoolBank,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classProfileMarkdown, setClassProfileMarkdown] = useState<string | null>(null);
  const [selectedAgeGroupForRecommendations, setSelectedAgeGroupForRecommendations] = useState<AgeGroup | 'mixed' | null>(null);
  const [currentInterventionBank, setCurrentInterventionBank] = useState<InterventionBank | null>(null);

  // Aggregate data from all saved reports
  const aggregatedData: AggregatedClassData | null = useMemo(() => {
    if (savedReports.length === 0) return null;

    const schoolName = savedReports[0].schoolName; // Assuming all reports are from the same school
    const totalStudents = savedReports.length;
    const ageGroupDistribution: { [key in AgeGroup]?: number } = {};
    const studentSummaries: { name: string; ageGroup: AgeGroup; strengthsCount: number; challengesCount: number; }[] = [];
    const commonStrengths: { [strength: string]: number } = {};
    const commonChallenges: { [challenge: string]: number } = {};
    let allInterviewAnswersText = '';

    savedReports.forEach(report => {
      // Age group distribution
      ageGroupDistribution[report.ageGroup] = (ageGroupDistribution[report.ageGroup] || 0) + 1;

      // Extract strengths and challenges counts
      const strengthsMatch = report.reportMarkdown.match(/💪 \[(.*?)]/g);
      const challengesMatch = report.reportMarkdown.match(/🚧 \[(.*?)]/g);
      const currentStrengthsCount = strengthsMatch ? strengthsMatch.length : 0;
      const currentChallengesCount = challengesMatch ? challengesMatch.length : 0;

      studentSummaries.push({
        name: report.studentName,
        ageGroup: report.ageGroup,
        strengthsCount: currentStrengthsCount,
        challengesCount: currentChallengesCount,
      });

      // Aggregate common strengths
      strengthsMatch?.forEach(s => {
        const strengthName = s.replace('💪 [', '').replace(']', '').trim();
        commonStrengths[strengthName] = (commonStrengths[strengthName] || 0) + 1;
      });

      // Aggregate common challenges
      challengesMatch?.forEach(c => {
        const challengeName = c.replace('🚧 [', '').replace(']', '').trim();
        commonChallenges[challengeName] = (commonChallenges[challengeName] || 0) + 1;
      });

      // Combine all interview answers text
      report.interviewAnswers.forEach(ans => {
        allInterviewAnswersText += `${ans.topic}: ${ans.answers.join(' ')}\n`;
      });
    });

    return {
      schoolName,
      totalStudents,
      ageGroupDistribution,
      studentSummaries,
      commonStrengths,
      commonChallenges,
      allInterviewAnswersText,
    };
  }, [savedReports]);

  // Determine if age groups are mixed or uniform
  const isAgeGroupMixed = useMemo(() => {
    if (!aggregatedData) return false;
    const uniqueAgeGroups = Object.keys(aggregatedData.ageGroupDistribution).length;
    return uniqueAgeGroups > 1;
  }, [aggregatedData]);

  const generateProfile = useCallback(async (targetAgeGroup: AgeGroup | 'mixed') => {
    if (!aggregatedData) {
      setError("אין נתונים זמינים ליצירת פרופיל כיתתי.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setClassProfileMarkdown(null);

    try {
      let interventionBank: InterventionBank;
      if (targetAgeGroup === AgeGroup.ELEMENTARY) {
        interventionBank = elementaryBank;
      } else if (targetAgeGroup === AgeGroup.HIGH_SCHOOL) {
        interventionBank = highSchoolBank;
      } else { // Mixed age groups, default to High School bank or a combined approach if possible
        interventionBank = highSchoolBank; // Defaulting to high school for broader concepts
      }
      setCurrentInterventionBank(interventionBank);

      const markdown = await generateClassProfile(
        aggregatedData,
        interventionBank,
        targetAgeGroup,
      );
      setClassProfileMarkdown(markdown);
    } catch (err: any) {
      console.error("Error generating class profile:", err);
      setError(`אירעה שגיאה ביצירת הפרופיל הכיתתי: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [aggregatedData, elementaryBank, highSchoolBank]);


  // Handle age group selection for recommendations
  const handleSelectAgeGroupForRecommendations = useCallback((ageGroup: AgeGroup) => {
    setSelectedAgeGroupForRecommendations(ageGroup);
    generateProfile(ageGroup); // Immediately generate after selection
  }, [generateProfile]);

  // Initial generation logic if not mixed or if already selected
  // Add `useEffect` import from React
  useEffect(() => {
    if (aggregatedData && !isAgeGroupMixed && !classProfileMarkdown && !isLoading) {
      // If uniform age group, generate immediately
      const singleAgeGroup = Object.keys(aggregatedData.ageGroupDistribution)[0] as AgeGroup;
      setSelectedAgeGroupForRecommendations(singleAgeGroup);
      generateProfile(singleAgeGroup);
    } else if (isAgeGroupMixed && selectedAgeGroupForRecommendations === null && !classProfileMarkdown && !isLoading) {
      // If mixed, prompt for selection, but for the initial render, let's not block everything.
      // The AgeGroupSelector will appear, which will then trigger generation.
    }
  }, [aggregatedData, isAgeGroupMixed, classProfileMarkdown, isLoading, generateProfile, selectedAgeGroupForRecommendations]);


  if (savedReports.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl mx-auto my-8 text-center border border-purple-100">
        <h2 className="text-3xl font-bold mb-5 text-purple-800">אין דוחות תלמידים שמורים</h2>
        <p className="text-gray-600 mb-7 text-lg">כדי ליצור פרופיל כיתתי, עליך לשמור לפחות דוח תלמיד אחד.</p>
        <button
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105"
        >
          חזור למסך הראשי
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl max-w-4xl mx-auto my-8 border border-teal-100">
      <h2 className="text-3xl font-bold mb-6 text-center text-teal-900">
        🧑‍🏫 יצירת פרופיל כיתתי
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isLoading && <Loader />}

      {!classProfileMarkdown && !isLoading && isAgeGroupMixed && selectedAgeGroupForRecommendations === null && (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto my-8">
          <h3 className="text-2xl font-bold mb-5 text-center text-purple-800">בחר/י קבוצת גיל להמלצות המערכתיות</h3>
          <p className="text-gray-600 mb-7 text-center text-lg">
            נמצאו תלמידים מקבוצות גיל שונות. אנא בחר/י קבוצת גיל אליה תתייחסנה ההמלצות המערכתיות בפרט.
          </p>
          <AgeGroupSelector onSelect={handleSelectAgeGroupForRecommendations} />
        </div>
      )}

      {classProfileMarkdown && !isLoading && (
        <ReportDisplay
          markdownContent={classProfileMarkdown}
          onStartNewInterview={onBack} // Back to main menu
          studentName={aggregatedData?.schoolName || 'פרופיל כיתה'} // Use school name as primary identifier
          studentClass="" // Not relevant for class profile
          studentAge="" // Not relevant for class profile
          isViewingSavedReport={false} // This is a new generated report, not a saved student one
          interventionBank={currentInterventionBank}
        />
      )}

      {!classProfileMarkdown && !isLoading && !isAgeGroupMixed && selectedAgeGroupForRecommendations !== null && (
        <p className="text-center text-gray-600 text-lg mt-4">
          מכין את הנתונים ליצירת פרופיל כיתתי...
        </p>
      )}

      {/* Back button visible until report is displayed, or if there's an error before report */}
      {(!classProfileMarkdown || error) && !isLoading && (
        <div className="text-center mt-8">
          <button
            onClick={onBack}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105"
          >
            חזור למסך הראשי
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassProfileGenerator;