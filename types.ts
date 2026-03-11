import { FunctionDeclaration } from '@google/genai';

export enum AgeGroup {
  ELEMENTARY = 'elementary',
  HIGH_SCHOOL = 'high_school',
}

export interface Question {
  key: string;
  topic: string;
  text: string;
  example?: string; // New: Optional example text for the input field
}

export interface InterviewAnswer {
  questionKey: string;
  topic: string; // Add topic to easily pass to AI
  answers: string[]; // To store initial answer and follow-up answer
}

export interface InterventionTool {
  name: string;
  description: string;
}

export interface InterventionCategory {
  name: string;
  tools: InterventionTool[];
}

export interface InterventionBank {
  didactic: InterventionCategory;
  emotional: InterventionCategory;
  social: InterventionCategory;
  behavioral: InterventionCategory;
}

export interface AIAssessmentResponse {
  status: 'PASS' | 'FAIL';
  follow_up_question?: string;
}

export interface AIPromptData {
  role: string;
  goal: string;
  inputs: {
    topic: string;
    userAnswer: string;
  };
  task: string;
  outputJsonSchema: string;
  constraints: string[];
}

export interface AIMetadata {
  systemInstruction: string;
  tools?: { functionDeclarations: FunctionDeclaration[] }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CompletedInterview {
  id: string; // Unique ID for each saved report
  timestamp: number; // For sorting/displaying when saved
  schoolName: string;
  studentName: string;
  studentClass: string;
  studentAge: string;
  ageGroup: AgeGroup;
  interviewAnswers: InterviewAnswer[];
  reportMarkdown: string;
  followUpQuestionsCount: number; // New: To track how many follow-up questions were asked
}

export interface AggregatedClassData {
  schoolName: string; // Assuming all students are from the same school for a class profile
  totalStudents: number;
  ageGroupDistribution: { [key in AgeGroup]?: number };
  studentSummaries: { name: string; ageGroup: AgeGroup; strengthsCount: number; challengesCount: number; }[];
  commonStrengths: { [strength: string]: number }; // e.g., "מתמטיקה": 5 (count of students with this strength)
  commonChallenges: { [challenge: string]: number }; // e.g., "קשיי קשב": 3 (count of students with this challenge)
  allInterviewAnswersText: string; // Combined text of all answers for deeper analysis
}

export interface AppState {
  entryMode: 'select_mode' | 'manual_entry' | 'excel_upload' | 'view_saved_interviews' | 'dashboard' | 'class_profile_generator' | null;
  schoolName: string | null;
  studentName: string | null;
  studentClass: string | null;
  studentAge: string | null;
  ageGroup: AgeGroup | null;
  interviewAnswers: InterviewAnswer[];
  currentQuestionIndex: number;
  followUpQuestion: string | null;
  reportMarkdown: string | null;
  isExcelFlow: boolean;
  savedReports: CompletedInterview[]; // New field to store all completed reports
  viewingSavedReport: boolean; // Indicates if the current report is from savedReports
  followUpQuestionsCount: number; // New: To track how many follow-up questions were asked in the current interview
}