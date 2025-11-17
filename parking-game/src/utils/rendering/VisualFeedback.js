/**
 * Visual Feedback System
 * Manages visual states, animations, and transitions for game objects
 */

import { COLORS, CAR, PARKING } from '../../data/constants';

/**
 * Visual state management for different game objects
 */
export class VisualFeedbackManager {
  constructor() {
    this.states = {
      car: 'normal',
      parkingZone: 'default',
      speed: 'slow'
    };

    this.animations = {
      collision: null,
      success: null,
      warning: null
    };

    this.timers = new Map();
  }

  /**
   * Update car visual state based on game conditions
   */
  updateCarState(conditions) {
    const { isColliding, isParked, speed } = conditions;

    if (isColliding) {
      this.states.car = 'collision';
      this.triggerFlash('car', 500);
    } else if (isParked) {
      this.states.car = 'success';
    } else {
      this.states.car = 'normal';
    }

    // Update speed-based color
    if (speed < CAR.MAX_SPEED.FORWARD * 0.3) {
      this.states.speed = 'slow';
    } else if (speed < CAR.MAX_SPEED.FORWARD * 0.7) {
      this.states.speed = 'medium';
    } else {
      this.states.speed = 'fast';
    }

    return this.states.car;
  }

  /**
   * Update parking zone visual state
   */
  updateParkingZoneState(validation) {
    const { isInZone, isParkingValid, parkingAccuracy } = validation;

    if (isParkingValid) {
      this.states.parkingZone = 'valid';
    } else if (isInZone) {
      if (parkingAccuracy >= 70) {
        this.states.parkingZone = 'validating';
      } else {
        this.states.parkingZone = 'invalid';
      }
    } else {
      this.states.parkingZone = 'default';
    }

    return this.states.parkingZone;
  }

  /**
   * Trigger a flash effect
   */
  triggerFlash(object, duration = 300) {
    // Clear existing timer if any
    if (this.timers.has(object)) {
      clearTimeout(this.timers.get(object));
    }

    // Set new timer to reset state
    const timer = setTimeout(() => {
      if (object === 'car') {
        this.states.car = 'normal';
      }
      this.timers.delete(object);
    }, duration);

    this.timers.set(object, timer);
  }

  /**
   * Get render configuration for current states
   */
  getRenderConfig(objectType) {
    switch (objectType) {
      case 'car':
        return this.getCarRenderConfig();
      case 'parkingZone':
        return this.getParkingZoneRenderConfig();
      default:
        return {};
    }
  }

  /**
   * Get car render configuration based on state
   */
  getCarRenderConfig() {
    const configs = {
      normal: {
        fillStyle: COLORS.CAR.NORMAL,
        strokeStyle: '#3B82F6',
        lineWidth: 2,
        shadowBlur: 10,
        shadowColor: 'rgba(59, 130, 246, 0.4)'
      },
      collision: {
        fillStyle: COLORS.CAR.COLLISION,
        strokeStyle: '#DC2626',
        lineWidth: 3,
        shadowBlur: 20,
        shadowColor: 'rgba(239, 68, 68, 0.8)'
      },
      success: {
        fillStyle: COLORS.CAR.SUCCESS,
        strokeStyle: '#059669',
        lineWidth: 2,
        shadowBlur: 25,
        shadowColor: 'rgba(16, 185, 129, 0.6)'
      }
    };

    return configs[this.states.car] || configs.normal;
  }

  /**
   * Get parking zone render configuration
   */
  getParkingZoneRenderConfig() {
    const configs = {
      default: {
        fillStyle: 'rgba(252, 211, 77, 0.15)',
        strokeStyle: COLORS.PARKING_ZONE.DEFAULT,
        lineWidth: 3,
        lineDash: [10, 5]
      },
      validating: {
        fillStyle: 'rgba(251, 191, 36, 0.25)',
        strokeStyle: '#FBB917',
        lineWidth: 4,
        lineDash: [15, 5],
        pulse: true
      },
      valid: {
        fillStyle: 'rgba(16, 185, 129, 0.25)',
        strokeStyle: COLORS.PARKING_ZONE.VALID,
        lineWidth: 4,
        lineDash: [],
        glow: true
      },
      invalid: {
        fillStyle: 'rgba(239, 68, 68, 0.15)',
        strokeStyle: COLORS.PARKING_ZONE.INVALID,
        lineWidth: 3,
        lineDash: [5, 10],
        shake: true
      }
    };

    return configs[this.states.parkingZone] || configs.default;
  }

  /**
   * Cleanup timers
   */
  cleanup() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}

/**
 * Particle effects for visual feedback
 */
export class ParticleSystem {
  constructor(context) {
    this.context = context;
    this.particles = [];
  }

  /**
   * Create collision particles
   */
  createCollisionEffect(x, y) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 1,
        color: '#EF4444',
        size: Math.random() * 4 + 2
      });
    }
  }

  /**
   * Create success particles
   */
  createSuccessEffect(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        life: 1,
        color: '#10B981',
        size: 3
      });
    }
  }

  /**
   * Update and render particles
   */
  update() {
    const ctx = this.context;

    this.particles = this.particles.filter(particle => {
      // Update particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.02;
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Skip if dead
      if (particle.life <= 0) return false;

      // Draw particle
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return true;
    });
  }
}

/**
 * Visual guide system for parking assistance
 */
export class VisualGuides {
  constructor(context) {
    this.context = context;
    this.enabled = true;
    this.opacity = 0.6;
  }

  /**
   * Draw distance guide line
   */
  drawDistanceGuide(carPos, parkingPos) {
    if (!this.enabled) return;

    const ctx = this.context;
    const distance = Math.sqrt(
      Math.pow(carPos.x - parkingPos.x, 2) +
      Math.pow(carPos.y - parkingPos.y, 2)
    );

    // Determine color based on distance
    let color;
    if (distance < 50) {
      color = COLORS.PARKING_ZONE.VALID;
    } else if (distance < 150) {
      color = COLORS.PARKING_ZONE.DEFAULT;
    } else {
      color = '#3B82F6';
    }

    // Draw guide line
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = this.opacity;

    ctx.beginPath();
    ctx.moveTo(carPos.x, carPos.y);
    ctx.lineTo(parkingPos.x, parkingPos.y);
    ctx.stroke();

    // Draw distance text
    const midX = (carPos.x + parkingPos.x) / 2;
    const midY = (carPos.y + parkingPos.y) / 2;

    ctx.fillStyle = color;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(distance)}px`, midX, midY - 5);

    ctx.restore();
  }

  /**
   * Draw angle alignment indicator
   */
  drawAngleGuide(carPos, carAngle, targetAngle) {
    if (!this.enabled) return;

    const ctx = this.context;
    const angleDiff = Math.abs(carAngle - targetAngle) * 180 / Math.PI;

    // Determine color based on angle difference
    let color;
    if (angleDiff < 5) {
      color = COLORS.PARKING_ZONE.VALID;
    } else if (angleDiff < 15) {
      color = COLORS.PARKING_ZONE.DEFAULT;
    } else {
      color = COLORS.PARKING_ZONE.INVALID;
    }

    // Draw angle arc
    ctx.save();
    ctx.translate(carPos.x, carPos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = this.opacity;

    ctx.beginPath();
    ctx.arc(0, 0, 40, carAngle - 0.2, carAngle + 0.2);
    ctx.stroke();

    // Draw angle text
    ctx.fillStyle = color;
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(angleDiff)}°`, 0, -50);

    ctx.restore();
  }

  /**
   * Draw parking space projection
   */
  drawParkingProjection(carPos, carAngle) {
    if (!this.enabled) return;

    const ctx = this.context;

    ctx.save();
    ctx.strokeStyle = COLORS.PARKING_ZONE.DEFAULT;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.globalAlpha = this.opacity * 0.5;

    // Draw projected car path
    const projectionLength = 100;
    const endX = carPos.x + Math.sin(carAngle) * projectionLength;
    const endY = carPos.y - Math.cos(carAngle) * projectionLength;

    ctx.beginPath();
    ctx.moveTo(carPos.x, carPos.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Toggle guides on/off
   */
  toggle() {
    this.enabled = !this.enabled;
  }
}

/**
 * Screen effects for dramatic moments
 */
export class ScreenEffects {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    this.originalTransform = '';
  }

  /**
   * Trigger screen shake
   */
  shake(intensity = 5) {
    this.shakeIntensity = intensity;
    this.applyShake();
  }

  /**
   * Apply shake transform
   */
  applyShake() {
    if (this.shakeIntensity < 0.1) {
      this.canvas.style.transform = this.originalTransform;
      return;
    }

    const x = (Math.random() - 0.5) * this.shakeIntensity;
    const y = (Math.random() - 0.5) * this.shakeIntensity;

    this.canvas.style.transform = `${this.originalTransform} translate(${x}px, ${y}px)`;
    this.shakeIntensity *= this.shakeDecay;

    requestAnimationFrame(() => this.applyShake());
  }

  /**
   * Flash effect
   */
  flash(color = 'white', duration = 100) {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = color;
    overlay.style.opacity = '0.5';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1000';

    this.canvas.parentElement.appendChild(overlay);

    setTimeout(() => {
      overlay.style.transition = 'opacity 0.3s ease-out';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }, duration);
  }
}

export default {
  VisualFeedbackManager,
  ParticleSystem,
  VisualGuides,
  ScreenEffects
};