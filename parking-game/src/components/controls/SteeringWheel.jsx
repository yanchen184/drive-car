import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';

const SteeringWheel = ({ onSteer, maxAngle = 180 }) => {
  const wheelRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const startAngleRef = useRef(0);
  const centerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Calculate wheel center on mount and resize
    const updateCenter = () => {
      if (wheelRef.current) {
        const rect = wheelRef.current.getBoundingClientRect();
        centerRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }
    };

    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  const calculateAngle = (clientX, clientY) => {
    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    return angle;
  };

  const handleStart = (e) => {
    e.preventDefault();
    setIsDragging(true);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Update center position at start of drag
    if (wheelRef.current) {
      const rect = wheelRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    startAngleRef.current = calculateAngle(clientX, clientY) - currentAngle;

    // Add visual feedback
    gsap.to(wheelRef.current, {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let newAngle = calculateAngle(clientX, clientY) - startAngleRef.current;

    // Normalize angle to -180 to 180 range
    while (newAngle > 180) newAngle -= 360;
    while (newAngle < -180) newAngle += 360;

    // Clamp angle to max rotation
    newAngle = Math.max(-maxAngle, Math.min(maxAngle, newAngle));

    setCurrentAngle(newAngle);
    onSteer(newAngle / maxAngle); // Normalize to -1 to 1

    // Apply rotation with GSAP
    gsap.set(wheelRef.current, {
      rotation: newAngle,
      ease: 'none'
    });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Spring back to center
    gsap.to(wheelRef.current, {
      rotation: 0,
      scale: 1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
      onUpdate: function() {
        const progress = this.progress();
        const angle = currentAngle * (1 - progress);
        setCurrentAngle(angle);
        onSteer(angle / maxAngle);
      }
    });
  };

  useEffect(() => {
    // Add global event listeners for drag
    const handleGlobalMove = (e) => handleMove(e);
    const handleGlobalEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMove);
      document.addEventListener('mouseup', handleGlobalEnd);
      document.addEventListener('touchmove', handleGlobalMove, { passive: false });
      document.addEventListener('touchend', handleGlobalEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging, currentAngle]);

  return (
    <div className="steering-container relative">
      {/* Angle Indicator */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono text-gray-400">
        {Math.round(currentAngle)}°
      </div>

      {/* Steering Wheel */}
      <div
        ref={wheelRef}
        className="steering-wheel relative w-32 h-32 md:w-40 md:h-40 cursor-grab active:cursor-grabbing"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{
          background: 'radial-gradient(circle at 30% 30%, #374151, #1F2937)',
          boxShadow: isDragging
            ? '0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(0,0,0,0.5)'
            : 'inset 0 0 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Center hub */}
        <div className="absolute inset-4 rounded-full bg-gray-900 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600" />
        </div>

        {/* Grip indicators */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-blue-500 rounded-full opacity-50" />
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-blue-500 rounded-full opacity-50" />
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-blue-500 rounded-full opacity-50" />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-blue-500 rounded-full opacity-50" />

        {/* Direction indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-red-500 rounded-full" />
      </div>

      {/* Visual feedback rings */}
      <div className="absolute inset-0 rounded-full pointer-events-none">
        <div className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
          isDragging ? 'border-blue-400 animate-pulse' : 'border-transparent'
        }`} />
      </div>
    </div>
  );
};

export default SteeringWheel;