import React from 'react';
import PropTypes from 'prop-types';
import { Play, RotateCcw, Settings, Home } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

/**
 * Pause menu modal
 *
 * TRIGGER: Pause button in HUD
 * CRITICAL: Stop physics engine when paused, resume on unpause
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Object} props.stats - Current level stats
 * @param {Function} props.onResume - Resume handler
 * @param {Function} props.onRestart - Restart handler
 * @param {Function} props.onSettings - Settings handler
 * @param {Function} props.onHome - Home handler
 */
const PauseMenu = ({
  isOpen,
  stats = {},
  onResume,
  onRestart,
  onSettings,
  onHome
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onResume} size="medium">
      <div className="p-8">
        {/* Title */}
        <h2 className="text-4xl font-bold text-center text-white mb-8">
          Paused
        </h2>

        {/* Current Stats */}
        <div className="bg-gray-900/50 rounded-lg p-6 mb-8 space-y-3">
          <div className="text-center text-gray-400 mb-4">Current Progress</div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Time:</span>
            <span className="text-white font-semibold">
              {(stats.time || 0).toFixed(1)}s
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Speed:</span>
            <span className="text-white font-semibold">
              {Math.round(stats.speed || 0)} km/h
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Collisions:</span>
            <span className="text-white font-semibold">
              {stats.collisions || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Accuracy:</span>
            <span className="text-white font-semibold">
              {Math.round(stats.accuracy || 0)}%
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            variant="success"
            size="large"
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2"
          >
            <Play size={20} />
            Resume
          </Button>
          <Button
            variant="warning"
            size="large"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Restart Level
          </Button>
          <Button
            variant="ghost"
            size="large"
            onClick={onSettings}
            className="w-full flex items-center justify-center gap-2"
          >
            <Settings size={20} />
            Settings
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={onHome}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Main Menu
          </Button>
        </div>
      </div>
    </Modal>
  );
};

PauseMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  stats: PropTypes.shape({
    time: PropTypes.number,
    speed: PropTypes.number,
    collisions: PropTypes.number,
    accuracy: PropTypes.number
  }),
  onResume: PropTypes.func.isRequired,
  onRestart: PropTypes.func.isRequired,
  onSettings: PropTypes.func.isRequired,
  onHome: PropTypes.func.isRequired
};

export default PauseMenu;
