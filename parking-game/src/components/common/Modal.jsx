import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';

/**
 * Reusable modal component with GSAP animations
 *
 * PATTERN: GSAP animations with cleanup
 * - Fade in backdrop
 * - Scale in modal content with bounce
 * - Cleanup timeline on unmount
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal visibility state
 * @param {Function} props.onClose - Close handler
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size
 * @param {boolean} props.closeOnBackdrop - Close on backdrop click
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'medium',
  closeOnBackdrop = true,
  className = ''
}) => {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const timelineRef = useRef(null);

  const sizes = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl'
  };

  useEffect(() => {
    if (!modalRef.current || !backdropRef.current) return;

    // Create GSAP timeline
    timelineRef.current = gsap.timeline();

    if (isOpen) {
      // Animate modal entrance
      timelineRef.current
        .fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: 'power2.out' }
        )
        .fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.8, y: -50 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.5)' },
          '-=0.1'
        );
    }

    // CRITICAL: Cleanup GSAP timeline on unmount
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) {
      // Animate exit before closing
      if (timelineRef.current && modalRef.current && backdropRef.current) {
        gsap.timeline()
          .to(modalRef.current, { opacity: 0, scale: 0.8, y: -30, duration: 0.2, ease: 'power2.in' })
          .to(backdropRef.current, { opacity: 0, duration: 0.15 }, '-=0.1')
          .then(() => onClose());
      } else {
        onClose();
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`relative bg-gray-800 rounded-xl shadow-2xl ${sizes[size]} w-full ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  closeOnBackdrop: PropTypes.bool,
  className: PropTypes.string
};

export default Modal;
