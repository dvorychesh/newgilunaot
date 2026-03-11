import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      <p className="mr-3 text-lg text-purple-700">אנו מעבדים את הנתונים, הפעולה עשויה לקחת מספר שניות...</p>
    </div>
  );
};

export default Loader;
