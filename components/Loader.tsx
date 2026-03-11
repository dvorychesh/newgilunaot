import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4 gap-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
      <p className="text-base text-cyan-600 font-semibold">מעבד את הנתונים...</p>
    </div>
  );
};

export default Loader;
