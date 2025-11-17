/**
 * Debug Helper for visualizing physics bodies and game state
 * Helps diagnose rendering issues and physics problems
 */

import { Render } from 'matter-js';

/**
 * Toggle debug mode for Matter.js renderer
 * @param {Object} render - Matter.js render instance
 * @param {boolean} enabled - Enable or disable debug mode
 */
export const toggleDebugMode = (render, enabled) => {
  if (!render) return;

  render.options.wireframes = enabled;
  render.options.showAngleIndicator = enabled;
  render.options.showVelocity = enabled;
  render.options.showCollisions = enabled;
  render.options.showIds = enabled;
  render.options.showPositions = enabled;

  // Force re-render
  Render.world(render);
};

/**
 * Log world state for debugging
 * @param {Object} world - Matter.js world
 * @param {Object} car - Car body reference
 */
export const logWorldState = (world, car) => {
  if (!world) return;

  console.group('🌍 World State Debug');

  console.log('Total bodies:', world.bodies.length);

  // Log each body
  world.bodies.forEach((body, index) => {
    console.log(`Body ${index}:`, {
      label: body.label || 'unnamed',
      position: body.position,
      angle: body.angle * (180 / Math.PI),
      isStatic: body.isStatic,
      isSensor: body.isSensor,
      visible: body.render?.visible,
      fillStyle: body.render?.fillStyle,
      bounds: body.bounds
    });
  });

  // Log car state specifically
  if (car) {
    console.group('🚗 Car State:');
    console.log({
      position: car.position,
      velocity: car.velocity,
      angle: car.angle * (180 / Math.PI),
      angularVelocity: car.angularVelocity,
      speed: Math.sqrt(car.velocity.x ** 2 + car.velocity.y ** 2)
    });
    console.groupEnd();
  }

  console.groupEnd();
};

/**
 * Create debug overlay panel
 * @param {Object} stats - Game statistics
 * @returns {string} HTML string for debug panel
 */
export const createDebugPanel = (stats) => {
  return `
    <div style="
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      border: 1px solid #00ff00;
      z-index: 9999;
    ">
      <h3 style="margin: 0 0 10px 0;">DEBUG INFO</h3>
      <div>FPS: ${stats.fps || 0}</div>
      <div>Bodies: ${stats.bodyCount || 0}</div>
      <div>Car Pos: (${Math.round(stats.carX || 0)}, ${Math.round(stats.carY || 0)})</div>
      <div>Car Speed: ${(stats.carSpeed || 0).toFixed(2)}</div>
      <div>Car Angle: ${Math.round(stats.carAngle || 0)}°</div>
      <div>Gear: ${stats.gear || 'P'}</div>
      <div>Steering: ${Math.round(stats.steering || 0)}°</div>
      <div>In Parking: ${stats.inParkingZone ? 'YES' : 'NO'}</div>
      <div>Collisions: ${stats.collisions || 0}</div>
    </div>
  `;
};

/**
 * Check if renderer is properly configured
 * @param {Object} render - Matter.js render instance
 * @returns {Object} Diagnostics result
 */
export const diagnoseRenderer = (render) => {
  if (!render) {
    return {
      healthy: false,
      error: 'Renderer not initialized'
    };
  }

  const diagnostics = {
    healthy: true,
    canvas: {
      exists: !!render.canvas,
      width: render.canvas?.width || 0,
      height: render.canvas?.height || 0,
      context: !!render.context
    },
    options: {
      width: render.options.width,
      height: render.options.height,
      background: render.options.background,
      wireframes: render.options.wireframes
    },
    engine: {
      worldExists: !!render.engine?.world,
      bodyCount: render.engine?.world?.bodies?.length || 0,
      gravity: render.engine?.gravity
    }
  };

  // Check for common issues
  if (!render.canvas) {
    diagnostics.healthy = false;
    diagnostics.error = 'Canvas not attached to renderer';
  } else if (render.canvas.width === 0 || render.canvas.height === 0) {
    diagnostics.healthy = false;
    diagnostics.error = 'Canvas has zero dimensions';
  } else if (!render.context) {
    diagnostics.healthy = false;
    diagnostics.error = 'Canvas context not available';
  }

  return diagnostics;
};

/**
 * Visual indicator for parking accuracy
 * @param {Object} parkingSpot - Target parking position
 * @param {Object} carPosition - Current car position
 * @returns {Object} Visual indicator properties
 */
export const getParkingAccuracyIndicator = (parkingSpot, carPosition) => {
  if (!parkingSpot || !carPosition) return null;

  const dx = carPosition.x - parkingSpot.x;
  const dy = carPosition.y - parkingSpot.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const angleDiff = Math.abs(carPosition.angle - parkingSpot.angle) % 360;
  const normalizedAngleDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff;

  // Calculate accuracy (0-100)
  const positionAccuracy = Math.max(0, 100 - distance);
  const angleAccuracy = Math.max(0, 100 - normalizedAngleDiff * 5);
  const totalAccuracy = (positionAccuracy + angleAccuracy) / 2;

  // Determine color based on accuracy
  let color;
  if (totalAccuracy >= 90) {
    color = '#10B981'; // Green
  } else if (totalAccuracy >= 70) {
    color = '#F59E0B'; // Orange
  } else {
    color = '#EF4444'; // Red
  }

  return {
    accuracy: totalAccuracy,
    distance,
    angleDiff: normalizedAngleDiff,
    color,
    isAligned: totalAccuracy >= 85
  };
};

export default {
  toggleDebugMode,
  logWorldState,
  createDebugPanel,
  diagnoseRenderer,
  getParkingAccuracyIndicator
};