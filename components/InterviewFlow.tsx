import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import Loader from './Loader';

interface InterviewFlowProps {
  currentQuestion: Question;
  followUpQuestion: string | null;
  onAnswerSubmit: (answer: string) => void;
  isLoading: boolean;
  isLastQuestion: boolean;
}

const InterviewFlow: React.FC<InterviewFlowProps> = ({
  currentQuestion,
  followUpQuestion,
  onAnswerSubmit,
  isLoading,
  isLastQuestion,
}) => {
  const [currentInput, setCurrentInput] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Reset input when question changes
    setCurrentInput('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim() && !isLoading) {
      onAnswerSubmit(currentInput);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10">
        {/* Question Header */}
        <div className="mb-8">
          <div className="inline-block bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full px-4 py-2 mb-4">
            <span className="text-cyan-700 font-semibold text-sm">
              {followUpQuestion ? 'שאלת הרחבה' : `שאלה בנושא: ${currentQuestion.topic}`}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 leading-relaxed mb-4">
            {followUpQuestion || currentQuestion.text}
          </h2>
        </div>

        {/* Example Box */}
        {currentQuestion.example && !followUpQuestion && (
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-r-4 border-cyan-400 p-6 mb-8 rounded-xl">
            <p className="font-semibold mb-3 text-cyan-700 text-base flex items-center gap-2">
              💡 דוגמה והכוונה
            </p>
            <p className="text-slate-700 italic leading-relaxed">{currentQuestion.example}</p>
          </div>
        )}

        {/* Answer Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div className="space-y-2">
            <label className="block text-slate-600 text-sm font-semibold text-right">
              כתוב/כתבי את תשובתך בפרטות ובהרחבה:
            </label>
            <textarea
              ref={textareaRef}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="כתוב/כתבי את תשובתך כאן... (לפחות 20 תווים)"
              rows={8}
              className="w-full px-5 py-4 border border-slate-300 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors text-right leading-relaxed text-base placeholder-slate-400"
              disabled={isLoading}
              aria-label={followUpQuestion || currentQuestion.text}
            />
          </div>

          {/* Character Count */}
          <div className="flex justify-between items-center px-1">
            <span className={`text-sm ${currentInput.length >= 20 ? 'text-green-600' : 'text-slate-500'}`}>
              {currentInput.length} תווים
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105 flex items-center justify-center gap-2 ${
              !currentInput.trim() || isLoading ? 'opacity-60 cursor-not-allowed hover:scale-100' : ''
            }`}
            disabled={!currentInput.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <span>מעבד את התשובה...</span>
              </>
            ) : isLastQuestion ? (
              '✓ סיים וצור דוח'
            ) : (
              'המשך לשאלה הבאה →'
            )}
          </button>
        </form>

        {isLoading && (
          <div className="mt-8 flex justify-center">
            <Loader />
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 text-center text-slate-600 text-sm">
        <p>שאלה זו היא חלק מראיון פדגוגי מקיף בן 10 שאלות</p>
      </div>
    </div>
  );
};

export default InterviewFlow;