import React, { useState, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import SteeringWheel from './SteeringWheel';

/**
 * 3D停车游戏控制界面
 * 左边：方向盘
 * 右边：油门和煞车按钮（垂直排列）
 */
const Car3DControls = ({ onSteer, onThrottle, onBrake }) => {
  const [isThrottlePressed, setIsThrottlePressed] = useState(false);
  const [isBrakePressed, setIsBrakePressed] = useState(false);
  const throttleRef = useRef(null);
  const brakeRef = useRef(null);

  // 油门按下
  const handleThrottlePress = (pressed) => {
    setIsThrottlePressed(pressed);
    onThrottle(pressed ? 1 : 0);

    if (throttleRef.current) {
      gsap.to(throttleRef.current, {
        scale: pressed ? 0.95 : 1,
        backgroundColor: pressed ? '#10B981' : '#374151',
        duration: 0.2,
        ease: 'power2.out'
      });
    }

    // 触觉反馈
    if (pressed && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  // 煞车按下
  const handleBrakePress = (pressed) => {
    setIsBrakePressed(pressed);
    onBrake(pressed);

    if (brakeRef.current) {
      gsap.to(brakeRef.current, {
        scale: pressed ? 0.95 : 1,
        backgroundColor: pressed ? '#EF4444' : '#374151',
        duration: 0.2,
        ease: 'power2.out'
      });
    }

    // 触觉反馈
    if (pressed && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end gap-4">
          {/* 左边：方向盘 */}
          <div className="flex-1 flex justify-center pointer-events-auto">
            <SteeringWheel onSteer={onSteer} maxAngle={180} />
          </div>

          {/* 右边：油门和煞车按钮（垂直排列） */}
          <div className="flex-1 flex justify-center pointer-events-auto">
            <div className="flex flex-col gap-4">
              {/* 油门按钮 */}
              <button
                ref={throttleRef}
                onMouseDown={() => handleThrottlePress(true)}
                onMouseUp={() => handleThrottlePress(false)}
                onMouseLeave={() => isThrottlePressed && handleThrottlePress(false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleThrottlePress(true);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleThrottlePress(false);
                }}
                className={`
                  w-32 h-32 md:w-40 md:h-40
                  rounded-2xl
                  bg-gray-700
                  flex flex-col items-center justify-center
                  transition-all duration-200
                  ${isThrottlePressed ? 'ring-4 ring-green-500 shadow-lg shadow-green-500/50' : ''}
                `}
                style={{
                  touchAction: 'none'
                }}
              >
                <ChevronUp className={`
                  w-16 h-16 mb-2
                  ${isThrottlePressed ? 'text-green-400' : 'text-white'}
                  transition-colors
                `} />
                <span className={`
                  text-lg font-bold uppercase tracking-wider
                  ${isThrottlePressed ? 'text-green-400' : 'text-white'}
                `}>
                  油門
                </span>
                <span className="text-xs text-gray-400 mt-1">THROTTLE</span>
              </button>

              {/* 煞車按鈕 */}
              <button
                ref={brakeRef}
                onMouseDown={() => handleBrakePress(true)}
                onMouseUp={() => handleBrakePress(false)}
                onMouseLeave={() => isBrakePressed && handleBrakePress(false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleBrakePress(true);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleBrakePress(false);
                }}
                className={`
                  w-32 h-32 md:w-40 md:h-40
                  rounded-2xl
                  bg-gray-700
                  flex flex-col items-center justify-center
                  transition-all duration-200
                  ${isBrakePressed ? 'ring-4 ring-red-500 shadow-lg shadow-red-500/50' : ''}
                `}
                style={{
                  touchAction: 'none'
                }}
              >
                <ChevronDown className={`
                  w-16 h-16 mb-2
                  ${isBrakePressed ? 'text-red-400' : 'text-white'}
                  transition-colors
                `} />
                <span className={`
                  text-lg font-bold uppercase tracking-wider
                  ${isBrakePressed ? 'text-red-400' : 'text-white'}
                `}>
                  煞車
                </span>
                <span className="text-xs text-gray-400 mt-1">BRAKE</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 控制说明 */}
      <div className="text-center mt-4 text-xs text-gray-400 pointer-events-none">
        <p>🎮 鍵盤：W/↑ 油門 | S/↓ 煞車 | A/← D/→ 轉向 | 空白鍵 煞車</p>
      </div>
    </div>
  );
};

export default Car3DControls;
