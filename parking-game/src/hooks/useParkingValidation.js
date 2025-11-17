import { useState, useCallback, useRef, useEffect } from 'react';
import { PARKING } from '../data/constants';

/**
 * Parking validation hook - checks if car is properly parked
 *
 * Validation criteria:
 * 1. Position: Car center within tolerance of parking spot center
 * 2. Angle: Car aligned with parking spot angle (±3°)
 * 3. Speed: Car must be stopped (< 1 pixel/frame)
 * 4. Duration: Must maintain valid parking for 1 second
 *
 * @param {Object} carBodyRef - Car body ref from useCarPhysics
 * @param {Object} parkingSpot - Parking spot configuration {x, y, width, height, angle}
 * @param {Function} getCarVelocity - Function to get current car velocity
 * @returns {Object} Parking validation state and functions
 */
const useParkingValidation = (carBodyRef, parkingSpot, getCarVelocity) => {
  const [isParkingValid, setIsParkingValid] = useState(false);
  const [parkingAccuracy, setParkingAccuracy] = useState(0);
  const [isInZone, setIsInZone] = useState(false);
  const validStartTimeRef = useRef(null);
  const checkIntervalRef = useRef(null);

  /**
   * Check if car is properly parked
   * @returns {Object} Validation result {isValid, accuracy, posError, angleError, speed}
   */
  const checkParking = useCallback(() => {
    if (!carBodyRef.current || !parkingSpot) {
      return {
        isValid: false,
        accuracy: 0,
        posError: Infinity,
        angleError: Infinity,
        speed: 0
      };
    }

    const car = carBodyRef.current;
    const carPos = car.position;
    const carAngle = car.angle * (180 / Math.PI); // Convert to degrees

    // Get car speed
    const velocity = getCarVelocity ? getCarVelocity() : car.velocity;
    const carSpeed = typeof velocity.magnitude !== 'undefined'
      ? velocity.magnitude
      : Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

    // Calculate position error (distance from parking spot center)
    const posError = Math.sqrt(
      (carPos.x - parkingSpot.x) ** 2 +
      (carPos.y - parkingSpot.y) ** 2
    );

    // Calculate angle error
    // Normalize angles to handle wraparound (e.g., 359° vs 1° should be 2° difference)
    let angleError = Math.abs(carAngle - parkingSpot.angle);
    if (angleError > 180) angleError = 360 - angleError;

    // Check all criteria
    const positionValid = posError <= PARKING.POSITION_TOLERANCE;
    const angleValid = angleError <= PARKING.ANGLE_TOLERANCE;
    const speedValid = carSpeed < PARKING.SPEED_THRESHOLD;

    // Calculate accuracy percentage (0-100)
    // Position accuracy: 0 error = 100%, tolerance error = 50%, beyond = 0%
    const posAccuracy = Math.max(
      0,
      100 - (posError / PARKING.POSITION_TOLERANCE) * 50
    );

    // Angle accuracy: 0 error = 100%, tolerance error = 50%, beyond = 0%
    const angleAccuracy = Math.max(
      0,
      100 - (angleError / PARKING.ANGLE_TOLERANCE) * 50
    );

    // Overall accuracy (average of position and angle)
    const accuracy = (posAccuracy + angleAccuracy) / 2;

    // All criteria must be met
    const isValid = positionValid && angleValid && speedValid;

    // Update if car is in zone (position + angle valid, regardless of speed)
    setIsInZone(positionValid && angleValid);

    return {
      isValid,
      accuracy,
      posError,
      angleError,
      speed: carSpeed
    };
  }, [carBodyRef, parkingSpot, getCarVelocity]);

  /**
   * Stop parking validation
   */
  const stopValidation = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  /**
   * Start continuous parking validation
   * Checks every 100ms while car is in the parking zone
   */
  const startValidation = useCallback(() => {
    if (checkIntervalRef.current) return;

    checkIntervalRef.current = setInterval(() => {
      const result = checkParking();

      // Update accuracy continuously
      setParkingAccuracy(result.accuracy);

      if (result.isValid) {
        // Start timer if not already started
        if (!validStartTimeRef.current) {
          validStartTimeRef.current = Date.now();
        }

        // Check if valid duration has elapsed
        const duration = Date.now() - validStartTimeRef.current;

        if (duration >= PARKING.VALID_DURATION) {
          setIsParkingValid(true);
          // Stop checking once parking is confirmed valid
          stopValidation();
        }
      } else {
        // Reset timer if parking becomes invalid
        validStartTimeRef.current = null;
        setIsParkingValid(false);
      }
    }, 100); // Check every 100ms
  }, [checkParking, stopValidation]);

  /**
   * Reset parking validation state
   */
  const reset = useCallback(() => {
    setIsParkingValid(false);
    setParkingAccuracy(0);
    setIsInZone(false);
    validStartTimeRef.current = null;
    stopValidation();
  }, [stopValidation]);

  // Auto-start validation when car is in zone
  useEffect(() => {
    if (isInZone && !checkIntervalRef.current) {
      startValidation();
    } else if (!isInZone && checkIntervalRef.current) {
      stopValidation();
      validStartTimeRef.current = null;
    }
  }, [isInZone, startValidation, stopValidation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopValidation();
    };
  }, [stopValidation]);

  return {
    isParkingValid,
    parkingAccuracy,
    isInZone,
    checkParking,
    startValidation,
    stopValidation,
    reset
  };
};

export default useParkingValidation;
