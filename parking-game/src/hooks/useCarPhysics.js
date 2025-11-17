import { useRef, useEffect, useState } from 'react';
import { Bodies, Body, World } from 'matter-js';
import { CAR, COLLISION_CATEGORY } from '../data/constants';

/**
 * Car physics hook - manages car body creation and control
 *
 * CRITICAL: Car physics based on simplified Ackermann steering geometry
 * Reference: https://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/
 *
 * Key concepts:
 * - Compound body for realistic collision shape
 * - Forward/Reverse gear mechanics
 * - Steering affects angular velocity based on speed
 * - Friction and air resistance for realistic deceleration
 *
 * @param {Object} worldRef - Matter.js world ref from usePhysicsEngine
 * @param {Object} startPosition - Initial car position {x, y, angle}
 * @returns {Object} Car physics methods and state
 */
const useCarPhysics = (worldRef, startPosition) => {
  const carBodyRef = useRef(null);
  const currentGearRef = useRef('P'); // P (Park), D (Drive), R (Reverse)
  const [speed, setSpeed] = useState(0);
  const [gear, setGear] = useState('P');
  const steeringAngleRef = useRef(0);

  useEffect(() => {
    if (!worldRef.current) return;

    const { x, y, angle } = startPosition;

    // CRITICAL: Create compound body for better collision shape
    // Simple rectangle doesn't match car visual well
    // Compound body = main chassis + cabin for more realistic shape

    // Create main chassis
    const mainBody = Bodies.rectangle(x, y, CAR.WIDTH, CAR.HEIGHT * 0.7, {
      render: {
        fillStyle: '#3B82F6',  // Bright blue for visibility
        strokeStyle: '#1E40AF',  // Darker blue outline
        lineWidth: 2
      }
    });

    // Create cabin
    const cabin = Bodies.rectangle(x, y - CAR.HEIGHT * 0.15, CAR.WIDTH * 0.7, CAR.HEIGHT * 0.3, {
      render: {
        fillStyle: '#60A5FA',  // Lighter blue for cabin
        strokeStyle: '#2563EB',
        lineWidth: 2
      }
    });

    carBodyRef.current = Body.create({
      parts: [mainBody, cabin],
      frictionAir: CAR.FRICTION_AIR,  // Air resistance for realistic deceleration
      friction: CAR.FRICTION,          // Ground friction
      restitution: CAR.RESTITUTION,    // Low bounce (cars don't bounce much)
      angle: angle * (Math.PI / 180),  // Convert degrees to radians
      label: 'car',                     // Label for identification in renderer
      collisionFilter: {
        category: COLLISION_CATEGORY.CAR,
        mask: COLLISION_CATEGORY.OBSTACLE | COLLISION_CATEGORY.WALL | COLLISION_CATEGORY.PARKING_ZONE
      },
      render: {
        fillStyle: '#3B82F6',  // Blue car color
        strokeStyle: '#1E40AF',
        lineWidth: 2,
        visible: true
      }
    });

    // Add car to physics world
    World.add(worldRef.current, carBodyRef.current);

    // PATTERN: Cleanup on unmount
    return () => {
      if (carBodyRef.current && worldRef.current) {
        World.remove(worldRef.current, carBodyRef.current);
        carBodyRef.current = null;
      }
    };
  }, [worldRef, startPosition]);

  /**
   * Steer the car
   * PATTERN: Ackermann steering - turning radius based on speed
   *
   * @param {number} normalizedAngle - Steering input from -1 (full left) to 1 (full right)
   */
  const steer = (normalizedAngle) => {
    if (!carBodyRef.current) return;

    // Store steering angle for later use
    steeringAngleRef.current = normalizedAngle * CAR.STEERING_MAX;

    // Calculate turn rate based on steering and current speed
    // Reason: Faster speeds = wider turning radius (more realistic)
    const currentSpeed = Math.sqrt(
      carBodyRef.current.velocity.x ** 2 +
      carBodyRef.current.velocity.y ** 2
    );

    // Normalize speed to 0-1 range
    const speedFactor = Math.min(currentSpeed / CAR.MAX_SPEED.FORWARD, 1);

    // Apply angular velocity based on steering angle and speed
    // Higher speed = more turning effect
    const turnRate = steeringAngleRef.current * speedFactor * CAR.TURN_RATE;

    Body.setAngularVelocity(carBodyRef.current, turnRate);
  };

  /**
   * Accelerate or reverse the car
   *
   * @param {string} newGear - 'D' (Drive), 'R' (Reverse), or 'P' (Park)
   */
  const accelerate = (newGear) => {
    if (!carBodyRef.current) return;

    currentGearRef.current = newGear;
    setGear(newGear);

    // Park = no movement
    if (newGear === 'P') {
      return;
    }

    const maxSpeed = newGear === 'D' ? CAR.MAX_SPEED.FORWARD : CAR.MAX_SPEED.REVERSE;
    const direction = newGear === 'D' ? 1 : -1;

    // Calculate forward direction based on car rotation
    // Reason: Car moves in the direction it's facing
    const carAngle = carBodyRef.current.angle;

    // Calculate force vector
    // sin/cos give us the direction components based on angle
    const forceX = Math.sin(carAngle) * CAR.ACCELERATION * direction;
    const forceY = -Math.cos(carAngle) * CAR.ACCELERATION * direction;

    // Get current speed
    const velocity = carBodyRef.current.velocity;
    const currentSpeed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

    // Only apply force if below max speed
    if (currentSpeed < maxSpeed) {
      // Apply force at center of mass
      Body.applyForce(carBodyRef.current, carBodyRef.current.position, {
        x: forceX,
        y: forceY
      });
    }

    // Update speed state for UI
    setSpeed(currentSpeed);
  };

  /**
   * Apply brakes to slow down the car
   */
  const brake = () => {
    if (!carBodyRef.current) return;

    // Get current velocity
    const velocity = carBodyRef.current.velocity;

    // Calculate opposite force to slow down
    // Reason: Braking = applying force opposite to direction of travel
    const brakeForceX = -velocity.x * CAR.BRAKE_FORCE;
    const brakeForceY = -velocity.y * CAR.BRAKE_FORCE;

    // Apply brake force
    Body.applyForce(carBodyRef.current, carBodyRef.current.position, {
      x: brakeForceX,
      y: brakeForceY
    });

    // Update speed
    const currentSpeed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    setSpeed(Math.max(0, currentSpeed - CAR.BRAKE_FORCE));
  };

  /**
   * Reset car to starting position
   */
  const reset = () => {
    if (!carBodyRef.current) return;

    // Reset position and angle
    Body.setPosition(carBodyRef.current, {
      x: startPosition.x,
      y: startPosition.y
    });

    Body.setAngle(carBodyRef.current, startPosition.angle * (Math.PI / 180));

    // Reset velocity and angular velocity
    Body.setVelocity(carBodyRef.current, { x: 0, y: 0 });
    Body.setAngularVelocity(carBodyRef.current, 0);

    // Reset state
    setSpeed(0);
    setGear('P');
    currentGearRef.current = 'P';
    steeringAngleRef.current = 0;
  };

  /**
   * Get current car position
   * @returns {Object} {x, y, angle}
   */
  const getPosition = () => {
    if (!carBodyRef.current) return { x: 0, y: 0, angle: 0 };

    return {
      x: carBodyRef.current.position.x,
      y: carBodyRef.current.position.y,
      angle: carBodyRef.current.angle * (180 / Math.PI) // Convert to degrees
    };
  };

  /**
   * Get current car velocity
   * @returns {Object} {x, y, magnitude}
   */
  const getVelocity = () => {
    if (!carBodyRef.current) return { x: 0, y: 0, magnitude: 0 };

    const velocity = carBodyRef.current.velocity;
    const magnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

    return {
      x: velocity.x,
      y: velocity.y,
      magnitude
    };
  };

  return {
    carBodyRef,
    steer,
    accelerate,
    brake,
    reset,
    getPosition,
    getVelocity,
    speed,
    gear
  };
};

export default useCarPhysics;
