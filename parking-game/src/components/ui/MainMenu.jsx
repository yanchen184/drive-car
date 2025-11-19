import React, { useEffect, useRef } from 'react';
import { Car, Trophy, Settings, Volume2, Info, Play } from 'lucide-react';
import gsap from 'gsap';

const MainMenu = ({ onStartGame, onTutorial, onSettings, onLeaderboard }) => {
  const titleRef = useRef(null);
  const buttonsRef = useRef([]);
  const carIconRef = useRef(null);

  useEffect(() => {
    // Title animation
    gsap.fromTo(titleRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    // Car icon floating animation
    gsap.to(carIconRef.current, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });

    // Buttons stagger animation
    gsap.fromTo(buttonsRef.current,
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3
      }
    );
  }, []);

  const handleButtonClick = (handler) => {
    // Button click animation
    gsap.to('.main-menu', {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: handler
    });
  };

  return (
    <div className="main-menu min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:60px_60px] animate-[slide_20s_linear_infinite]" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-md w-full">
        {/* Title Section */}
        <div ref={titleRef} className="text-center mb-12">
          <div ref={carIconRef} className="inline-block mb-4">
            <Car className="w-20 h-20 text-blue-400 mx-auto" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black gradient-text mb-2">
            PARKING
          </h1>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-blue-400">
            MASTER
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            Learn to park like a pro!
          </p>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-4">
          <button
            ref={(el) => buttonsRef.current[0] = el}
            onClick={() => handleButtonClick(onStartGame)}
            className="w-full btn btn-primary group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-400 transition-all duration-300" />
            <span className="relative flex items-center justify-center gap-3">
              <Play className="w-5 h-5" />
              <span className="text-lg font-bold">START GAME</span>
            </span>
          </button>

          <button
            ref={(el) => buttonsRef.current[1] = el}
            onClick={() => handleButtonClick(onTutorial)}
            className="w-full btn btn-secondary group"
          >
            <Info className="w-5 h-5 mr-3" />
            <span className="font-semibold">TUTORIAL</span>
          </button>

          <button
            ref={(el) => buttonsRef.current[2] = el}
            onClick={() => handleButtonClick(onLeaderboard)}
            className="w-full btn btn-secondary group"
          >
            <Trophy className="w-5 h-5 mr-3 text-yellow-400" />
            <span className="font-semibold">LEADERBOARD</span>
          </button>

          <button
            ref={(el) => buttonsRef.current[3] = el}
            onClick={() => handleButtonClick(onSettings)}
            className="w-full btn btn-secondary group"
          >
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-semibold">SETTINGS</span>
          </button>
        </div>

        {/* Bottom Toolbar */}
        <div className="flex justify-center gap-6 mt-12">
          <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            <Volume2 className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            <Info className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Version Info */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-600">
        v3.1.0
      </div>
    </div>
  );
};

export default MainMenu;