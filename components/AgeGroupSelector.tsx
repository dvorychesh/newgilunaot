import React from 'react';
import { AgeGroup } from '../types';

interface AgeGroupSelectorProps {
  onSelect: (ageGroup: AgeGroup) => void;
}

const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({ onSelect }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto my-8">
      <h2 className="text-3xl font-bold mb-5 text-center text-purple-800">בחר שכבת גיל</h2>
      <p className="text-gray-600 mb-7 text-center text-lg">בחירה זו תקבע את בנק ההתערבויות הרלוונטי לניתוח.</p>
      <div className="flex flex-col space-y-5">
        <button
          onClick={() => onSelect(AgeGroup.ELEMENTARY)}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-4 px-6 rounded-xl text-xl transition duration-300 ease-in-out shadow-lg transform hover:scale-105"
        >
          🎒 יסודי
        </button>
        <button
          onClick={() => onSelect(AgeGroup.HIGH_SCHOOL)}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-6 rounded-xl text-xl transition duration-300 ease-in-out shadow-lg transform hover:scale-105"
        >
          🎓 על-יסודי
        </button>
      </div>
    </div>
  );
};

export default AgeGroupSelector;