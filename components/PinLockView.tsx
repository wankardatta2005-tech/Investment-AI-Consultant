import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Delete } from 'lucide-react';

interface PinLockViewProps {
  correctPin: string;
  onUnlock: () => void;
  email: string;
}

const PinLockView: React.FC<PinLockViewProps> = ({ correctPin, onUnlock, email }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 400);
      }
    }
  }, [pin, correctPin, onUnlock]);

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center animate-in fade-in duration-500">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">System Locked</h2>
          <p className="text-gray-400 text-sm">Welcome back, {email}</p>
        </div>

        <div className="flex space-x-4 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                pin.length > i 
                  ? 'bg-primary-500 scale-110 shadow-[0_0_10px_#3b82f6]' 
                  : 'bg-gray-700'
              } ${error ? 'bg-red-500 animate-shake' : ''}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num.toString())}
              className="w-16 h-16 rounded-full bg-gray-800 text-white text-2xl font-bold hover:bg-gray-700 transition-colors flex items-center justify-center active:bg-primary-600/20"
            >
              {num}
            </button>
          ))}
          <div className="w-16 h-16"></div>
          <button
            onClick={() => handleNumClick('0')}
            className="w-16 h-16 rounded-full bg-gray-800 text-white text-2xl font-bold hover:bg-gray-700 transition-colors flex items-center justify-center active:bg-primary-600/20"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full text-gray-400 hover:text-white transition-colors flex items-center justify-center"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
        
        {error && <p className="text-red-500 text-sm font-medium animate-pulse">Incorrect PIN</p>}
      </div>
    </div>
  );
};

export default PinLockView;