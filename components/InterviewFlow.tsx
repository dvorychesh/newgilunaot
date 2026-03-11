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
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto my-8 border border-purple-100">
      <h2 className="text-2xl font-bold mb-4 text-purple-800 text-center">
        {followUpQuestion ? 'שאלת הרחבה:' : `שאלה בנושא: ${currentQuestion.topic}`}
      </h2>
      <p className="text-gray-700 mb-6 text-lg text-center leading-relaxed">
        {followUpQuestion || currentQuestion.text}
      </p>

      {currentQuestion.example && !followUpQuestion && ( // Display example only for main questions
        <div className="bg-purple-50 border-r-4 border-purple-400 p-4 mb-6 rounded-lg text-sm text-gray-700 italic">
          <p className="font-semibold mb-2 text-purple-700">דוגמה והכוונה:</p>
          <p>{currentQuestion.example}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col">
        <textarea
          ref={textareaRef}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="כתוב/כתבי את תשובתך כאן..."
          rows={7}
          className="w-full p-4 border border-gray-300 rounded-lg mb-6 resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 text-right leading-relaxed text-base"
          disabled={isLoading}
          aria-label={followUpQuestion || currentQuestion.text}
        ></textarea>
        <button
          type="submit"
          className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105 ${
            !currentInput.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!currentInput.trim() || isLoading}
        >
          {isLoading ? (
            <Loader />
          ) : (
            isLastQuestion ? 'סיים וצור דוח' : 'המשך לשאלה הבאה'
          )}
        </button>
      </form>
      {isLoading && <Loader />}
    </div>
  );
};

export default InterviewFlow;