import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * 關卡編輯器 - 可視化拖曳設計關卡
 *
 * 功能：
 * - 拖曳編輯停車格（位置、大小、旋轉）
 * - 拖曳設定車輛起始位置
 * - 拖曳新增/移動障礙物
 * - 自動防止重疊（碰撞推開）
 * - 儲存到 localStorage
 */
const LevelEditor = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelData, setLevelData] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState('select'); // 'select', 'add-car', 'add-wall', etc.

  // 畫布尺寸
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 900;

  // 車輛尺寸
  const CAR_WIDTH = 60;
  const CAR_LENGTH = 120;

  // 障礙物類型定義
  const OBSTACLE_TYPES = [
    { id: 'car', name: '車輛', icon: '🚗', width: 60, height: 100, color: '#3B82F6' },
    { id: 'wall', name: '圍牆', icon: '🧱', width: 15, height: 150, color: '#6B7280' },
    { id: 'pillar', name: '柱子', icon: '⬛', width: 22, height: 22, color: '#374151' },
    { id: 'cone', name: '錐筒', icon: '🚧', width: 15, height: 15, color: '#F59E0B' },
    { id: 'sidewalk', name: '人行道', icon: '🟫', width: 300, height: 40, color: '#92400E' },
    { id: 'curb', name: '路緣', icon: '▬', width: 200, height: 20, color: '#78350F' },
    { id: 'barrier', name: '障礙物', icon: '🚧', width: 20, height: 20, color: '#DC2626' },
  ];

  /**
   * 載入關卡數據
   */
  useEffect(() => {
    loadLevel(currentLevel);
  }, [currentLevel]);

  const loadLevel = async (levelNumber) => {
    try {
      // 先嘗試從 localStorage 載入自定義關卡
      const savedLevel = localStorage.getItem(`custom-level-${levelNumber}`);
      if (savedLevel) {
        setLevelData(JSON.parse(savedLevel));
        return;
      }

      // 否則載入預設關卡
      const levelModule = await import(`../../data/levels/level${levelNumber.toString().padStart(2, '0')}.json`);
      setLevelData(levelModule.default);
    } catch (error) {
      console.error(`Failed to load level ${levelNumber}:`, error);
      // 創建空白關卡
      setLevelData({
        levelNumber,
        title: `Custom Level ${levelNumber}`,
        difficulty: 'custom',
        parkingSpot: {
          x: 400,
          y: 300,
          width: 70,
          height: 130,
          angle: 0
        },
        obstacles: [],
        carStartPosition: {
          x: 200,
          y: 500,
          angle: 0
        },
        timeLimit: 120,
        par: {
          time: 60,
          accuracy: 95,
          collisions: 0
        },
        hints: []
      });
    }
  };

  /**
   * 儲存關卡
   */
  const saveLevel = () => {
    if (!levelData) return;

    // 驗證關卡
    const validation = validateLevel(levelData);
    if (!validation.valid) {
      alert(`關卡驗證失敗：\n${validation.errors.join('\n')}`);
      return;
    }

    // 儲存到 localStorage
    localStorage.setItem(`custom-level-${currentLevel}`, JSON.stringify(levelData));
    alert(`✅ 關卡 ${currentLevel} 已儲存！`);
  };

  /**
   * 驗證關卡設計
   */
  const validateLevel = (level) => {
    const errors = [];

    // 檢查停車格尺寸
    const spot = level.parkingSpot;
    if (spot.width < CAR_WIDTH || spot.height < CAR_LENGTH) {
      errors.push(`停車格太小 (${spot.width}×${spot.height})，需至少 ${CAR_WIDTH}×${CAR_LENGTH}`);
    }

    // 檢查障礙物與停車格重疊
    // TODO: 實作重疊檢測

    return {
      valid: errors.length === 0,
      errors
    };
  };

  /**
   * 繪製關卡
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !levelData) return;

    const ctx = canvas.getContext('2d');
    drawLevel(ctx, levelData);
  }, [levelData, selectedObject]);

  const drawLevel = (ctx, level) => {
    // 清空畫布
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 繪製網格
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // 繪製停車格
    drawParkingSpot(ctx, level.parkingSpot, selectedObject?.type === 'parkingSpot');

    // 繪製車輛起始位置
    drawCarStart(ctx, level.carStartPosition, selectedObject?.type === 'carStart');

    // 繪製障礙物
    level.obstacles.forEach((obstacle, index) => {
      drawObstacle(ctx, obstacle, selectedObject?.type === 'obstacle' && selectedObject?.index === index);
    });
  };

  const drawParkingSpot = (ctx, spot, isSelected) => {
    ctx.save();
    ctx.translate(spot.x, spot.y);
    ctx.rotate(spot.angle || 0);

    // 停車格（虛線邊框）
    ctx.strokeStyle = isSelected ? '#10B981' : '#F59E0B';
    ctx.lineWidth = isSelected ? 4 : 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(-spot.width / 2, -spot.height / 2, spot.width, spot.height);
    ctx.setLineDash([]);

    // 填充（半透明）
    ctx.fillStyle = isSelected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)';
    ctx.fillRect(-spot.width / 2, -spot.height / 2, spot.width, spot.height);

    // 標籤
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🅿️ 停車格', 0, 0);

    ctx.restore();
  };

  const drawCarStart = (ctx, start, isSelected) => {
    ctx.save();
    ctx.translate(start.x, start.y);
    ctx.rotate(start.angle || 0);

    // 車輛輪廓
    ctx.strokeStyle = isSelected ? '#10B981' : '#3B82F6';
    ctx.fillStyle = isSelected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = isSelected ? 4 : 2;
    ctx.fillRect(-CAR_WIDTH / 2, -CAR_LENGTH / 2, CAR_WIDTH, CAR_LENGTH);
    ctx.strokeRect(-CAR_WIDTH / 2, -CAR_LENGTH / 2, CAR_WIDTH, CAR_LENGTH);

    // 方向指示
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.moveTo(0, -CAR_LENGTH / 2 - 10);
    ctx.lineTo(-10, -CAR_LENGTH / 2);
    ctx.lineTo(10, -CAR_LENGTH / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  const drawObstacle = (ctx, obstacle, isSelected) => {
    const obstacleType = OBSTACLE_TYPES.find(t => t.id === obstacle.type);
    if (!obstacleType) return;

    ctx.save();
    ctx.translate(obstacle.x, obstacle.y);
    ctx.rotate(obstacle.angle || 0);

    // 障礙物矩形
    ctx.fillStyle = isSelected ? 'rgba(16, 185, 129, 0.5)' : `${obstacleType.color}CC`;
    ctx.strokeStyle = isSelected ? '#10B981' : obstacleType.color;
    ctx.lineWidth = isSelected ? 4 : 2;
    ctx.fillRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
    ctx.strokeRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);

    // 圖標
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obstacleType.icon, 0, 0);

    ctx.restore();
  };

  /**
   * 滑鼠事件處理
   */
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !levelData) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 如果是新增模式，在點擊位置新增障礙物
    if (toolMode.startsWith('add-')) {
      const obstacleTypeId = toolMode.replace('add-', '');
      addObstacle(obstacleTypeId, x, y);
      setToolMode('select'); // 切回選擇模式
      return;
    }

    // 檢測點擊的物體
    const clicked = getObjectAtPosition(x, y);
    if (clicked) {
      setSelectedObject(clicked);
      setIsDragging(true);
      setDragOffset({
        x: x - clicked.object.x,
        y: y - clicked.object.y
      });
    } else {
      setSelectedObject(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedObject || !levelData) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newX = x - dragOffset.x;
    const newY = y - dragOffset.y;

    // 更新物體位置
    updateObjectPosition(selectedObject, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getObjectAtPosition = (x, y) => {
    if (!levelData) return null;

    // 檢查停車格
    const spot = levelData.parkingSpot;
    if (isPointInRect(x, y, spot.x, spot.y, spot.width, spot.height, spot.angle || 0)) {
      return { type: 'parkingSpot', object: spot };
    }

    // 檢查車輛起始位置
    const start = levelData.carStartPosition;
    if (isPointInRect(x, y, start.x, start.y, CAR_WIDTH, CAR_LENGTH, start.angle || 0)) {
      return { type: 'carStart', object: start };
    }

    // 檢查障礙物
    for (let i = levelData.obstacles.length - 1; i >= 0; i--) {
      const obstacle = levelData.obstacles[i];
      if (isPointInRect(x, y, obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.angle || 0)) {
        return { type: 'obstacle', object: obstacle, index: i };
      }
    }

    return null;
  };

  const isPointInRect = (px, py, cx, cy, width, height, angle) => {
    // 旋轉點到矩形的本地座標
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const dx = px - cx;
    const dy = py - cy;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    return Math.abs(localX) <= width / 2 && Math.abs(localY) <= height / 2;
  };

  /**
   * 新增障礙物
   */
  const addObstacle = (typeId, x, y) => {
    const obstacleType = OBSTACLE_TYPES.find(t => t.id === typeId);
    if (!obstacleType) return;

    const newObstacle = {
      type: typeId,
      x,
      y,
      width: obstacleType.width,
      height: obstacleType.height,
      angle: 0
    };

    // 檢查並修正重疊
    const resolvedPosition = resolveOverlap(newObstacle, levelData);
    newObstacle.x = resolvedPosition.x;
    newObstacle.y = resolvedPosition.y;

    const updatedLevel = {
      ...levelData,
      obstacles: [...levelData.obstacles, newObstacle]
    };

    setLevelData(updatedLevel);
    setSelectedObject({ type: 'obstacle', object: newObstacle, index: updatedLevel.obstacles.length - 1 });
  };

  /**
   * 檢測並解決重疊（推開）
   */
  const resolveOverlap = (movingObject, level) => {
    let finalX = movingObject.x;
    let finalY = movingObject.y;
    const maxIterations = 20;
    let iteration = 0;

    while (iteration < maxIterations) {
      let hasOverlap = false;
      const testObject = { ...movingObject, x: finalX, y: finalY };

      // 檢查與停車格的重疊
      const spotOverlap = checkRectOverlap(
        testObject,
        { ...level.parkingSpot, width: level.parkingSpot.width, height: level.parkingSpot.height }
      );

      if (spotOverlap.overlapping) {
        finalX += spotOverlap.pushX;
        finalY += spotOverlap.pushY;
        hasOverlap = true;
      }

      // 檢查與其他障礙物的重疊
      for (const obstacle of level.obstacles) {
        if (obstacle === movingObject) continue;

        const obstacleOverlap = checkRectOverlap(testObject, obstacle);
        if (obstacleOverlap.overlapping) {
          finalX += obstacleOverlap.pushX;
          finalY += obstacleOverlap.pushY;
          hasOverlap = true;
          break; // 一次只處理一個重疊
        }
      }

      if (!hasOverlap) break;
      iteration++;
    }

    // 確保在畫布範圍內
    finalX = Math.max(movingObject.width / 2 + 10, Math.min(CANVAS_WIDTH - movingObject.width / 2 - 10, finalX));
    finalY = Math.max(movingObject.height / 2 + 10, Math.min(CANVAS_HEIGHT - movingObject.height / 2 - 10, finalY));

    return { x: finalX, y: finalY };
  };

  /**
   * 檢測兩個矩形是否重疊（簡化版，不考慮旋轉）
   */
  const checkRectOverlap = (rect1, rect2) => {
    const dx = rect2.x - rect1.x;
    const dy = rect2.y - rect1.y;
    const minDistX = (rect1.width + rect2.width) / 2;
    const minDistY = (rect1.height + rect2.height) / 2;

    const overlapX = minDistX - Math.abs(dx);
    const overlapY = minDistY - Math.abs(dy);

    if (overlapX > 0 && overlapY > 0) {
      // 有重疊，計算推開方向
      let pushX = 0;
      let pushY = 0;

      // 選擇較小的重疊軸推開
      if (overlapX < overlapY) {
        pushX = dx > 0 ? -overlapX : overlapX;
      } else {
        pushY = dy > 0 ? -overlapY : overlapY;
      }

      return { overlapping: true, pushX, pushY };
    }

    return { overlapping: false, pushX: 0, pushY: 0 };
  };

  const updateObjectPosition = (selected, newX, newY) => {
    const updatedLevel = { ...levelData };

    if (selected.type === 'parkingSpot') {
      updatedLevel.parkingSpot = { ...updatedLevel.parkingSpot, x: newX, y: newY };
    } else if (selected.type === 'carStart') {
      updatedLevel.carStartPosition = { ...updatedLevel.carStartPosition, x: newX, y: newY };
    } else if (selected.type === 'obstacle') {
      updatedLevel.obstacles = [...updatedLevel.obstacles];
      const obstacle = {
        ...updatedLevel.obstacles[selected.index],
        x: newX,
        y: newY
      };

      // 檢測重疊並修正位置
      const resolved = resolveOverlap(obstacle, updatedLevel);
      obstacle.x = resolved.x;
      obstacle.y = resolved.y;

      updatedLevel.obstacles[selected.index] = obstacle;
    }

    setLevelData(updatedLevel);
  };

  /**
   * 旋轉物體
   */
  const handleRotate = (degrees) => {
    if (!selectedObject) return;

    const radians = degrees * Math.PI / 180;
    const updatedLevel = { ...levelData };

    if (selectedObject.type === 'parkingSpot') {
      updatedLevel.parkingSpot = { ...updatedLevel.parkingSpot, angle: radians };
    } else if (selectedObject.type === 'carStart') {
      updatedLevel.carStartPosition = { ...updatedLevel.carStartPosition, angle: radians };
    } else if (selectedObject.type === 'obstacle') {
      updatedLevel.obstacles = [...updatedLevel.obstacles];
      updatedLevel.obstacles[selectedObject.index] = {
        ...updatedLevel.obstacles[selectedObject.index],
        angle: radians
      };
    }

    setLevelData(updatedLevel);

    // 更新選中物體的引用
    setSelectedObject({
      ...selectedObject,
      object: {
        ...selectedObject.object,
        angle: radians
      }
    });
  };

  /**
   * 調整物體尺寸
   */
  const handleResize = (dimension, value) => {
    if (!selectedObject || selectedObject.type === 'carStart') return;

    const updatedLevel = { ...levelData };

    if (selectedObject.type === 'parkingSpot') {
      updatedLevel.parkingSpot = {
        ...updatedLevel.parkingSpot,
        [dimension]: value
      };
    } else if (selectedObject.type === 'obstacle') {
      updatedLevel.obstacles = [...updatedLevel.obstacles];
      updatedLevel.obstacles[selectedObject.index] = {
        ...updatedLevel.obstacles[selectedObject.index],
        [dimension]: value
      };
    }

    setLevelData(updatedLevel);

    // 更新選中物體的引用
    setSelectedObject({
      ...selectedObject,
      object: {
        ...selectedObject.object,
        [dimension]: value
      }
    });
  };

  /**
   * 刪除障礙物
   */
  const handleDelete = () => {
    if (!selectedObject || selectedObject.type !== 'obstacle') return;

    const updatedLevel = {
      ...levelData,
      obstacles: levelData.obstacles.filter((_, index) => index !== selectedObject.index)
    };

    setLevelData(updatedLevel);
    setSelectedObject(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* 頂部工具列 */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              ← 返回
            </button>

            <h1 className="text-2xl font-bold text-white">🎨 關卡編輯器</h1>

            {/* 關卡選擇器 */}
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(Number(e.target.value))}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map(level => (
                <option key={level} value={level}>關卡 {level}</option>
              ))}
            </select>
          </div>

          <button
            onClick={saveLevel}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            💾 儲存關卡
          </button>
        </div>
      </div>

      {/* 主要編輯區 */}
      <div className="flex-1 flex">
        {/* 左側工具列 */}
        <div className="bg-gray-800 border-r border-gray-700 p-4 w-64">
          <h3 className="text-white font-bold mb-4">🛠️ 工具</h3>

          <div className="space-y-2">
            <button
              onClick={() => setToolMode('select')}
              className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                toolMode === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ⬜ 選擇工具
            </button>

            <div className="border-t border-gray-700 my-4"></div>

            <h4 className="text-gray-400 text-sm font-semibold mb-2">新增障礙物：</h4>

            {OBSTACLE_TYPES.map(obstacleType => (
              <button
                key={obstacleType.id}
                onClick={() => setToolMode(`add-${obstacleType.id}`)}
                className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors text-left ${
                  toolMode === `add-${obstacleType.id}` ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {obstacleType.icon} {obstacleType.name}
              </button>
            ))}
          </div>
        </div>

        {/* 中間畫布 */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="border-4 border-gray-700 rounded-lg shadow-2xl cursor-pointer"
          />
        </div>

        {/* 右側屬性面板 */}
        <div className="bg-gray-800 border-l border-gray-700 p-4 w-64 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">⚙️ 屬性</h3>

          {selectedObject ? (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">類型：</label>
                <p className="text-white font-semibold">
                  {selectedObject.type === 'parkingSpot' && '🅿️ 停車格'}
                  {selectedObject.type === 'carStart' && '🚗 起始位置'}
                  {selectedObject.type === 'obstacle' && `${OBSTACLE_TYPES.find(t => t.id === selectedObject.object.type)?.icon} ${OBSTACLE_TYPES.find(t => t.id === selectedObject.object.type)?.name}`}
                </p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">位置：</label>
                <p className="text-white">X: {Math.round(selectedObject.object.x)}, Y: {Math.round(selectedObject.object.y)}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">旋轉角度：</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={(selectedObject.object.angle || 0) * 180 / Math.PI}
                  onChange={(e) => handleRotate(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-white text-center">{Math.round((selectedObject.object.angle || 0) * 180 / Math.PI)}°</p>
              </div>

              {(selectedObject.type === 'parkingSpot' || selectedObject.type === 'obstacle') && (
                <>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">寬度：</label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={selectedObject.object.width}
                      onChange={(e) => handleResize('width', Number(e.target.value))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">高度：</label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={selectedObject.object.height}
                      onChange={(e) => handleResize('height', Number(e.target.value))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                    />
                  </div>
                </>
              )}

              {selectedObject.type === 'obstacle' && (
                <button
                  onClick={handleDelete}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  🗑️ 刪除障礙物
                </button>
              )}

              <div className="border-t border-gray-700 pt-4">
                <button
                  onClick={() => setSelectedObject(null)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  取消選擇
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">選擇一個物體以編輯屬性</p>
          )}
        </div>
      </div>

      {/* 底部說明 */}
      <div className="bg-gray-800 border-t border-gray-700 p-3 text-center">
        <p className="text-gray-400 text-sm">
          💡 提示：點擊並拖曳物體移動 | 編輯完成後記得儲存！
        </p>
      </div>
    </div>
  );
};

LevelEditor.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default LevelEditor;
