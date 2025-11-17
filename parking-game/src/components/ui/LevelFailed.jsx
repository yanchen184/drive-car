import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import { XCircle, RotateCcw, Home } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

/**
 * Level failed modal
 *
 * PATTERN: GSAP fade in with slight shake effect
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {string} props.reason - Failure reason
 * @param {Object} props.stats - Current level stats
 * @param {Function} props.onRetry - Retry handler
 * @param {Function} props.onHome - Home handler
 */
const LevelFailed = ({
  isOpen,
  reason = 'Level failed',
  stats = {},
  onRetry,
  onHome
}) => {
  const contentRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !contentRef.current || !iconRef.current) return;

    // Shake animation for icon
    const timeline = gsap.timeline({ delay: 0.3 });

    timeline
      .fromTo(
        iconRef.current,
        { scale: 0, rotation: -90 },
        { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(1.5)' }
      )
      .to(iconRef.current, {
        x: -5,
        duration: 0.05,
        repeat: 5,
        yoyo: true,
        ease: 'power1.inOut'
      })
      .fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3 },
        '-=0.2'
      );

    // CRITICAL: Cleanup timeline
    return () => {
      timeline.kill();
    };
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={null} size="medium" closeOnBackdrop={false}>
      <div className="p-8 text-center">
        {/* Failure Icon */}
        <div ref={iconRef} className="flex justify-center mb-6">
          <XCircle size={80} className="text-red-500" />
        </div>

        {/* Title */}
        <h2 className="text-4xl font-bold text-red-400 mb-4">
          Level Failed
        </h2>

        {/* Reason */}
        <div className="text-xl text-gray-300 mb-8">
          {reason}
        </div>

        {/* Stats */}
        <div ref={contentRef} className="bg-gray-900/50 rounded-lg p-6 mb-8 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Time Elapsed:</span>
            <span className="text-white font-semibold">
              {(stats.timeTaken || 0).toFixed(1)}s
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Collisions:</span>
            <span className="text-white font-semibold">
              {stats.collisions || 0}
            </span>
          </div>
          {stats.accuracy !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Best Accuracy:</span>
              <span className="text-white font-semibold">
                {Math.round(stats.accuracy)}%
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="warning"
            size="large"
            onClick={onRetry}
            className="flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Try Again
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={onHome}
            className="flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Home
          </Button>
        </div>
      </div>
    </Modal>
  );
};

LevelFailed.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  reason: PropTypes.string,
  stats: PropTypes.shape({
    timeTaken: PropTypes.number,
    collisions: PropTypes.number,
    accuracy: PropTypes.number
  }),
  onRetry: PropTypes.func.isRequired,
  onHome: PropTypes.func.isRequired
};

export default LevelFailed;
