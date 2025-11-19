import React, { useRef, useEffect, useState } from 'react';

/**
 * Level - 完整的關卡遊戲組件
 *
 * 功能：
 * 1. 支援關卡配置（停車格、障礙物、起始位置）
 * 2. 障礙物渲染和碰撞檢測
 * 3. 計時系統
 * 4. 星級評分系統
 * 5. 可調整速度控制
 */
const Level = ({ levelData, onLevelComplete, onLevelFailed }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // 控制器（使用 useRef 避免閉包問題）
  const controlsRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // 可調整的速度參數
  const maxSpeedRef = useRef(0.5);
  const steeringSpeedRef = useRef(0.001);

  // 顯示用的狀態
  const [maxSpeedDisplay, setMaxSpeedDisplay] = useState(0.5);
  const [steeringSpeedDisplay, setSteeringSpeedDisplay] = useState(0.001);

  // 遊戲狀態
  const [gameTime, setGameTime] = useState(0);
  const [collisions, setCollisions] = useState(0);
  const gameStartTimeRef = useRef(null);
  const collisionsRef = useRef(0);

  // 車輛狀態
  const [carState, setCarState] = useState({
    x: levelData?.carStartPosition?.x || 200,
    y: levelData?.carStartPosition?.y || 500,
    angle: levelData?.carStartPosition?.angle || 0,
    steeringAngle: 0,
    speed: 0,
    maxSpeed: 0.5,
    acceleration: 0.1,
    friction: 0.95,
    wheelBase: 80,
  });

  // 車輛尺寸常數
  const CAR_WIDTH = 40;
  const CAR_LENGTH = 80;
  const WHEEL_WIDTH = 8;
  const WHEEL_LENGTH = 16;
  const MAX_STEERING_ANGLE = Math.PI / 4;

  /**
   * 繪製車輛
   */
  const drawCar = (ctx, car) => {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);

    // 車身
    ctx.fillStyle = '#3B82F6';
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 2;
    ctx.fillRect(-CAR_WIDTH / 2, -CAR_LENGTH / 2, CAR_WIDTH, CAR_LENGTH);
    ctx.strokeRect(-CAR_WIDTH / 2, -CAR_LENGTH / 2, CAR_WIDTH, CAR_LENGTH);

    // 車頭指示
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(0, -CAR_LENGTH / 2);
    ctx.lineTo(-10, -CAR_LENGTH / 2 + 15);
    ctx.lineTo(10, -CAR_LENGTH / 2 + 15);
    ctx.closePath();
    ctx.fill();

    // 後輪
    const rearWheelY = CAR_LENGTH / 2 - 15;
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(-CAR_WIDTH / 2 - 2, rearWheelY - WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);
    ctx.fillRect(CAR_WIDTH / 2 - 6, rearWheelY - WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);

    // 前輪（可轉動）
    const frontWheelY = -CAR_LENGTH / 2 + 15;

    // 左前輪
    ctx.save();
    ctx.translate(-CAR_WIDTH / 2 + 2, frontWheelY);
    ctx.rotate(car.steeringAngle);
    ctx.fillStyle = '#1F2937';
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 2;
    ctx.fillRect(-WHEEL_WIDTH / 2, -WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);
    ctx.strokeRect(-WHEEL_WIDTH / 2, -WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);
    ctx.restore();

    // 右前輪
    ctx.save();
    ctx.translate(CAR_WIDTH / 2 - 2, frontWheelY);
    ctx.rotate(car.steeringAngle);
    ctx.fillRect(-WHEEL_WIDTH / 2, -WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);
    ctx.strokeRect(-WHEEL_WIDTH / 2, -WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);
    ctx.restore();

    ctx.restore();
  };

  /**
   * 繪製停車格
   */
  const drawParkingSpot = (ctx, spot) => {
    if (!spot) return;

    ctx.save();
    ctx.translate(spot.x, spot.y);
    ctx.rotate(spot.angle || 0);

    // 停車格底色
    ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
    ctx.fillRect(-spot.width / 2, -spot.height / 2, spot.width, spot.height);

    // 停車格邊線
    ctx.strokeStyle = '#EAB308';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(-spot.width / 2, -spot.height / 2, spot.width, spot.height);
    ctx.setLineDash([]);

    // 停車格標記 "P"
    ctx.fillStyle = '#EAB308';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', 0, 0);

    ctx.restore();
  };

  /**
   * 繪製障礙物
   */
  const drawObstacles = (ctx, obstacles) => {
    if (!obstacles) return;

    obstacles.forEach(obstacle => {
      ctx.save();
      ctx.translate(obstacle.x, obstacle.y);
      ctx.rotate(obstacle.angle || 0);

      switch (obstacle.type) {
        case 'car':
          // 其他車輛（灰色）
          ctx.fillStyle = '#6B7280';
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 2;
          ctx.fillRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
          ctx.strokeRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
          break;

        case 'wall':
          // 牆壁（深灰色）
          ctx.fillStyle = '#1F2937';
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 2;
          ctx.fillRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
          ctx.strokeRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
          break;

        case 'pillar':
          // 柱子（圓形）
          ctx.fillStyle = '#374151';
          ctx.strokeStyle = '#1F2937';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, obstacle.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;

        case 'cone':
          // 錐筒（橘色三角形）
          ctx.fillStyle = '#F97316';
          ctx.strokeStyle = '#EA580C';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -obstacle.height / 2);
          ctx.lineTo(-obstacle.width / 2, obstacle.height / 2);
          ctx.lineTo(obstacle.width / 2, obstacle.height / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;

        default:
          break;
      }

      ctx.restore();
    });
  };

  /**
   * 檢查碰撞（簡化版矩形碰撞）
   */
  const checkCollision = (car, obstacles) => {
    if (!obstacles || obstacles.length === 0) return false;

    const carRect = {
      left: car.x - CAR_WIDTH / 2,
      right: car.x + CAR_WIDTH / 2,
      top: car.y - CAR_LENGTH / 2,
      bottom: car.y + CAR_LENGTH / 2,
    };

    for (const obstacle of obstacles) {
      const obstacleRect = {
        left: obstacle.x - obstacle.width / 2,
        right: obstacle.x + obstacle.width / 2,
        top: obstacle.y - obstacle.height / 2,
        bottom: obstacle.y + obstacle.height / 2,
      };

      // AABB 碰撞檢測
      if (
        carRect.left < obstacleRect.right &&
        carRect.right > obstacleRect.left &&
        carRect.top < obstacleRect.bottom &&
        carRect.bottom > obstacleRect.top
      ) {
        return true;
      }
    }

    return false;
  };

  /**
   * 檢查是否成功停車
   */
  const checkParking = (car, spot) => {
    if (!spot) return { success: false, distance: 999, angleDiff: 999, speed: 999 };

    const dx = car.x - spot.x;
    const dy = car.y - spot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angleDiff = Math.abs(car.angle - (spot.angle || 0)) * 180 / Math.PI;

    const isInPosition = distance < 20;
    const isAligned = angleDiff < 5;
    const isStopped = Math.abs(car.speed) < 0.1;

    return {
      success: isInPosition && isAligned && isStopped,
      distance,
      angleDiff,
      speed: Math.abs(car.speed),
    };
  };

  /**
   * 繪製場景
   */
  const drawScene = (ctx, canvas, car) => {
    // 清空畫布
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製網格
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 繪製停車格
    drawParkingSpot(ctx, levelData?.parkingSpot);

    // 繪製障礙物
    drawObstacles(ctx, levelData?.obstacles);

    // 繪製車輛
    drawCar(ctx, car);

    // 檢查停車狀態
    const parkingStatus = checkParking(car, levelData?.parkingSpot);

    // 繪製資訊面板
    ctx.fillStyle = '#F3F4F6';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Level ${levelData?.levelNumber || 0}: ${levelData?.title || 'Unknown'}`, 10, 20);
    ctx.fillText(`Time: ${gameTime.toFixed(1)}s`, 10, 40);
    ctx.fillText(`Collisions: ${collisionsRef.current}`, 10, 60);
    ctx.fillText(`Speed: ${car.speed.toFixed(2)}`, 10, 80);

    // 顯示停車狀態
    ctx.font = 'bold 16px monospace';
    if (parkingStatus.success) {
      ctx.fillStyle = '#10B981';
      ctx.fillText('✓ Parked!', 10, 110);

      // 觸發完成事件
      if (onLevelComplete && !gameCompletedRef.current) {
        gameCompletedRef.current = true;
        const elapsed = (Date.now() - gameStartTimeRef.current) / 1000;
        onLevelComplete({
          timeTaken: elapsed,
          accuracy: 100 - (parkingStatus.distance + parkingStatus.angleDiff),
          collisions: collisionsRef.current,
        });
      }
    } else {
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText(`Distance: ${parkingStatus.distance.toFixed(1)}px`, 10, 110);
      ctx.fillText(`Angle: ${parkingStatus.angleDiff.toFixed(1)}°`, 10, 130);
    }
  };

  const gameCompletedRef = useRef(false);

  /**
   * 更新車輛物理
   */
  const updateCarPhysics = (car, controls) => {
    const newCar = { ...car };

    // 更新方向盤角度
    if (controls.left) {
      newCar.steeringAngle = Math.max(
        newCar.steeringAngle - steeringSpeedRef.current,
        -MAX_STEERING_ANGLE
      );
    } else if (controls.right) {
      newCar.steeringAngle = Math.min(
        newCar.steeringAngle + steeringSpeedRef.current,
        MAX_STEERING_ANGLE
      );
    }

    // 更新速度
    if (controls.forward) {
      newCar.speed = Math.min(newCar.speed + newCar.acceleration, maxSpeedRef.current);
    } else if (controls.backward) {
      newCar.speed = Math.max(newCar.speed - newCar.acceleration, -maxSpeedRef.current / 2);
    } else {
      newCar.speed *= newCar.friction;
      if (Math.abs(newCar.speed) < 0.01) {
        newCar.speed = 0;
      }
    }

    // Ackermann 轉向
    if (Math.abs(newCar.speed) > 0.01) {
      if (Math.abs(newCar.steeringAngle) > 0.001) {
        const turningRadius = newCar.wheelBase / Math.tan(Math.abs(newCar.steeringAngle));
        const angularVelocity = newCar.speed / turningRadius;
        newCar.angle += angularVelocity * Math.sign(newCar.steeringAngle) * Math.sign(newCar.speed);
      }

      newCar.x += Math.sin(newCar.angle) * newCar.speed;
      newCar.y -= Math.cos(newCar.angle) * newCar.speed;
    }

    // 邊界檢查
    const canvas = canvasRef.current;
    if (canvas) {
      newCar.x = Math.max(50, Math.min(canvas.width - 50, newCar.x));
      newCar.y = Math.max(50, Math.min(canvas.height - 50, newCar.y));
    }

    // 碰撞檢測
    if (checkCollision(newCar, levelData?.obstacles)) {
      collisionsRef.current += 1;
      // 碰撞後停車
      newCar.speed = 0;
    }

    return newCar;
  };

  /**
   * 遊戲循環
   */
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 更新計時
    if (gameStartTimeRef.current) {
      setGameTime((Date.now() - gameStartTimeRef.current) / 1000);
    }

    // 更新車輛物理並繪製
    setCarState(prevCar => {
      const newCar = updateCarPhysics(prevCar, controlsRef.current);
      drawScene(ctx, canvas, newCar);
      return newCar;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  /**
   * 鍵盤事件處理
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp':
          controlsRef.current.forward = true;
          break;
        case 'ArrowDown':
          controlsRef.current.backward = true;
          break;
        case 'ArrowLeft':
          controlsRef.current.left = true;
          break;
        case 'ArrowRight':
          controlsRef.current.right = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          controlsRef.current.forward = false;
          break;
        case 'ArrowDown':
          controlsRef.current.backward = false;
          break;
        case 'ArrowLeft':
          controlsRef.current.left = false;
          break;
        case 'ArrowRight':
          controlsRef.current.right = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  /**
   * 初始化 Canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;

    // 啟動計時
    gameStartTimeRef.current = Date.now();

    // 啟動遊戲循環
    gameLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-100 text-center">
          Level {levelData?.levelNumber || 0}: {levelData?.title || 'Unknown'}
        </h1>
        <p className="text-gray-400 text-center mt-2">
          {levelData?.hints?.[0] || '使用方向鍵控制車輛'}
        </p>
      </div>

      {/* 速度控制滑桿 */}
      <div className="mb-4 p-4 bg-gray-800 rounded-lg w-full max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-100 mb-3 text-center">⚙️ 速度調整</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-gray-300 w-32 text-sm font-medium">🚗 車輛速度:</label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={maxSpeedDisplay}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                maxSpeedRef.current = value;
                setMaxSpeedDisplay(value);
              }}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-blue-400 font-mono text-sm w-16 text-right">
              {maxSpeedDisplay.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-gray-300 w-32 text-sm font-medium">🎯 轉向速度:</label>
            <input
              type="range"
              min="0.001"
              max="0.02"
              step="0.001"
              value={steeringSpeedDisplay}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                steeringSpeedRef.current = value;
                setSteeringSpeedDisplay(value);
              }}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <span className="text-green-400 font-mono text-sm w-16 text-right">
              {steeringSpeedDisplay.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="border-4 border-gray-700 rounded-lg shadow-2xl"
        data-testid="level-canvas"
      />
    </div>
  );
};

export default Level;
