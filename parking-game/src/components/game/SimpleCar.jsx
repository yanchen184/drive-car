import React, { useRef, useEffect, useState } from 'react';

/**
 * SimpleCar - 簡單的2D車輛控制系統
 *
 * 核心功能：
 * 1. 清晰的車輛視覺化（車身 + 可見的前輪）
 * 2. 方向盤控制前輪轉動（左右鍵）
 * 3. 前進/後退控制（上下鍵）
 * 4. 真實的車輛物理（沿著前輪方向移動）
 */
const SimpleCar = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const controlsRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // 車輛狀態
  const [carState, setCarState] = useState({
    x: 400,           // 車輛中心 x 座標
    y: 300,           // 車輛中心 y 座標
    angle: 0,         // 車身角度（弧度）
    steeringAngle: 0, // 方向盤/前輪角度（弧度）
    speed: 0,         // 當前速度
    maxSpeed: 5,      // 最大速度
    acceleration: 0.2,// 加速度
    friction: 0.95,   // 摩擦力
    wheelBase: 80,    // 軸距（前後輪距離）
  });

  // 車輛尺寸常數
  const CAR_WIDTH = 40;
  const CAR_LENGTH = 80;
  const WHEEL_WIDTH = 8;
  const WHEEL_LENGTH = 16;
  const MAX_STEERING_ANGLE = Math.PI / 4; // 45度

  /**
   * 繪製車輛
   */
  const drawCar = (ctx, car) => {
    ctx.save();

    // 移動到車輛中心並旋轉
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);

    // 繪製車身
    ctx.fillStyle = '#3B82F6'; // 藍色車身
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 2;
    ctx.fillRect(-CAR_WIDTH / 2, -CAR_LENGTH / 2, CAR_WIDTH, CAR_LENGTH);
    ctx.strokeRect(-CAR_WIDTH / 2, -CAR_LENGTH / 2, CAR_WIDTH, CAR_LENGTH);

    // 繪製車頭指示（三角形）
    ctx.fillStyle = '#EF4444'; // 紅色車頭
    ctx.beginPath();
    ctx.moveTo(0, -CAR_LENGTH / 2);
    ctx.lineTo(-10, -CAR_LENGTH / 2 + 15);
    ctx.lineTo(10, -CAR_LENGTH / 2 + 15);
    ctx.closePath();
    ctx.fill();

    // 繪製後輪（固定方向）
    const rearWheelY = CAR_LENGTH / 2 - 15;

    // 左後輪
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(-CAR_WIDTH / 2 - 2, rearWheelY - WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);

    // 右後輪
    ctx.fillRect(CAR_WIDTH / 2 - 6, rearWheelY - WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);

    // 繪製前輪（可轉動）
    const frontWheelY = -CAR_LENGTH / 2 + 15;

    // 左前輪
    ctx.save();
    ctx.translate(-CAR_WIDTH / 2 + 2, frontWheelY);
    ctx.rotate(car.steeringAngle);
    ctx.fillStyle = '#1F2937';
    ctx.strokeStyle = '#60A5FA'; // 藍色邊框表示可轉動
    ctx.lineWidth = 2;
    ctx.fillRect(-WHEEL_WIDTH / 2, -WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);
    ctx.strokeRect(-WHEEL_WIDTH / 2, -WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);
    ctx.restore();

    // 右前輪
    ctx.save();
    ctx.translate(CAR_WIDTH / 2 - 2, frontWheelY);
    ctx.rotate(car.steeringAngle);
    ctx.fillStyle = '#1F2937';
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 2;
    ctx.fillRect(-WHEEL_WIDTH / 2, -WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);
    ctx.strokeRect(-WHEEL_WIDTH / 2, -WHEEL_LENGTH / 2, WHEEL_WIDTH, WHEEL_LENGTH);
    ctx.restore();

    ctx.restore();
  };

  /**
   * 繪製場景
   */
  const drawScene = (ctx, canvas, car) => {
    // 清空畫布
    ctx.fillStyle = '#111827'; // 深灰色背景
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

    // 繪製車輛
    drawCar(ctx, car);

    // 繪製資訊面板
    ctx.fillStyle = '#F3F4F6';
    ctx.font = '14px monospace';
    ctx.fillText(`位置: (${Math.round(car.x)}, ${Math.round(car.y)})`, 10, 20);
    ctx.fillText(`速度: ${car.speed.toFixed(2)}`, 10, 40);
    ctx.fillText(`車身角度: ${(car.angle * 180 / Math.PI).toFixed(1)}°`, 10, 60);
    ctx.fillText(`方向盤角度: ${(car.steeringAngle * 180 / Math.PI).toFixed(1)}°`, 10, 80);

    // 繪製控制說明
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px monospace';
    ctx.fillText('控制: ↑前進 ↓後退 ←左轉 →右轉', 10, canvas.height - 10);
  };

  /**
   * 更新車輛物理
   */
  const updateCarPhysics = (car, controls) => {
    const newCar = { ...car };

    // 更新方向盤角度（慢速轉動，不自動回正）
    if (controls.left) {
      newCar.steeringAngle = Math.max(
        newCar.steeringAngle - 0.02,  // 降低速度，更慢
        -MAX_STEERING_ANGLE
      );
    } else if (controls.right) {
      newCar.steeringAngle = Math.min(
        newCar.steeringAngle + 0.02,  // 降低速度，更慢
        MAX_STEERING_ANGLE
      );
    }
    // 移除自動回正功能

    // 更新速度
    if (controls.forward) {
      newCar.speed = Math.min(newCar.speed + newCar.acceleration, newCar.maxSpeed);
    } else if (controls.backward) {
      newCar.speed = Math.max(newCar.speed - newCar.acceleration, -newCar.maxSpeed / 2);
    } else {
      // 應用摩擦力
      newCar.speed *= newCar.friction;
      if (Math.abs(newCar.speed) < 0.01) {
        newCar.speed = 0;
      }
    }

    // 使用 Ackermann 轉向幾何計算新的車身角度和位置
    if (Math.abs(newCar.speed) > 0.01) {
      // 計算轉向半徑
      if (Math.abs(newCar.steeringAngle) > 0.001) {
        const turningRadius = newCar.wheelBase / Math.tan(Math.abs(newCar.steeringAngle));
        const angularVelocity = newCar.speed / turningRadius;

        // 更新車身角度
        newCar.angle += angularVelocity * Math.sign(newCar.steeringAngle) * Math.sign(newCar.speed);
      }

      // 沿著車身方向移動
      newCar.x += Math.sin(newCar.angle) * newCar.speed;
      newCar.y -= Math.cos(newCar.angle) * newCar.speed;
    }

    // 邊界檢查
    const canvas = canvasRef.current;
    if (canvas) {
      newCar.x = Math.max(50, Math.min(canvas.width - 50, newCar.x));
      newCar.y = Math.max(50, Math.min(canvas.height - 50, newCar.y));
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

    // 更新車輛物理並繪製
    setCarState(prevCar => {
      const newCar = updateCarPhysics(prevCar, controlsRef.current);
      // 同步繪製新狀態
      drawScene(ctx, canvas, newCar);
      return newCar;
    });

    // 繼續動畫循環
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

    // 設置 canvas 尺寸
    canvas.width = 800;
    canvas.height = 600;

    // 啟動遊戲循環
    gameLoop();

    // 清理
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-100 text-center">
          簡單車輛控制系統 v3.0.1
        </h1>
        <p className="text-gray-400 text-center mt-2">
          使用方向鍵控制車輛：↑ 前進、↓ 後退、← 左轉、→ 右轉
        </p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-4 border-gray-700 rounded-lg shadow-2xl"
          data-testid="car-canvas"
        />

        {/* 方向盤UI - 左下角 */}
        <div className="absolute bottom-4 left-4 flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-2">方向盤</div>
          <div className="relative w-32 h-32 bg-gray-800 rounded-full border-4 border-gray-600 shadow-lg">
            {/* 方向盤外圈 */}
            <div className="absolute inset-2 bg-gray-700 rounded-full border-2 border-gray-500">
              {/* 方向盤中心 */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform"
                style={{
                  transform: `rotate(${carState.steeringAngle * (180 / Math.PI) * 3}deg)` // 放大旋轉角度以便觀察
                }}
              >
                {/* 方向盤握把 */}
                <div className="absolute w-1 h-16 bg-blue-400 rounded-full" style={{ top: '8px' }}></div>
                <div className="absolute w-16 h-1 bg-blue-400 rounded-full"></div>
                {/* 中心點 */}
                <div className="w-8 h-8 bg-gray-900 rounded-full border-2 border-blue-400 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {(carState.steeringAngle * 180 / Math.PI).toFixed(0)}°
          </div>
        </div>

        {/* 速度表 - 右下角 */}
        <div className="absolute bottom-4 right-4 flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-2">速度</div>
          <div className="w-24 h-24 bg-gray-800 rounded-full border-4 border-gray-600 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.abs(carState.speed).toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">
                {carState.speed > 0 ? '前進' : carState.speed < 0 ? '後退' : '靜止'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-800 rounded-lg max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-100 mb-2">核心功能</h2>
        <ul className="text-gray-300 space-y-1 text-sm">
          <li>✅ 清晰的車輛視覺化（藍色車身 + 可見的前後輪）</li>
          <li>✅ 方向盤控制前輪轉動（左右方向鍵，慢速轉動）</li>
          <li>✅ 前進/後退控制（上下方向鍵）</li>
          <li>✅ 真實的車輛物理（Ackermann 轉向，沿著前輪方向移動）</li>
          <li>✅ 前輪有藍色邊框表示可轉動</li>
          <li>✅ 方向盤不會自動回正（需手動調整）</li>
          <li>✅ 視覺化方向盤UI顯示當前角度</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleCar;
