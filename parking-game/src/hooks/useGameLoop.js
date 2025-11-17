import { useEffect, useRef } from 'react';
import { Engine } from 'matter-js';
import { GAME } from '../data/constants';

/**
 * Fixed timestep game loop hook
 *
 * CRITICAL: Implements fixed timestep pattern for consistent physics
 * Reference: https://codeincomplete.com/articles/javascript-game-foundations-the-game-loop/
 *
 * Why fixed timestep:
 * - Variable timestep causes physics to behave differently on different devices
 * - 60 FPS on one device vs 30 FPS on another = different game speed
 * - Fixed timestep = same physics simulation regardless of frame rate
 *
 * How it works:
 * - Target: 60 FPS = 16.67ms per frame
 * - Use accumulator pattern to handle variable frame times
 * - Update physics in chunks of fixed TIMESTEP
 * - Render after physics updates (can be variable rate)
 *
 * @param {Object} engineRef - Matter.js engine ref from usePhysicsEngine
 * @param {Function} onUpdate - Callback for each render frame
 * @param {boolean} isActive - Whether the game loop should run
 */
const useGameLoop = (engineRef, onUpdate, isActive) => {
  const frameIdRef = useRef(null);
  const lastTimeRef = useRef(null);
  const accumulatorRef = useRef(0);

  useEffect(() => {
    // Don't run loop if inactive or no engine
    if (!isActive || !engineRef.current) {
      return;
    }

    /**
     * Main game loop function
     * @param {number} currentTime - Current timestamp from requestAnimationFrame
     */
    const gameLoop = (currentTime) => {
      // Initialize lastTimeRef on first run
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
      }

      // Calculate delta time since last frame
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Add to accumulator
      accumulatorRef.current += deltaTime;

      // CRITICAL: Fixed timestep updates
      // Update physics in chunks of TIMESTEP (16.67ms)
      // This ensures consistent physics regardless of actual frame rate
      while (accumulatorRef.current >= GAME.TIMESTEP) {
        // Update Matter.js engine with fixed timestep
        Engine.update(engineRef.current, GAME.TIMESTEP);

        // Subtract timestep from accumulator
        accumulatorRef.current -= GAME.TIMESTEP;

        // Prevent spiral of death (if physics updates take too long)
        // Cap accumulator to prevent infinite loop
        if (accumulatorRef.current > GAME.TIMESTEP * 3) {
          accumulatorRef.current = 0;
          console.warn('Physics update took too long, resetting accumulator');
        }
      }

      // Render frame (can use variable timestep)
      // onUpdate receives deltaTime for smooth animations
      if (onUpdate) {
        onUpdate(deltaTime);
      }

      // Continue loop
      frameIdRef.current = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    frameIdRef.current = requestAnimationFrame(gameLoop);

    // PATTERN: Cleanup on unmount or when inactive
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [isActive, engineRef, onUpdate]);

  /**
   * Reset the game loop timing
   * Call this when resuming from pause to prevent large delta time spike
   */
  const reset = () => {
    lastTimeRef.current = null;
    accumulatorRef.current = 0;
  };

  return {
    reset
  };
};

export default useGameLoop;
