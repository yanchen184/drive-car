/**
 * Enhanced Game Renderer for Matter.js
 * Provides custom rendering with visual enhancements beyond default Matter.js
 */

import { COLORS, CAR, GAME, OBSTACLES } from '../../data/constants';

/**
 * Custom render configuration for different game objects
 * These override Matter.js default rendering
 */
export const RENDER_CONFIG = {
  car: {
    normal: {
      fillStyle: '#60A5FA',     // Blue-400 - bright and visible
      strokeStyle: '#3B82F6',    // Blue-500 - darker outline
      lineWidth: 2,
      shadowBlur: 15,
      shadowColor: 'rgba(59, 130, 246, 0.5)'  // Blue glow for visibility
    },
    collision: {
      fillStyle: '#EF4444',     // Red-500 - collision state
      strokeStyle: '#DC2626',    // Red-600 - darker outline
      lineWidth: 3,
      shadowBlur: 20,
      shadowColor: 'rgba(239, 68, 68, 0.8)'   // Red glow
    },
    success: {
      fillStyle: '#10B981',     // Green-500 - parked successfully
      strokeStyle: '#059669',    // Green-600
      lineWidth: 2,
      shadowBlur: 25,
      shadowColor: 'rgba(16, 185, 129, 0.6)'  // Green glow
    },
    steering: {
      // Visual indicator for steering direction
      wheelColor: '#1F2937',    // Gray-800 for wheels
      wheelSize: 4,
      steeringIndicator: true
    }
  },

  parkingZone: {
    default: {
      fillStyle: 'rgba(252, 211, 77, 0.15)',    // Yellow-300 with transparency
      strokeStyle: '#FCD34D',                    // Yellow-300 solid for lines
      lineWidth: 3,
      lineDash: [10, 5],                        // Dashed parking lines
      cornerMarkers: true                        // Show corner markers
    },
    validating: {
      fillStyle: 'rgba(251, 191, 36, 0.25)',    // Yellow-400 more opaque
      strokeStyle: '#FBB917',
      lineWidth: 4,
      lineDash: [15, 5],
      pulse: true                                // Pulsing animation
    },
    valid: {
      fillStyle: 'rgba(16, 185, 129, 0.25)',    // Green-500 transparent
      strokeStyle: '#10B981',
      lineWidth: 4,
      lineDash: [],                             // Solid line when valid
      glow: true
    },
    invalid: {
      fillStyle: 'rgba(239, 68, 68, 0.15)',     // Red-500 transparent
      strokeStyle: '#EF4444',
      lineWidth: 3,
      lineDash: [5, 10],
      shake: true                                // Shake animation
    }
  },

  obstacles: {
    wall: {
      fillStyle: '#4B5563',      // Gray-600
      strokeStyle: '#374151',    // Gray-700
      lineWidth: 2,
      pattern: 'bricks'          // Brick pattern for walls
    },
    car: {
      fillStyle: '#6B7280',      // Gray-500 for parked cars
      strokeStyle: '#4B5563',    // Gray-600
      lineWidth: 2,
      shadowBlur: 8,
      shadowColor: 'rgba(0, 0, 0, 0.3)'
    },
    cone: {
      fillStyle: '#F59E0B',      // Orange-500
      strokeStyle: '#D97706',    // Orange-600
      lineWidth: 2,
      shape: 'triangle'          // Triangle shape for cones
    },
    barrier: {
      fillStyle: '#DC2626',      // Red-600
      strokeStyle: '#991B1B',    // Red-800
      lineWidth: 2,
      pattern: 'stripes'         // Warning stripes
    }
  },

  background: {
    color: '#111827',            // Gray-900 - dark background
    grid: {
      enabled: true,
      color: '#1F2937',          // Gray-800 - subtle grid
      size: 50,                  // Grid cell size
      lineWidth: 1,
      opacity: 0.3
    },
    roadMarkings: {
      enabled: true,
      color: '#374151',          // Gray-700 - road markings
      centerLine: true,
      parkingLines: true
    }
  },

  ui: {
    speedIndicator: {
      slow: '#10B981',           // Green
      medium: '#F59E0B',         // Orange
      fast: '#EF4444'            // Red
    },
    distanceGuide: {
      close: '#EF4444',          // Red - too close
      optimal: '#10B981',       // Green - perfect distance
      far: '#3B82F6'             // Blue - too far
    },
    angleIndicator: {
      perfect: '#10B981',        // Green - perfect angle
      acceptable: '#F59E0B',     // Orange - slightly off
      bad: '#EF4444'             // Red - wrong angle
    }
  }
};

/**
 * Custom render functions for enhanced visuals
 */
export class GameRenderer {
  constructor(render, context) {
    this.render = render;
    this.context = context;
    this.animationFrame = 0;
  }

  /**
   * Draw background with grid
   */
  drawBackground() {
    const ctx = this.context;
    const { width, height } = this.render.canvas;

    // Clear and fill background
    ctx.fillStyle = RENDER_CONFIG.background.color;
    ctx.fillRect(0, 0, width, height);

    // Draw grid if enabled
    if (RENDER_CONFIG.background.grid.enabled) {
      const gridConfig = RENDER_CONFIG.background.grid;

      ctx.strokeStyle = gridConfig.color;
      ctx.lineWidth = gridConfig.lineWidth;
      ctx.globalAlpha = gridConfig.opacity;

      // Vertical lines
      for (let x = 0; x <= width; x += gridConfig.size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += gridConfig.size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }
  }

  /**
   * Draw parking zone with enhanced visuals
   */
  drawParkingZone(parkingBody, state = 'default') {
    const ctx = this.context;
    const config = RENDER_CONFIG.parkingZone[state];
    const vertices = parkingBody.vertices;

    ctx.save();

    // Apply animation effects
    if (config.pulse && this.animationFrame % 60 < 30) {
      ctx.globalAlpha = 0.5 + (Math.sin(this.animationFrame * 0.1) * 0.3);
    }

    // Fill parking zone
    ctx.fillStyle = config.fillStyle;
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // Draw border with dash pattern
    ctx.strokeStyle = config.strokeStyle;
    ctx.lineWidth = config.lineWidth;
    if (config.lineDash) {
      ctx.setLineDash(config.lineDash);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw corner markers
    if (config.cornerMarkers) {
      ctx.fillStyle = config.strokeStyle;
      vertices.forEach(vertex => {
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw "P" in center
    const centerX = parkingBody.position.x;
    const centerY = parkingBody.position.y;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = config.strokeStyle;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.5;
    ctx.fillText('P', centerX, centerY);

    ctx.restore();
  }

  /**
   * Draw car with enhanced visuals and indicators
   */
  drawCar(carBody, state = 'normal', steeringAngle = 0) {
    const ctx = this.context;
    const config = RENDER_CONFIG.car[state];

    ctx.save();

    // Apply shadow for depth
    if (config.shadowBlur) {
      ctx.shadowBlur = config.shadowBlur;
      ctx.shadowColor = config.shadowColor;
    }

    // Draw car body parts
    carBody.parts.forEach((part, index) => {
      if (index === 0) return; // Skip compound body itself

      const vertices = part.vertices;

      // Fill car body
      ctx.fillStyle = config.fillStyle;
      ctx.beginPath();
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      ctx.closePath();
      ctx.fill();

      // Stroke outline
      ctx.strokeStyle = config.strokeStyle;
      ctx.lineWidth = config.lineWidth;
      ctx.stroke();
    });

    // Draw windshield (darker area at front)
    const angle = carBody.angle;
    const x = carBody.position.x;
    const y = carBody.position.y;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Windshield
    ctx.fillStyle = 'rgba(31, 41, 55, 0.7)'; // Gray-800 with transparency
    ctx.fillRect(-CAR.WIDTH * 0.3, -CAR.HEIGHT * 0.4, CAR.WIDTH * 0.6, CAR.HEIGHT * 0.2);

    // Draw wheels (visual indicators of steering)
    if (RENDER_CONFIG.car.steering.steeringIndicator) {
      ctx.fillStyle = RENDER_CONFIG.car.steering.wheelColor;

      // Front wheels (affected by steering)
      ctx.save();
      ctx.translate(CAR.WIDTH * 0.3, -CAR.HEIGHT * 0.3);
      ctx.rotate(steeringAngle * Math.PI / 180);
      ctx.fillRect(-2, -6, 4, 12);
      ctx.restore();

      ctx.save();
      ctx.translate(-CAR.WIDTH * 0.3, -CAR.HEIGHT * 0.3);
      ctx.rotate(steeringAngle * Math.PI / 180);
      ctx.fillRect(-2, -6, 4, 12);
      ctx.restore();

      // Rear wheels (fixed)
      ctx.fillRect(CAR.WIDTH * 0.3 - 2, CAR.HEIGHT * 0.3 - 6, 4, 12);
      ctx.fillRect(-CAR.WIDTH * 0.3 - 2, CAR.HEIGHT * 0.3 - 6, 4, 12);
    }

    // Direction indicator (arrow at front)
    ctx.strokeStyle = '#F9FAFB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -CAR.HEIGHT * 0.45);
    ctx.lineTo(0, -CAR.HEIGHT * 0.5);
    ctx.lineTo(10, -CAR.HEIGHT * 0.45);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  /**
   * Draw obstacle with appropriate styling
   */
  drawObstacle(obstacleBody) {
    const ctx = this.context;
    const type = obstacleBody.label || 'wall';
    const config = RENDER_CONFIG.obstacles[type];

    ctx.save();

    if (config.shadowBlur) {
      ctx.shadowBlur = config.shadowBlur;
      ctx.shadowColor = config.shadowColor;
    }

    // Draw based on shape
    if (config.shape === 'triangle') {
      // Draw cone as triangle
      const x = obstacleBody.position.x;
      const y = obstacleBody.position.y;
      const size = 10;

      ctx.fillStyle = config.fillStyle;
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x - size, y + size);
      ctx.lineTo(x + size, y + size);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = config.strokeStyle;
      ctx.lineWidth = config.lineWidth;
      ctx.stroke();
    } else {
      // Draw regular rectangle
      const vertices = obstacleBody.vertices;

      // Apply pattern if specified
      if (config.pattern === 'stripes') {
        // Create stripe pattern
        ctx.fillStyle = config.fillStyle;
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
          ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        ctx.closePath();
        ctx.fill();

        // Add diagonal stripes
        ctx.strokeStyle = '#FCD34D';
        ctx.lineWidth = 2;
        const bounds = obstacleBody.bounds;
        for (let i = bounds.min.x; i < bounds.max.x + 50; i += 10) {
          ctx.beginPath();
          ctx.moveTo(i, bounds.min.y);
          ctx.lineTo(i - 20, bounds.max.y);
          ctx.stroke();
        }
      } else {
        // Regular fill
        ctx.fillStyle = config.fillStyle;
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
          ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        ctx.closePath();
        ctx.fill();
      }

      // Draw outline
      ctx.strokeStyle = config.strokeStyle;
      ctx.lineWidth = config.lineWidth;
      ctx.beginPath();
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw visual guides for parking assistance
   */
  drawParkingGuides(carBody, parkingZone) {
    const ctx = this.context;

    // Calculate distance to parking zone
    const dx = carBody.position.x - parkingZone.position.x;
    const dy = carBody.position.y - parkingZone.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Draw distance indicator line
    ctx.save();
    ctx.strokeStyle = distance < 50 ? RENDER_CONFIG.ui.distanceGuide.close :
                     distance < 150 ? RENDER_CONFIG.ui.distanceGuide.optimal :
                     RENDER_CONFIG.ui.distanceGuide.far;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.5;

    ctx.beginPath();
    ctx.moveTo(carBody.position.x, carBody.position.y);
    ctx.lineTo(parkingZone.position.x, parkingZone.position.y);
    ctx.stroke();

    ctx.restore();

    // Draw angle alignment indicator
    const angleDiff = Math.abs(carBody.angle - parkingZone.angle) * 180 / Math.PI;
    const angleColor = angleDiff < 5 ? RENDER_CONFIG.ui.angleIndicator.perfect :
                      angleDiff < 15 ? RENDER_CONFIG.ui.angleIndicator.acceptable :
                      RENDER_CONFIG.ui.angleIndicator.bad;

    // Draw angle arc
    ctx.save();
    ctx.translate(carBody.position.x, carBody.position.y);
    ctx.strokeStyle = angleColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;

    ctx.beginPath();
    ctx.arc(0, 0, 40, carBody.angle - 0.2, carBody.angle + 0.2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Update animation frame
   */
  update() {
    this.animationFrame++;
  }
}

/**
 * Initialize enhanced rendering on Matter.js render
 * Uses Matter.js Events API for proper event handling
 */
export function enhanceRenderer(render, engine) {
  if (!render || !engine) {
    console.error('enhanceRenderer: Missing render or engine');
    return null;
  }

  const context = render.context;
  const gameRenderer = new GameRenderer(render, context);

  console.log('Enhanced renderer initialized', {
    canvas: render.canvas,
    context: render.context,
    canvasWidth: render.canvas?.width,
    canvasHeight: render.canvas?.height,
    bodies: engine.world.bodies.length
  });

  // Use Matter.js Events API to add afterRender handler
  // Note: We import Events from Matter.js in the component that calls this
  // This function returns the handler so the component can attach it
  const afterRenderHandler = function() {
    // Update animation
    gameRenderer.update();

    // Log every 60 frames (once per second at 60 FPS)
    if (gameRenderer.animationFrame % 60 === 0) {
      console.log('Render frame:', gameRenderer.animationFrame, 'Bodies:', engine.world.bodies.length);
      engine.world.bodies.forEach(body => {
        console.log('  Body:', body.label || 'unlabeled',
                    'Position:', body.position,
                    'Visible:', body.render?.visible,
                    'Parts:', body.parts?.length);
      });
    }

    // Note: Default Matter.js rendering already happened
    // We draw our enhancements on top

    // Get all bodies
    const bodies = engine.world.bodies;

    // Draw parking guides first (behind everything)
    const car = bodies.find(b => b.label === 'car');
    const parkingZone = bodies.find(b => b.label === 'parkingZone');

    if (car && parkingZone) {
      gameRenderer.drawParkingGuides(car, parkingZone);
    }
  };

  return {
    gameRenderer,
    afterRenderHandler
  };
}

export default {
  RENDER_CONFIG,
  GameRenderer,
  enhanceRenderer
};