import React, { useRef, useEffect, useState } from 'react';
import { Render, Bodies, World, Events } from 'matter-js';
import usePhysicsEngine from '../../hooks/usePhysicsEngine';
import useGameLoop from '../../hooks/useGameLoop';
import useCarPhysics from '../../hooks/useCarPhysics';
import useCollisionDetection from '../../hooks/useCollisionDetection';
import useParkingValidation from '../../hooks/useParkingValidation';
import { CAR, GAME, COLLISION_CATEGORY, COLORS, OBSTACLES } from '../../data/constants';
import { enhanceRenderer } from '../../utils/rendering/GameRenderer';
import './GameCanvas.css';

/**
 * Main game canvas component with Matter.js physics
 *
 * CRITICAL:
 * - Canvas DPI scaling for sharp rendering on retina displays
 * - Fixed timestep game loop for consistent physics
 * - Proper cleanup of Matter.js renderer and engine
 *
 * @param {Object} levelData - Level configuration
 * @param {Function} onLevelComplete - Callback when parking is successful
 * @param {Function} onLevelFailed - Callback when level is failed
 * @param {Function} onStatsUpdate - Callback to update HUD stats
 */
const GameCanvas = ({
  levelData,
  onLevelComplete,
  onLevelFailed,
  onStatsUpdate,
  steeringInput = 0,
  gearInput = 'P',
  brakeInput = false
}) => {
  const canvasRef = useRef(null);
  const renderRef = useRef(null);
  const obstaclesRef = useRef([]);
  const parkingZoneRef = useRef(null);

  // Initialize physics engine
  const { engineRef, worldRef, isRunning, start } = usePhysicsEngine();

  // Initialize car physics
  const carPhysics = useCarPhysics(
    worldRef,
    levelData?.carStartPosition || { x: 200, y: 300, angle: 0 }
  );

  // Initialize collision detection
  const collisionDetection = useCollisionDetection(engineRef, carPhysics.carBodyRef);

  // Initialize parking validation
  const parkingValidation = useParkingValidation(
    carPhysics.carBodyRef,
    levelData?.parkingSpot,
    carPhysics.getVelocity
  );

  // Game state
  const startTimeRef = useRef(null);
  const [collisionFlash, setCollisionFlash] = useState(false);

  /**
   * Setup canvas with proper DPI scaling
   */
  const setupCanvas = (canvas) => {
    if (!canvas) return;

    // Get canvas dimensions
    const rect = canvas.getBoundingClientRect();

    // Store dimensions for renderer
    return {
      width: rect.width,
      height: rect.height
    };
  };

  /**
   * Create obstacle bodies from level data
   */
  const createObstacles = () => {
    if (!levelData || !worldRef.current) return;

    // Clear existing obstacles
    obstaclesRef.current.forEach(obstacle => {
      World.remove(worldRef.current, obstacle);
    });
    obstaclesRef.current = [];

    // Create new obstacles
    levelData.obstacles.forEach(obstacleData => {
      const { x, y, width, height, angle, type } = obstacleData;

      // Get render config for obstacle type
      const obstacleConfig = OBSTACLES[type?.toUpperCase()] || OBSTACLES.WALL;

      const obstacle = Bodies.rectangle(x, y, width, height, {
        isStatic: true,
        angle: angle * (Math.PI / 180),
        friction: obstacleConfig.friction || 0.8,
        restitution: obstacleConfig.restitution || 0.3,
        label: type,
        collisionFilter: {
          category: COLLISION_CATEGORY.OBSTACLE,
          mask: COLLISION_CATEGORY.CAR
        },
        render: {
          fillStyle: obstacleConfig.color || '#6B7280',
          strokeStyle: '#374151',
          lineWidth: 2,
          visible: true
        }
      });

      World.add(worldRef.current, obstacle);
      obstaclesRef.current.push(obstacle);
    });
  };

  /**
   * Create parking zone (sensor body)
   */
  const createParkingZone = () => {
    if (!levelData || !worldRef.current) return;

    const { x, y, width, height, angle } = levelData.parkingSpot;

    // Remove existing parking zone
    if (parkingZoneRef.current) {
      World.remove(worldRef.current, parkingZoneRef.current);
    }

    // Create sensor body (no physical collision, only detection)
    parkingZoneRef.current = Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      isSensor: true,
      angle: angle * (Math.PI / 180),
      label: 'parkingZone',
      collisionFilter: {
        category: COLLISION_CATEGORY.PARKING_ZONE,
        mask: COLLISION_CATEGORY.CAR
      },
      render: {
        fillStyle: 'rgba(252, 211, 77, 0.3)',  // Semi-transparent yellow
        strokeStyle: '#FCD34D',  // Yellow parking lines
        lineWidth: 3,
        visible: true
      }
    });

    World.add(worldRef.current, parkingZoneRef.current);
  };

  /**
   * Create canvas boundaries (walls)
   */
  const createBoundaries = () => {
    if (!worldRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const thickness = 50;

    // Create walls
    const walls = [
      // Top wall
      Bodies.rectangle(rect.width / 2, -thickness / 2, rect.width, thickness, {
        isStatic: true,
        label: 'wall-top',
        render: { fillStyle: '#374151', visible: true }
      }),
      // Bottom wall
      Bodies.rectangle(rect.width / 2, rect.height + thickness / 2, rect.width, thickness, {
        isStatic: true,
        label: 'wall-bottom',
        render: { fillStyle: '#374151', visible: true }
      }),
      // Left wall
      Bodies.rectangle(-thickness / 2, rect.height / 2, thickness, rect.height, {
        isStatic: true,
        label: 'wall-left',
        render: { fillStyle: '#374151', visible: true }
      }),
      // Right wall
      Bodies.rectangle(rect.width + thickness / 2, rect.height / 2, thickness, rect.height, {
        isStatic: true,
        label: 'wall-right',
        render: { fillStyle: '#374151', visible: true }
      })
    ];

    walls.forEach(wall => {
      wall.collisionFilter = {
        category: COLLISION_CATEGORY.WALL,
        mask: COLLISION_CATEGORY.CAR
      };
      World.add(worldRef.current, wall);
    });
  };

  /**
   * Render loop callback
   */
  const handleUpdate = () => {
    // Update elapsed time
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const currentTime = (Date.now() - startTimeRef.current) / 1000;

    // Update HUD stats
    if (onStatsUpdate) {
      const velocity = carPhysics.getVelocity();
      onStatsUpdate({
        time: currentTime,
        speed: velocity.magnitude,
        accuracy: parkingValidation.parkingAccuracy,
        collisions: collisionDetection.collisionCount,
        gear: carPhysics.gear
      });
    }

    // Check for level completion
    if (parkingValidation.isParkingValid) {
      onLevelComplete({
        timeTaken: currentTime,
        accuracy: parkingValidation.parkingAccuracy,
        collisions: collisionDetection.collisionCount
      });
    }

    // Check for level failure (too many collisions or timeout)
    if (collisionDetection.collisionCount >= GAME.MAX_COLLISION_COUNT) {
      onLevelFailed({ reason: 'Too many collisions' });
    }

    if (levelData.timeLimit && currentTime >= levelData.timeLimit) {
      onLevelFailed({ reason: 'Time limit exceeded' });
    }
  };

  // Initialize Matter.js renderer
  useEffect(() => {
    if (!canvasRef.current || !engineRef.current) return;

    const dimensions = setupCanvas(canvasRef.current);
    if (!dimensions) return;

    // Create Matter.js renderer with enhanced visuals
    renderRef.current = Render.create({
      canvas: canvasRef.current,
      engine: engineRef.current,
      options: {
        width: dimensions.width,
        height: dimensions.height,
        background: '#111827',  // Dark background from design spec
        wireframes: false,
        showAngleIndicator: false,
        showVelocity: false,
        showCollisions: false
      }
    });

    // Apply enhanced rendering
    const enhancedRenderer = enhanceRenderer(renderRef.current, engineRef.current);

    // Attach afterRender event handler using Matter.js Events API
    if (enhancedRenderer && enhancedRenderer.afterRenderHandler) {
      Events.on(renderRef.current, 'afterRender', enhancedRenderer.afterRenderHandler);
    }

    Render.run(renderRef.current);

    // Log for debugging
    console.log('Renderer initialized:', {
      width: dimensions.width,
      height: dimensions.height,
      bodies: engineRef.current.world.bodies.length
    });

    // Cleanup renderer
    return () => {
      if (renderRef.current) {
        // Remove event listeners
        Events.off(renderRef.current, 'afterRender');

        Render.stop(renderRef.current);
        renderRef.current.canvas.remove();
        renderRef.current.canvas = null;
        renderRef.current.context = null;
        renderRef.current.textures = {};
      }
    };
  }, [engineRef]);

  // Create level obstacles and parking zone
  useEffect(() => {
    if (!worldRef.current || !levelData) return;

    createBoundaries();
    createObstacles();
    createParkingZone();

    // Log world bodies for debugging
    console.log('World bodies after setup:', worldRef.current.bodies.map(b => ({
      label: b.label,
      position: b.position,
      render: b.render
    })));

    // Start game after setup
    setTimeout(() => {
      start();
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelData]);

  // Handle control inputs
  useEffect(() => {
    carPhysics.steer(steeringInput);
  }, [steeringInput, carPhysics]);

  useEffect(() => {
    carPhysics.accelerate(gearInput);
  }, [gearInput, carPhysics]);

  useEffect(() => {
    if (brakeInput) {
      carPhysics.brake();
    }
  }, [brakeInput, carPhysics]);

  // Handle collision flash effect
  useEffect(() => {
    if (collisionDetection.lastCollision) {
      setCollisionFlash(true);
      const timer = setTimeout(() => {
        setCollisionFlash(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [collisionDetection.lastCollision]);

  // Start game loop
  useGameLoop(engineRef, handleUpdate, isRunning);

  // Determine parking indicator state
  const getParkingIndicatorClass = () => {
    if (!parkingValidation.isInZone) return '';
    if (parkingValidation.parkingAccuracy >= 90) return 'game-canvas__parking-indicator';
    if (parkingValidation.parkingAccuracy >= 70) return 'game-canvas__parking-indicator game-canvas__parking-indicator--warning';
    return 'game-canvas__parking-indicator game-canvas__parking-indicator--error';
  };

  return (
    <div className={`game-canvas ${collisionFlash ? 'game-canvas--shake' : ''}`}>
      <canvas
        ref={canvasRef}
        className="game-canvas__viewport"
      />

      {/* Parking zone overlay indicators */}
      {parkingValidation.isInZone && (
        <div className={getParkingIndicatorClass()}>
          In Parking Zone
          <span className="game-canvas__accuracy">
            {Math.round(parkingValidation.parkingAccuracy)}%
          </span>
        </div>
      )}

      {/* Collision flash overlay */}
      {collisionFlash && (
        <div className="game-canvas__collision-overlay" />
      )}

      {/* Speed visual indicator */}
      <div className="game-canvas__speed-visual">
        <div className="game-canvas__speedometer">
          <div
            className="game-canvas__speed-needle"
            style={{
              '--speed-rotation': `${-90 + (carPhysics.speed / CAR.MAX_SPEED.FORWARD) * 180}deg`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
