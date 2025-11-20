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
const Level = ({ levelData, onLevelComplete, onLevelFailed, onNextLevel, currentLevelNumber }) => {
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
  const steeringSpeedRef = useRef(0.004);

  // 顯示用的狀態
  const [maxSpeedDisplay, setMaxSpeedDisplay] = useState(0.5);
  const [steeringSpeedDisplay, setSteeringSpeedDisplay] = useState(0.004);

  // 遊戲狀態
  const [gameTime, setGameTime] = useState(0);
  const [collisions, setCollisions] = useState(0);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [completionStats, setCompletionStats] = useState({});
  const gameStartTimeRef = useRef(null);
  const collisionsRef = useRef(0);
  const [collisionFlash, setCollisionFlash] = useState(false);
  const lastCollisionTimeRef = useRef(0);
  const collisionLockedRef = useRef(false); // 碰撞鎖定：碰撞後完全禁止移動

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

  // 車輛尺寸常數（增加 50%）
  const CAR_WIDTH = 60;
  const CAR_LENGTH = 120;
  const WHEEL_WIDTH = 12;
  const WHEEL_LENGTH = 24;
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

        case 'sidewalk':
          // 繪製人行道（淺灰色帶斑馬紋）
          ctx.fillStyle = '#94A3B8';
          ctx.fillRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);

          // 斑馬紋理
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 3;
          const stripeSpacing = 30;
          for (let i = -obstacle.width / 2; i < obstacle.width / 2; i += stripeSpacing) {
            ctx.beginPath();
            ctx.moveTo(i, -obstacle.height / 2);
            ctx.lineTo(i, obstacle.height / 2);
            ctx.stroke();
          }

          // 邊框
          ctx.strokeStyle = '#64748B';
          ctx.lineWidth = 2;
          ctx.strokeRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);

          // 文字標記
          ctx.fillStyle = '#475569';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('SIDEWALK', 0, 0);
          break;

        case 'curb':
          // 繪製路緣（細長的矩形）
          ctx.fillStyle = '#64748B';
          ctx.fillRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.strokeRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
          break;

        case 'barrier':
          // 繪製障礙物（垃圾桶、購物車等）
          ctx.fillStyle = '#6B7280';
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 2;
          ctx.fillRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
          ctx.strokeRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);

          // X 標記
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-obstacle.width / 3, -obstacle.height / 3);
          ctx.lineTo(obstacle.width / 3, obstacle.height / 3);
          ctx.moveTo(obstacle.width / 3, -obstacle.height / 3);
          ctx.lineTo(-obstacle.width / 3, obstacle.height / 3);
          ctx.stroke();
          break;

        default:
          break;
      }

      ctx.restore();
    });
  };

  /**
   * 獲取旋轉矩形的四個頂點座標
   */
  const getRotatedRectPoints = (x, y, width, height, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // 四個頂點（相對於中心點）
    const corners = [
      { x: -halfWidth, y: -halfHeight },
      { x: halfWidth, y: -halfHeight },
      { x: halfWidth, y: halfHeight },
      { x: -halfWidth, y: halfHeight },
    ];

    // 旋轉並平移到實際位置
    return corners.map(corner => ({
      x: x + (corner.x * cos - corner.y * sin),
      y: y + (corner.x * sin + corner.y * cos),
    }));
  };

  /**
   * 分離軸定理 (SAT) 碰撞檢測
   */
  const checkSATCollision = (points1, points2) => {
    const polygons = [points1, points2];

    for (const polygon of polygons) {
      for (let i = 0; i < polygon.length; i++) {
        const p1 = polygon[i];
        const p2 = polygon[(i + 1) % polygon.length];

        // 計算法向量（垂直於邊）
        const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
        const normal = { x: -edge.y, y: edge.x };

        // 投影兩個多邊形到法向量上
        let min1 = Infinity, max1 = -Infinity;
        let min2 = Infinity, max2 = -Infinity;

        for (const point of points1) {
          const projection = normal.x * point.x + normal.y * point.y;
          min1 = Math.min(min1, projection);
          max1 = Math.max(max1, projection);
        }

        for (const point of points2) {
          const projection = normal.x * point.x + normal.y * point.y;
          min2 = Math.min(min2, projection);
          max2 = Math.max(max2, projection);
        }

        // 檢查投影是否重疊
        if (max1 < min2 || max2 < min1) {
          return false; // 找到分離軸，無碰撞
        }
      }
    }

    return true; // 所有軸都重疊，有碰撞
  };

  /**
   * 檢查碰撞（使用旋轉矩形碰撞檢測）
   */
  const checkCollision = (car, obstacles) => {
    if (!obstacles || obstacles.length === 0) return false;

    // 獲取車輛的旋轉矩形頂點
    const carPoints = getRotatedRectPoints(car.x, car.y, CAR_WIDTH, CAR_LENGTH, car.angle);

    for (const obstacle of obstacles) {
      // 特殊處理圓形障礙物（pillar）
      if (obstacle.type === 'pillar') {
        // 使用圓形碰撞檢測
        const radius = obstacle.width / 2;
        let minDist = Infinity;

        // 檢查圓心到車輛各邊的最短距離
        for (const point of carPoints) {
          const dx = point.x - obstacle.x;
          const dy = point.y - obstacle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          minDist = Math.min(minDist, dist);
        }

        // 檢查車輛中心到圓心的距離
        const centerDx = car.x - obstacle.x;
        const centerDy = car.y - obstacle.y;
        const centerDist = Math.sqrt(centerDx * centerDx + centerDy * centerDy);

        if (centerDist < radius + Math.max(CAR_WIDTH, CAR_LENGTH) / 2) {
          if (minDist < radius) {
            return true;
          }
        }
      } else {
        // 矩形障礙物使用 SAT 碰撞檢測
        const obstaclePoints = getRotatedRectPoints(
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height,
          obstacle.angle || 0
        );

        if (checkSATCollision(carPoints, obstaclePoints)) {
          return true;
        }
      }
    }

    return false;
  };

  /**
   * 計算兩個旋轉矩形的重疊面積（使用 Sutherland-Hodgman 多邊形裁剪算法）
   */
  const calculateOverlapArea = (points1, points2) => {
    // Sutherland-Hodgman 算法：用一個多邊形裁剪另一個多邊形
    let outputPolygon = [...points1];

    for (let i = 0; i < points2.length; i++) {
      const edge = {
        p1: points2[i],
        p2: points2[(i + 1) % points2.length],
      };

      const inputPolygon = outputPolygon;
      outputPolygon = [];

      if (inputPolygon.length === 0) break;

      for (let j = 0; j < inputPolygon.length; j++) {
        const currentVertex = inputPolygon[j];
        const previousVertex = inputPolygon[(j - 1 + inputPolygon.length) % inputPolygon.length];

        const currentInside = isPointInsideEdge(currentVertex, edge);
        const previousInside = isPointInsideEdge(previousVertex, edge);

        if (currentInside) {
          if (!previousInside) {
            // 進入邊界，添加交點
            const intersection = getIntersection(previousVertex, currentVertex, edge.p1, edge.p2);
            if (intersection) outputPolygon.push(intersection);
          }
          outputPolygon.push(currentVertex);
        } else if (previousInside) {
          // 離開邊界，添加交點
          const intersection = getIntersection(previousVertex, currentVertex, edge.p1, edge.p2);
          if (intersection) outputPolygon.push(intersection);
        }
      }
    }

    // 計算多邊形面積（使用 Shoelace 公式）
    if (outputPolygon.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < outputPolygon.length; i++) {
      const j = (i + 1) % outputPolygon.length;
      area += outputPolygon[i].x * outputPolygon[j].y;
      area -= outputPolygon[j].x * outputPolygon[i].y;
    }
    return Math.abs(area) / 2;
  };

  /**
   * 判斷點是否在邊的內側
   */
  const isPointInsideEdge = (point, edge) => {
    const d = (edge.p2.x - edge.p1.x) * (point.y - edge.p1.y) -
              (edge.p2.y - edge.p1.y) * (point.x - edge.p1.x);
    return d >= 0;
  };

  /**
   * 計算兩條線段的交點
   */
  const getIntersection = (p1, p2, p3, p4) => {
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (Math.abs(denom) < 1e-10) return null;

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;

    return {
      x: p1.x + ua * (p2.x - p1.x),
      y: p1.y + ua * (p2.y - p1.y),
    };
  };

  /**
   * 檢查是否成功停車（使用車輛與停車格的重疊面積比例）
   */
  const checkParking = (car, spot) => {
    if (!spot) return { success: false, distance: 999, angleDiff: 999, speed: 999, percentage: 0 };

    const dx = car.x - spot.x;
    const dy = car.y - spot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angleDiff = Math.abs(car.angle - (spot.angle || 0)) * 180 / Math.PI;

    // 獲取車輛和停車格的旋轉矩形頂點
    const carPoints = getRotatedRectPoints(car.x, car.y, CAR_WIDTH, CAR_LENGTH, car.angle);
    const spotPoints = getRotatedRectPoints(spot.x, spot.y, spot.width, spot.height, spot.angle || 0);

    // 計算重疊面積
    const overlapArea = calculateOverlapArea(carPoints, spotPoints);

    // 車輛的總面積
    const carArea = CAR_WIDTH * CAR_LENGTH;

    // 停車格面積
    const spotArea = spot.width * spot.height;

    // 計算重疊百分比（車輛在停車格內的比例）
    const overlapPercentage = Math.min(100, (overlapArea / carArea) * 100);

    // Debug: 輸出詳細資訊（僅在接近成功時）
    if (overlapPercentage > 90) {
      console.log(`[Parking Debug] Overlap: ${overlapPercentage.toFixed(2)}%`);
      console.log(`  Car Area: ${carArea.toFixed(2)} (${CAR_WIDTH}×${CAR_LENGTH})`);
      console.log(`  Spot Area: ${spotArea.toFixed(2)} (${spot.width}×${spot.height})`);
      console.log(`  Overlap Area: ${overlapArea.toFixed(2)}`);
      console.log(`  Angle Diff: ${angleDiff.toFixed(2)}°`);
      console.log(`  Speed: ${Math.abs(car.speed).toFixed(3)}`);
    }

    // 速度檢查：停車時速度不能太快
    const maxSpeed = 1.0;
    const speedPenalty = Math.abs(car.speed) > maxSpeed ? 20 : 0;

    // 角度檢查：角度差異太大會扣分
    const maxAngleDiff = 15; // 最多允許 15 度偏差
    const anglePenalty = angleDiff > maxAngleDiff ? Math.min(20, (angleDiff - maxAngleDiff) * 2) : 0;

    // 最終精準度 = 重疊百分比 - 速度扣分 - 角度扣分
    const finalPercentage = Math.max(0, Math.round(overlapPercentage - speedPenalty - anglePenalty));

    // 停車成功條件：
    // 1. 重疊比例至少 95%（更嚴格的要求）
    // 2. 速度夠慢（< maxSpeed）
    // 3. 角度差異小於 20 度
    const isSuccess = overlapPercentage >= 95 && Math.abs(car.speed) < maxSpeed && angleDiff < 20;

    return {
      success: isSuccess,
      distance,
      angleDiff,
      speed: Math.abs(car.speed),
      percentage: finalPercentage,
      overlapPercentage: Math.round(overlapPercentage), // 純重疊百分比（無扣分）
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

    // 顯示停車百分比
    ctx.font = 'bold 18px monospace';
    const percentage = parkingStatus.percentage || 0;
    const overlapPercentage = parkingStatus.overlapPercentage || 0;

    // 根據百分比顯示不同顏色
    if (percentage >= 95) {
      ctx.fillStyle = '#10B981'; // 綠色 - 成功
    } else if (percentage >= 80) {
      ctx.fillStyle = '#F59E0B'; // 黃色 - 接近
    } else {
      ctx.fillStyle = '#EF4444'; // 紅色 - 需努力
    }

    ctx.fillText(`🎯 停車精準度: ${percentage}%`, 10, 110);

    // 顯示詳細資訊
    ctx.font = '14px monospace';
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText(`車輛進入停車格: ${overlapPercentage}%`, 10, 135);
    ctx.fillText(`角度偏差: ${parkingStatus.angleDiff.toFixed(1)}°`, 10, 155);
    ctx.fillText(`當前速度: ${parkingStatus.speed.toFixed(2)}`, 10, 175);

    if (parkingStatus.success) {
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#10B981';
      ctx.fillText('✓ 停車成功！(≥95%)', 10, 185);

      // 記錄完成但不顯示完整覆蓋層（改為顯示浮動按鈕）
      if (!gameCompletedRef.current) {
        gameCompletedRef.current = true;
        const elapsed = (Date.now() - gameStartTimeRef.current) / 1000;
        setCompletionStats({
          timeTaken: elapsed,
          accuracy: percentage,
          collisions: collisionsRef.current,
        });

        // 觸發完成事件（可選）
        if (onLevelComplete) {
          onLevelComplete({
            timeTaken: elapsed,
            accuracy: percentage,
            collisions: collisionsRef.current,
          });
        }
      }
    }
  };

  const gameCompletedRef = useRef(false);

  /**
   * 更新車輛物理
   */
  const updateCarPhysics = (car, controls) => {
    const newCar = { ...car };

    // 如果碰撞鎖定，完全禁止移動
    if (collisionLockedRef.current) {
      newCar.speed = 0;
      newCar.steeringAngle *= 0.9; // 方向盤慢慢回正
      return newCar;
    }

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
        // 修正：倒車時不反轉方向，保持直覺的左右轉向
        newCar.angle += angularVelocity * Math.sign(newCar.steeringAngle);
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
    const hasCollision = checkCollision(newCar, levelData?.obstacles);
    const now = Date.now();

    if (hasCollision) {
      // 碰撞時完全停止車輛並鎖定
      newCar.speed = 0;
      collisionLockedRef.current = true;

      // 只在500ms內計數一次碰撞（避免重複計數）
      if (now - lastCollisionTimeRef.current > 500) {
        lastCollisionTimeRef.current = now;
        collisionsRef.current += 1;

        // 碰撞視覺反饋
        setCollisionFlash(true);
        setTimeout(() => setCollisionFlash(false), 200);

        // 碰撞音效
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => console.log('Audio play failed:', err));
      }
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
   * 驗證關卡設計（開發模式檢查）
   */
  const validateLevelDesign = (level) => {
    if (!level) return true;

    const warnings = [];

    // 檢查停車格尺寸（必須能容納車輛）
    const spot = level.parkingSpot;
    if (spot) {
      // 考慮旋轉：0度或180度時，車輛長度對應spot高度
      // 90度或270度時，車輛長度對應spot寬度
      const spotAngleDeg = ((spot.angle || 0) * 180 / Math.PI) % 360;
      const isVertical = Math.abs(spotAngleDeg) < 45 || Math.abs(spotAngleDeg - 180) < 45;

      if (isVertical) {
        if (spot.width < CAR_WIDTH || spot.height < CAR_LENGTH) {
          warnings.push(`⚠️ Level ${level.levelNumber}: Parking spot (${spot.width}×${spot.height}) is too small for car (${CAR_WIDTH}×${CAR_LENGTH})`);
        }
      } else {
        if (spot.width < CAR_LENGTH || spot.height < CAR_WIDTH) {
          warnings.push(`⚠️ Level ${level.levelNumber}: Parking spot (${spot.width}×${spot.height}) is too small for rotated car (${CAR_LENGTH}×${CAR_WIDTH})`);
        }
      }
    }

    // 檢查障礙物是否與停車格重疊
    if (level.obstacles && spot) {
      const spotPoints = getRotatedRectPoints(spot.x, spot.y, spot.width, spot.height, spot.angle || 0);

      level.obstacles.forEach((obstacle, index) => {
        const obstaclePoints = getRotatedRectPoints(
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height,
          obstacle.angle || 0
        );

        const overlapArea = calculateOverlapArea(spotPoints, obstaclePoints);
        if (overlapArea > 1) {
          warnings.push(`⚠️ Level ${level.levelNumber}: Obstacle #${index + 1} (${obstacle.type}) overlaps with parking spot (${overlapArea.toFixed(0)} px²)`);
        }
      });
    }

    if (warnings.length > 0) {
      console.warn('🚨 Level Design Validation Issues:');
      warnings.forEach(w => console.warn(w));
    }

    return warnings.length === 0;
  };

  /**
   * 初始化 Canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1200;
    canvas.height = 900;

    // 驗證關卡設計（開發模式）
    validateLevelDesign(levelData);

    // 重置遊戲狀態（重要：新關卡載入時清除完成狀態）
    gameCompletedRef.current = false;
    gameStartTimeRef.current = Date.now();
    collisionsRef.current = 0;
    collisionLockedRef.current = false; // 解除碰撞鎖定
    setCollisions(0);
    setShowCompletionOverlay(false);

    // 重置車輛位置
    setCarState({
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

    // 啟動遊戲循環
    gameLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelData]);

  const handleNextLevel = () => {
    // 關閉覆蓋層並導航到下一關
    setShowCompletionOverlay(false);

    // 重置遊戲完成狀態（關鍵：讓浮動按鈕消失）
    gameCompletedRef.current = false;

    if (onNextLevel) {
      onNextLevel();
    } else {
      // 備用方案：如果沒有提供 onNextLevel，嘗試重新載入下一關
      const nextLevelNum = (currentLevelNumber || levelData?.levelNumber || 1) + 1;
      if (nextLevelNum <= 15) {
        window.location.href = `/?level=${nextLevelNum}`;
      } else {
        alert('恭喜！您已完成所有關卡！');
        window.location.href = '/';
      }
    }
  };

  const handleBackToMenu = () => {
    // 返回主選單
    window.location.href = '/';
  };

  const handleRestart = () => {
    // 重置遊戲狀態
    setCarState({
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

    // 重置遊戲計時和碰撞
    setGameTime(0);
    setCollisions(0);
    collisionsRef.current = 0;
    collisionLockedRef.current = false; // 解除碰撞鎖定
    gameStartTimeRef.current = Date.now();

    // 重置完成狀態
    setShowCompletionOverlay(false);
    gameCompletedRef.current = false;

    // 重置控制器
    controlsRef.current = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 relative transition-all duration-200 ${collisionFlash ? 'bg-red-900' : ''}`}>
      {/* 碰撞視覺提示 */}
      {collisionFlash && (
        <div className="fixed inset-0 bg-red-500 opacity-30 pointer-events-none z-40 animate-pulse"></div>
      )}

      {/* 浮動的下一關按鈕（停車成功時顯示）*/}
      {gameCompletedRef.current && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
          <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-center animate-bounce">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-2xl font-bold mb-2">停車成功！</div>
            <div className="text-lg">精準度: {completionStats.accuracy}%</div>
            <div className="text-sm opacity-90">時間: {completionStats.timeTaken?.toFixed(1)}s</div>
          </div>
          <button
            onClick={handleNextLevel}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-200 shadow-2xl hover:scale-105"
            data-testid="instant-next-level-button"
          >
            ➡️ 下一關
          </button>
          <button
            onClick={handleBackToMenu}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-xl"
          >
            🏠 返回主選單
          </button>
        </div>
      )}

      {/* 頂部控制按鈕 */}
      <div className="absolute top-4 right-4 flex gap-3 z-10">
        <button
          onClick={handleRestart}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 shadow-lg"
          data-testid="restart-button"
        >
          🔄 重新開始
        </button>
        <button
          onClick={handleBackToMenu}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 shadow-lg"
          data-testid="back-to-menu-button"
        >
          🏠 返回主選單
        </button>
      </div>

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

      {/* 完成覆蓋層 */}
      {showCompletionOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border-4 border-green-500 shadow-2xl">
            {/* 標題 */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold text-green-400 mb-2">關卡完成！</h2>
              <p className="text-gray-300 text-lg">
                Level {levelData?.levelNumber || 0}: {levelData?.title || 'Unknown'}
              </p>
            </div>

            {/* 統計資訊 */}
            <div className="bg-gray-900 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">停車精準度:</span>
                <span className="text-green-400 font-bold text-xl">
                  {completionStats.accuracy}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">完成時間:</span>
                <span className="text-blue-400 font-mono">
                  {completionStats.timeTaken?.toFixed(1)}s
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">碰撞次數:</span>
                <span className="text-yellow-400 font-mono">
                  {completionStats.collisions}
                </span>
              </div>
            </div>

            {/* 按鈕 */}
            <div className="space-y-3">
              <button
                onClick={handleNextLevel}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
                data-testid="next-level-button"
              >
                ➡️ 下一關
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                data-testid="back-to-menu-button"
              >
                🏠 返回主選單
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Level;
