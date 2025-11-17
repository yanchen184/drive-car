import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import { Star } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

/**
 * Level completion modal with animated star rating
 */
const LevelComplete = ({
  isOpen,
  stars = 1,
  totalScore = 0,
  breakdown = {},
  onNextLevel,
  onRetry,
  onHome
}) => {
  const starsRef = useRef([]);
  const scoreRef = useRef(null);
  const breakdownRef = useRef([]);

  useEffect(() => {
    if (!isOpen) return;

    const timeline = gsap.timeline({ delay: 0.3 });

    timeline.fromTo(
      starsRef.current,
      { scale: 0, rotation: -180 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: 'back.out(1.7)'
      }
    );

    if (scoreRef.current) {
      timeline.fromTo(
        scoreRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3 },
        '-=0.2'
      );
    }

    timeline.fromTo(
      breakdownRef.current,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.1
      },
      '-=0.2'
    );

    return () => {
      timeline.kill();
    };
  }, [isOpen]);

  const renderStars = () => {
    const starElements = [];
    for (let i = 0; i < 3; i++) {
      const isFilled = i < stars;
      starElements.push(
        <div
          key={i}
          ref={(el) => (starsRef.current[i] = el)}
          className="inline-block"
        >
          <Star
            size={64}
            className={
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-600 text-gray-600'
            }
          />
        </div>
      );
    }
    return starElements;
  };

  const getMessage = () => {
    if (stars === 3) return 'Perfect Parking!';
    if (stars === 2) return 'Good Job!';
    return 'Level Complete!';
  };

  const getMessageColor = () => {
    if (stars === 3) return 'text-yellow-400';
    if (stars === 2) return 'text-green-400';
    return 'text-blue-400';
  };

  return (
    <Modal isOpen={isOpen} onClose={null} size="medium" closeOnBackdrop={false}>
      <div className="p-8 text-center">
        <h2 className={'text-4xl font-bold mb-6 ' + getMessageColor()}>
          {getMessage()}
        </h2>

        <div className="flex justify-center gap-4 mb-8">
          {renderStars()}
        </div>

        <div ref={scoreRef} className="mb-8">
          <div className="text-6xl font-bold text-white mb-2">
            {Math.round(totalScore)}
          </div>
          <div className="text-xl text-gray-400">
            Total Score
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-6 mb-8 space-y-3">
          <div ref={(el) => (breakdownRef.current[0] = el)} className="flex justify-between items-center">
            <span className="text-gray-300">Accuracy:</span>
            <span className="text-white font-semibold">{Math.round(breakdown.accuracy || 0)}%</span>
          </div>
          <div ref={(el) => (breakdownRef.current[1] = el)} className="flex justify-between items-center">
            <span className="text-gray-300">Time:</span>
            <span className="text-white font-semibold">{(breakdown.timeTaken || 0).toFixed(1)}s</span>
          </div>
          <div ref={(el) => (breakdownRef.current[2] = el)} className="flex justify-between items-center">
            <span className="text-gray-300">Collisions:</span>
            <span className="text-white font-semibold">{breakdown.collisions || 0}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="success" size="large" onClick={onNextLevel}>
            Next Level
          </Button>
          <Button variant="ghost" size="large" onClick={onRetry}>
            Retry
          </Button>
          <Button variant="secondary" size="large" onClick={onHome}>
            Home
          </Button>
        </div>
      </div>
    </Modal>
  );
};

LevelComplete.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  stars: PropTypes.number,
  totalScore: PropTypes.number,
  breakdown: PropTypes.shape({
    accuracy: PropTypes.number,
    timeTaken: PropTypes.number,
    collisions: PropTypes.number
  }),
  onNextLevel: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
  onHome: PropTypes.func.isRequired
};

export default LevelComplete;
