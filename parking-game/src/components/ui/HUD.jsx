import React, { useEffect, useRef } from 'react';
import { Pause, RotateCcw, Home, Timer, Target, Gauge } from 'lucide-react';
import gsap from 'gsap';

const HUD = ({
  level = 1,
  time = 0,
  score = 0,
  speed = 0,
  maxSpeed = 30,
  accuracy = 0,
  onPause,
  onRestart,
  onHome
}) => {
  const speedBarRef = useRef(null);
  const accuracyRef = useRef(null);

  useEffect(() => {
    // Animate speed bar
    const speedPercent = Math.min((speed / maxSpeed) * 100, 100);
    gsap.to(speedBarRef.current, {
      width: `${speedPercent}%`,
      duration: 0.2,
      ease: 'power2.out'
    });
  }, [speed, maxSpeed]);

  useEffect(() => {
    // Animate accuracy indicator
    if (accuracy > 0) {
      gsap.fromTo(accuracyRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [accuracy]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeedColor = () => {
    const percent = (speed / maxSpeed) * 100;
    if (percent < 33) return 'bg-green-500';
    if (percent < 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAccuracyColor = () => {
    if (accuracy >= 90) return 'text-green-400';
    if (accuracy >= 70) return 'text-yellow-400';
    if (accuracy >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="hud relative">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20">
        {/* Left Section - Level Info */}
        <div className="hud-element flex items-center gap-3">
          <span className="text-gray-400 text-xs">LEVEL</span>
          <span className="text-2xl font-bold font-mono text-blue-400">{level.toString().padStart(2, '0')}</span>
        </div>

        {/* Center Section - Timer and Score */}
        <div className="flex flex-col items-center gap-2">
          <div className="hud-element flex items-center gap-2">
            <Timer className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-lg text-white">{formatTime(time)}</span>
          </div>
          <div className="hud-element flex items-center gap-2">
            <span className="text-xs text-gray-400">SCORE</span>
            <span className="font-mono font-bold text-yellow-400">{score}</span>
          </div>
        </div>

        {/* Right Section - Controls */}
        <div className="flex gap-2">
          <button
            onClick={onHome}
            className="hud-element p-2 hover:bg-gray-700 transition-colors rounded-lg"
            aria-label="Home"
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            onClick={onRestart}
            className="hud-element p-2 hover:bg-gray-700 transition-colors rounded-lg"
            aria-label="Restart"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={onPause}
            className="hud-element p-2 hover:bg-gray-700 transition-colors rounded-lg"
            aria-label="Pause"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Section - Speed and Accuracy */}
      <div className="absolute bottom-20 left-0 right-0 px-4">
        {/* Speed Indicator */}
        <div className="mb-4">
          <div className="hud-element max-w-md mx-auto p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400 uppercase">Speed</span>
              </div>
              <span className="font-mono font-bold text-white">
                {Math.round(speed)} <span className="text-xs text-gray-400">km/h</span>
              </span>
            </div>
            <div className="speed-bar h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                ref={speedBarRef}
                className={`speed-fill h-full ${getSpeedColor()} transition-colors duration-300`}
                style={{ width: '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Parking Accuracy (shows when parking) */}
        {accuracy > 0 && (
          <div ref={accuracyRef} className="hud-element max-w-md mx-auto p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400 uppercase">Accuracy</span>
              </div>
              <span className={`font-mono font-bold text-2xl ${getAccuracyColor()}`}>
                {Math.round(accuracy)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Distance Guide Lines (optional) */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
        <div className="flex flex-col gap-2">
          {[3, 2, 1, 0.5].map(distance => (
            <div key={distance} className="hud-element px-2 py-1 text-xs">
              <span className="text-gray-400">{distance}m</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HUD;