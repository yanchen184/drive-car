import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import { ChevronRight, X } from 'lucide-react';
import Button from '../common/Button';

/**
 * Tutorial overlay for Level 1
 *
 * PATTERN: GSAP fade transitions between steps
 * Auto-hide after showing all steps or manual dismiss
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Tutorial visibility
 * @param {Array<string>} props.steps - Tutorial steps/hints
 * @param {Function} props.onClose - Close handler
 */
const Tutorial = ({
  isOpen,
  steps = [],
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    // Fade in animation when step changes
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Fade out before changing step
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.2,
        onComplete: () => setCurrentStep(currentStep + 1)
      });
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    if (onClose) {
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.2,
        onComplete: onClose
      });
    }
  };

  if (!isOpen || steps.length === 0) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 pointer-events-none">
      {/* Semi-transparent backdrop (subtle, doesn't block game view) */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Tutorial card */}
      <div
        ref={contentRef}
        className="relative bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full p-6 pointer-events-auto border-2 border-blue-500/50"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Tutorial icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {currentStep + 1}
          </div>
          <h3 className="text-xl font-bold text-white">
            Tutorial
          </h3>
        </div>

        {/* Step content */}
        <div className="text-gray-200 text-lg mb-6 leading-relaxed">
          {steps[currentStep]}
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>
          <Button
            variant="primary"
            size="medium"
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            {currentStep < steps.length - 1 ? (
              <>
                Next <ChevronRight size={18} />
              </>
            ) : (
              'Got it!'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

Tutorial.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  steps: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired
};

export default Tutorial;
