import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Square } from 'lucide-react';
import gsap from 'gsap';

const GearControls = ({ onGearChange, onBrake }) => {
  const [currentGear, setCurrentGear] = useState('N'); // N, D, R
  const [isPressed, setIsPressed] = useState({ forward: false, reverse: false, brake: false });
  const buttonsRef = useRef({});

  const handleGearPress = (gear, action) => {
    const isPress = action === 'press';

    if (isPress) {
      setCurrentGear(gear);
      onGearChange(gear);

      // Visual feedback
      gsap.to(buttonsRef.current[gear], {
        scale: 0.95,
        backgroundColor: gear === 'D' ? '#10B981' : gear === 'R' ? '#F59E0B' : '#EF4444',
        duration: 0.1,
        ease: 'power2.out'
      });

      // Haptic feedback for mobile
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    } else {
      setCurrentGear('N');
      onGearChange('N');

      // Reset visual
      gsap.to(buttonsRef.current[gear], {
        scale: 1,
        backgroundColor: '#374151',
        duration: 0.2,
        ease: 'elastic.out(1, 0.5)'
      });
    }

    setIsPressed(prev => ({
      ...prev,
      forward: gear === 'D' && isPress,
      reverse: gear === 'R' && isPress,
      brake: gear === 'B' && isPress
    }));
  };

  useEffect(() => {
    // Initialize button animations
    Object.values(buttonsRef.current).forEach(button => {
      if (button) {
        gsap.set(button, {
          scale: 1,
          backgroundColor: '#374151'
        });
      }
    });
  }, []);

  return (
    <div className="gear-controls flex flex-col gap-3 select-none">
      {/* Forward Button */}
      <button
        ref={el => buttonsRef.current['D'] = el}
        onMouseDown={() => handleGearPress('D', 'press')}
        onMouseUp={() => handleGearPress('D', 'release')}
        onMouseLeave={() => isPressed.forward && handleGearPress('D', 'release')}
        onTouchStart={(e) => {
          e.preventDefault();
          handleGearPress('D', 'press');
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleGearPress('D', 'release');
        }}
        className={`control-button relative ${isPressed.forward ? 'ring-4 ring-green-500' : ''}`}
        style={{
          boxShadow: isPressed.forward
            ? '0 0 20px rgba(16, 185, 129, 0.5)'
            : 'none'
        }}
      >
        <div className="flex flex-col items-center">
          <ChevronUp className="w-8 h-8 mb-1" />
          <span className="text-xs font-bold uppercase tracking-wider">Forward</span>
        </div>
        {isPressed.forward && (
          <div className="absolute inset-0 rounded-xl bg-green-500 opacity-20 animate-pulse" />
        )}
      </button>

      {/* Brake Button */}
      <button
        ref={el => buttonsRef.current['B'] = el}
        onMouseDown={() => {
          handleGearPress('B', 'press');
          onBrake(true);
        }}
        onMouseUp={() => {
          handleGearPress('B', 'release');
          onBrake(false);
        }}
        onMouseLeave={() => {
          if (isPressed.brake) {
            handleGearPress('B', 'release');
            onBrake(false);
          }
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          handleGearPress('B', 'press');
          onBrake(true);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleGearPress('B', 'release');
          onBrake(false);
        }}
        className={`control-button relative ${isPressed.brake ? 'ring-4 ring-red-500' : ''}`}
        style={{
          boxShadow: isPressed.brake
            ? '0 0 20px rgba(239, 68, 68, 0.5)'
            : 'none'
        }}
      >
        <div className="flex flex-col items-center">
          <Square className="w-6 h-6 mb-1" />
          <span className="text-xs font-bold uppercase tracking-wider">Brake</span>
        </div>
        {isPressed.brake && (
          <div className="absolute inset-0 rounded-xl bg-red-500 opacity-20 animate-pulse" />
        )}
      </button>

      {/* Reverse Button */}
      <button
        ref={el => buttonsRef.current['R'] = el}
        onMouseDown={() => handleGearPress('R', 'press')}
        onMouseUp={() => handleGearPress('R', 'release')}
        onMouseLeave={() => isPressed.reverse && handleGearPress('R', 'release')}
        onTouchStart={(e) => {
          e.preventDefault();
          handleGearPress('R', 'press');
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleGearPress('R', 'release');
        }}
        className={`control-button relative ${isPressed.reverse ? 'ring-4 ring-orange-500' : ''}`}
        style={{
          boxShadow: isPressed.reverse
            ? '0 0 20px rgba(245, 158, 11, 0.5)'
            : 'none'
        }}
      >
        <div className="flex flex-col items-center">
          <ChevronDown className="w-8 h-8 mb-1" />
          <span className="text-xs font-bold uppercase tracking-wider">Reverse</span>
        </div>
        {isPressed.reverse && (
          <div className="absolute inset-0 rounded-xl bg-orange-500 opacity-20 animate-pulse" />
        )}
      </button>

      {/* Gear Indicator */}
      <div className="mt-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
          <span className="text-xs text-gray-400">Gear:</span>
          <span className={`font-mono font-bold text-lg ${
            currentGear === 'D' ? 'text-green-400' :
            currentGear === 'R' ? 'text-orange-400' :
            currentGear === 'B' ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {currentGear}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GearControls;