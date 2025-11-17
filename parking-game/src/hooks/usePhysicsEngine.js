import { useRef, useEffect, useState } from 'react';
import { Engine, World } from 'matter-js';

/**
 * Custom hook for Matter.js physics engine lifecycle management
 *
 * CRITICAL: This hook manages the physics engine lifecycle
 * - Creates engine with gravity disabled (top-down 2D view)
 * - Properly cleans up on unmount to prevent memory leaks
 * - Uses useRef to store engine (never useState - prevents re-renders)
 *
 * @param {Object} options - Engine configuration options
 * @param {Object} options.gravity - Gravity settings (default: disabled)
 * @param {boolean} options.enableSleeping - Enable body sleeping (default: false)
 * @returns {Object} Physics engine refs and control functions
 */
const usePhysicsEngine = (options = {}) => {
  // CRITICAL: Use useRef for Matter.js objects (never useState)
  // Reason: Prevents re-renders and performance issues
  const engineRef = useRef(null);
  const worldRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Create Matter.js engine
    // CRITICAL: Disable gravity for top-down 2D parking game
    engineRef.current = Engine.create({
      gravity: options.gravity || { x: 0, y: 0, scale: 0 },
      enableSleeping: options.enableSleeping || false,
      ...options
    });

    worldRef.current = engineRef.current.world;

    // PATTERN: Cleanup on unmount - critical for preventing memory leaks
    return () => {
      if (engineRef.current) {
        // Remove all bodies from world
        World.clear(worldRef.current, false);

        // Clear engine
        Engine.clear(engineRef.current);

        // Nullify refs
        engineRef.current = null;
        worldRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  /**
   * Start the physics engine
   */
  const start = () => {
    setIsRunning(true);
  };

  /**
   * Stop the physics engine
   */
  const stop = () => {
    setIsRunning(false);
  };

  /**
   * Manual cleanup function (if needed before unmount)
   */
  const cleanup = () => {
    if (worldRef.current) {
      World.clear(worldRef.current, false);
    }
  };

  /**
   * Reset the physics world (clear all bodies)
   */
  const reset = () => {
    if (worldRef.current) {
      World.clear(worldRef.current, false);
    }
  };

  return {
    engineRef,
    worldRef,
    isRunning,
    start,
    stop,
    cleanup,
    reset
  };
};

export default usePhysicsEngine;
