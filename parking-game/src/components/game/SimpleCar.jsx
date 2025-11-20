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

  // 可調整的速度參數（使用 useRef 避免閉包問題）
  const maxSpeedRef = useRef(0.5);
  const steeringSpeedRef = useRef(0.001);

  // 顯示用的狀態（觸發重新渲染以更新 UI 顯示）
  const [maxSpeedDisplay, setMaxSpeedDisplay] = useState(0.5);
  const [steeringSpeedDisplay, setSteeringSpeedDisplay] = useState(0.001);

  // 停車成功狀態
  const [parkingSuccess, setParkingSuccess] = useState(false);
  const parkingSuccessRef = useRef(false);

  // 車輛狀態
  const [carState, setCarState] = useState({
    x: 200,           // 車輛中心 x 座標（起始位置調整）
    y: 500,           // 車輛中心 y 座標
    angle: 0,         // 車身角度（弧度）
    steeringAngle: 0, // 方向盤/前輪角度（弧度）
    speed: 0,         // 當前速度
    maxSpeed: 2,      // 最大速度（降低）
    acceleration: 0.1,// 加速度（降低）
    friction: 0.95,   // 摩擦力
    wheelBase: 80,    // 軸距（前後輪距離）
  });

  // 停車格配置
  const parkingSpot = {
    x: 600,           // 停車格中心 x
    y: 200,           // 停車格中心 y
    width: 60,        // 停車格寬度
    height: 100,      // 停車格長度
    angle: 0,         // 停車格角度
  };

  // 車輛尺寸常數（增加 50%）
  const CAR_WIDTH = 60;
  const CAR_LENGTH = 120;
  const WHEEL_WIDTH = 12;
  const WHEEL_LENGTH = 24;
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
   * 繪製停車格
   */
  const drawParkingSpot = (ctx, spot) => {
    ctx.save();
    ctx.translate(spot.x, spot.y);
    ctx.rotate(spot.angle);

    // 停車格底色（半透明黃色）
    ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
    ctx.fillRect(-spot.width / 2, -spot.height / 2, spot.width, spot.height);

    // 停車格邊線（黃色虛線）
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
   * 檢查是否成功停車（使用百分比計算）
   */
  const checkParking = (car, spot) => {
    // 計算距離
    const dx = car.x - spot.x;
    const dy = car.y - spot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 計算角度差異
    const angleDiff = Math.abs(car.angle - spot.angle) * 180 / Math.PI;

    // 計算停車百分比
    // 位置得分：距離越近得分越高（最遠允許 50px）
    const maxDistance = 50;
    const positionScore = Math.max(0, 100 - (distance / maxDistance) * 100);

    // 角度得分：角度差越小得分越高（最大允許 30 度）
    const maxAngleDiff = 30;
    const angleScore = Math.max(0, 100 - (angleDiff / maxAngleDiff) * 100);

    // 速度得分：速度越慢得分越高（最快允許 1.0）
    const maxSpeed = 1.0;
    const speedScore = Math.max(0, 100 - (Math.abs(car.speed) / maxSpeed) * 100);

    // 綜合得分（各佔 1/3）
    const percentage = Math.round((positionScore + angleScore + speedScore) / 3);

    // 停車成功條件：總分超過 80%
    const isSuccess = percentage >= 80;

    return {
      success: isSuccess,
      distance,
      angleDiff,
      speed: Math.abs(car.speed),
      percentage: Math.max(0, Math.min(100, percentage)), // 限制在 0-100
    };
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

    // 繪製停車格
    drawParkingSpot(ctx, parkingSpot);

    // 繪製車輛
    drawCar(ctx, car);

    // 檢查停車狀態
    const parkingStatus = checkParking(car, parkingSpot);

    // 檢測停車成功並觸發慶祝
    if (parkingStatus.success && !parkingSuccessRef.current) {
      parkingSuccessRef.current = true;
      setParkingSuccess(true);
    }

    // 繪製資訊面板
    ctx.fillStyle = '#F3F4F6';
    ctx.font = '14px monospace';
    ctx.fillText(`位置: (${Math.round(car.x)}, ${Math.round(car.y)})`, 10, 20);
    ctx.fillText(`速度: ${car.speed.toFixed(2)}`, 10, 40);
    ctx.fillText(`車身角度: ${(car.angle * 180 / Math.PI).toFixed(1)}°`, 10, 60);
    ctx.fillText(`方向盤角度: ${(car.steeringAngle * 180 / Math.PI).toFixed(1)}°`, 10, 80);

    // 顯示停車百分比
    ctx.font = 'bold 18px monospace';
    const percentage = parkingStatus.percentage || 0;

    // 根據百分比顯示不同顏色
    if (percentage >= 80) {
      ctx.fillStyle = '#10B981'; // 綠色 - 成功
    } else if (percentage >= 60) {
      ctx.fillStyle = '#F59E0B'; // 黃色 - 接近
    } else {
      ctx.fillStyle = '#EF4444'; // 紅色 - 需努力
    }

    ctx.fillText(`🎯 停車精準度: ${percentage}%`, 10, 110);

    // 顯示停車狀態
    ctx.font = 'bold 16px monospace';
    if (parkingStatus.success) {
      ctx.fillStyle = '#10B981'; // 綠色
      ctx.fillText('✓ 停車成功！(≥80%)', 10, 135);

      // 繪製大型成功訊息覆蓋層
      ctx.save();

      // 半透明深色背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 成功訊息框
      const boxWidth = 500;
      const boxHeight = 250;
      const boxX = (canvas.width - boxWidth) / 2;
      const boxY = (canvas.height - boxHeight) / 2;

      // 背景框
      ctx.fillStyle = '#1F2937';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 4;
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      // 成功標題
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎉 停車成功！', canvas.width / 2, boxY + 70);

      // 第0關完成訊息
      ctx.fillStyle = '#F3F4F6';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('第 0 關 - 教學關卡完成', canvas.width / 2, boxY + 130);

      // 提示訊息
      ctx.font = '16px Arial';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText('您已掌握基本停車技巧', canvas.width / 2, boxY + 180);

      ctx.restore();
    } else {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '14px monospace';
      ctx.fillText(`距離: ${parkingStatus.distance.toFixed(1)}px`, 10, 160);
      ctx.fillText(`角度差: ${parkingStatus.angleDiff.toFixed(1)}°`, 10, 180);
    }

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

    // 更新方向盤角度（使用可調整的轉向速度，不自動回正）
    if (controls.left) {
      newCar.steeringAngle = Math.max(
        newCar.steeringAngle - steeringSpeedRef.current,  // 使用 ref 中的轉向速度
        -MAX_STEERING_ANGLE
      );
    } else if (controls.right) {
      newCar.steeringAngle = Math.min(
        newCar.steeringAngle + steeringSpeedRef.current,  // 使用 ref 中的轉向速度
        MAX_STEERING_ANGLE
      );
    }
    // 移除自動回正功能

    // 更新速度（使用可調整的最大速度）
    if (controls.forward) {
      newCar.speed = Math.min(newCar.speed + newCar.acceleration, maxSpeedRef.current);
    } else if (controls.backward) {
      newCar.speed = Math.max(newCar.speed - newCar.acceleration, -maxSpeedRef.current / 2);
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

    // 設置 canvas 尺寸（增加 50%）
    canvas.width = 1200;
    canvas.height = 900;

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
          停車挑戰 v3.3.0 - 第 0 關（教學關）
        </h1>
        <p className="text-gray-400 text-center mt-2">
          使用方向鍵控制車輛停入黃色停車格：↑ 前進、↓ 後退、← 左轉、→ 右轉
        </p>
        <p className="text-yellow-400 text-center mt-1 text-sm">
          🎯 目標：將車輛準確停入停車格（停車精準度 ≥ 80%）
        </p>
      </div>

      {/* 速度控制滑桿 */}
      <div className="mb-4 p-4 bg-gray-800 rounded-lg w-full max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-100 mb-3 text-center">⚙️ 速度調整控制</h2>

        <div className="space-y-4">
          {/* 車輛速度滑桿 */}
          <div className="flex items-center gap-4">
            <label className="text-gray-300 w-32 text-sm font-medium">
              🚗 車輛速度:
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={maxSpeedDisplay}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                maxSpeedRef.current = value;  // 更新 ref（立即生效）
                setMaxSpeedDisplay(value);     // 更新顯示狀態
              }}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-blue-400 font-mono text-sm w-16 text-right">
              {maxSpeedDisplay.toFixed(1)}
            </span>
          </div>

          {/* 轉向速度滑桿 */}
          <div className="flex items-center gap-4">
            <label className="text-gray-300 w-32 text-sm font-medium">
              🎯 轉向速度:
            </label>
            <input
              type="range"
              min="0.001"
              max="0.02"
              step="0.001"
              value={steeringSpeedDisplay}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                steeringSpeedRef.current = value;  // 更新 ref（立即生效）
                setSteeringSpeedDisplay(value);     // 更新顯示狀態
              }}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <span className="text-green-400 font-mono text-sm w-16 text-right">
              {steeringSpeedDisplay.toFixed(3)}
            </span>
          </div>
        </div>

        <p className="text-gray-500 text-xs text-center mt-3">
          💡 拖動滑桿即時調整速度，找到最適合您的控制感覺
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
        <h2 className="text-lg font-semibold text-gray-100 mb-2">🎓 教學關卡 - 學習基本停車技巧</h2>
        <ul className="text-gray-300 space-y-1 text-sm">
          <li>✅ 清晰的車輛視覺化（藍色車身 + 可見的前後輪）</li>
          <li>✅ <span className="text-yellow-400 font-semibold">可調整速度控制</span>（滑桿即時調整車速和轉向速度）</li>
          <li>✅ 真實的車輛物理（Ackermann 轉向，沿著前輪方向移動）</li>
          <li>✅ 視覺化方向盤UI實時顯示轉向角度</li>
          <li>✅ 視覺化速度表顯示當前速度</li>
          <li>✅ 停車格挑戰（黃色虛線標記）</li>
          <li>✅ 即時停車狀態反饋（距離、角度差）</li>
          <li>✅ 方向盤不會自動回正（需手動調整）</li>
          <li>✅ 自訂控制感受，找到最適合您的速度設定</li>
          <li>🎯 <span className="text-green-400 font-semibold">完成本關後解鎖更多停車挑戰</span></li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleCar;
