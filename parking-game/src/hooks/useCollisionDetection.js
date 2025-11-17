import { useEffect, useState, useCallback } from 'react';
import { Events } from 'matter-js';
import { COLLISION_CATEGORY } from '../data/constants';

/**
 * Collision detection hook using Matter.js collision events
 *
 * CRITICAL: Listens to Matter.js collision events and tracks collision data
 * - Counts total collisions
 * - Tracks collision severity based on impact velocity
 * - Ignores sensor collisions (parking zone detection)
 * - Must cleanup event listeners on unmount
 *
 * @param {Object} engineRef - Matter.js engine ref from usePhysicsEngine
 * @param {Object} carBodyRef - Car body ref from useCarPhysics
 * @returns {Object} Collision state and control functions
 */
const useCollisionDetection = (engineRef, carBodyRef) => {
  const [collisionCount, setCollisionCount] = useState(0);
  const [lastCollision, setLastCollision] = useState(null);
  const [collisions, setCollisions] = useState([]);

  /**
   * Handle collision start event
   */
  const handleCollisionStart = useCallback((event) => {
    if (!carBodyRef.current) return;

    const pairs = event.pairs;

    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;

      // Check if car is involved in collision
      const carCollision =
        bodyA.id === carBodyRef.current.id ||
        bodyB.id === carBodyRef.current.id;

      if (!carCollision) continue;

      // Get the other body (obstacle)
      const obstacle = bodyA.id === carBodyRef.current.id ? bodyB : bodyA;

      // CRITICAL: Ignore sensor collisions (parking zone)
      // Reason: Sensors don't cause physical collisions, only detect overlap
      if (obstacle.isSensor) continue;

      // Calculate impact velocity for severity
      const car = carBodyRef.current;
      const impactVelocity = Math.sqrt(
        car.velocity.x ** 2 + car.velocity.y ** 2
      );

      // Determine collision severity
      let severity = 'minor';
      if (impactVelocity > 20) {
        severity = 'major';
      } else if (impactVelocity > 10) {
        severity = 'moderate';
      }

      // Create collision record
      const collision = {
        timestamp: Date.now(),
        obstacleId: obstacle.id,
        obstacleLabel: obstacle.label || 'unknown',
        impactVelocity,
        severity,
        position: { x: car.position.x, y: car.position.y }
      };

      // Update state
      setLastCollision(collision);
      setCollisionCount(prev => prev + 1);
      setCollisions(prev => [...prev, collision]);
    }
  }, [carBodyRef]);

  useEffect(() => {
    if (!engineRef.current) return;

    // CRITICAL: Add collision event listener
    Events.on(engineRef.current, 'collisionStart', handleCollisionStart);

    // PATTERN: Cleanup event listeners on unmount
    // Reason: Prevents memory leaks and duplicate event handlers
    return () => {
      if (engineRef.current) {
        Events.off(engineRef.current, 'collisionStart', handleCollisionStart);
      }
    };
  }, [engineRef, handleCollisionStart]);

  /**
   * Reset collision tracking
   */
  const resetCollisions = () => {
    setCollisionCount(0);
    setLastCollision(null);
    setCollisions([]);
  };

  /**
   * Get collision summary
   * @returns {Object} Summary of collisions
   */
  const getCollisionSummary = () => {
    const summary = {
      total: collisionCount,
      minor: collisions.filter(c => c.severity === 'minor').length,
      moderate: collisions.filter(c => c.severity === 'moderate').length,
      major: collisions.filter(c => c.severity === 'major').length,
      lastCollision
    };

    return summary;
  };

  return {
    collisionCount,
    lastCollision,
    collisions,
    resetCollisions,
    getCollisionSummary
  };
};

export default useCollisionDetection;
