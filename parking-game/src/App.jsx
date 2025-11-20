import React, { useState, useEffect } from 'react';
import MainMenu from './components/ui/MainMenu';
import LevelSelect from './components/ui/LevelSelect';
import SteeringWheel from './components/controls/SteeringWheel';
import GearControls from './components/controls/GearControls';
import HUD from './components/ui/HUD';
import GameCanvas from './components/game/GameCanvas';
import SimpleCar from './components/game/SimpleCar';
import Level from './components/game/Level';
import LevelComplete from './components/ui/LevelComplete';
import LevelFailed from './components/ui/LevelFailed';
import PauseMenu from './components/ui/PauseMenu';
import Tutorial from './components/ui/Tutorial';
import { useGame } from './contexts/GameContext';
import { calculateScore } from './utils/scoring/scoreCalculator';
import { getStarRating } from './utils/scoring/starRating';
import './index.css';

function App() {
  // 輸出版本號到控制台
  useEffect(() => {
    console.log('%c🚗 停車挑戰 v3.4.0', 'color: #EF4444; font-size: 16px; font-weight: bold');
    console.log('%c新功能: 修復碰撞檢測 + 碰撞音效 + 即時下一關按鈕 + 關卡重新設計', 'color: #10B981; font-size: 14px');
    console.log('✅ 修復旋轉矩形碰撞檢測（SAT演算法）');
    console.log('✅ 添加碰撞音效和視覺反饋（紅色閃爍）');
    console.log('✅ 停車成功後立即顯示浮動按鈕');
    console.log('✅ 調整所有關卡尺寸適配新車輛大小');
    console.log('✅ 第一關重新設計為直線後退停車');
    console.log('物理模型: Ackermann 轉向');
    console.log('控制方式: 方向鍵 + 滑桿調整速度');
  }, []);

  const [currentScreen, setCurrentScreen] = useState('menu'); // 'menu', 'levelSelect', 'game', 'simple'
  const [currentLevelNumber, setCurrentLevelNumber] = useState(1);
  const [levelData, setLevelData] = useState(null);
  const [steeringInput, setSteeringInput] = useState(0);
  const [gearInput, setGearInput] = useState('P'); // P, D, R
  const [brakeInput, setBrakeInput] = useState(false);

  // Modal states
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showLevelFailed, setShowLevelFailed] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Completion data
  const [completionData, setCompletionData] = useState({
    stars: 0,
    totalScore: 0,
    breakdown: {}
  });

  const [failureData, setFailureData] = useState({
    reason: '',
    stats: {}
  });

  const [gameStats, setGameStats] = useState({
    level: 1,
    time: 0,
    score: 0,
    speed: 0,
    accuracy: 0,
    collisions: 0,
    gear: 'P'
  });

  const { setLevel, completeLevel, gameProgress } = useGame();

  // Load level data dynamically
  const loadLevel = async (levelNumber) => {
    try {
      const levelModule = await import(`./data/levels/level${levelNumber.toString().padStart(2, '0')}.json`);
      const data = levelModule.default;
      setLevelData(data);
      setCurrentLevelNumber(levelNumber);
      setLevel(levelNumber);

      // Show tutorial for level 1
      if (levelNumber === 1) {
        setShowTutorial(true);
      }

      return data;
    } catch (error) {
      console.error(`Failed to load level ${levelNumber}:`, error);
      alert(`Failed to load level ${levelNumber}. Please try again.`);
      setCurrentScreen('levelSelect');
      return null;
    }
  };

  const handleStartGame = () => {
    // 進入關卡選擇
    setCurrentScreen('levelSelect');
  };

  const handleTutorial = () => {
    // 進入教學關（SimpleCar - 第0關）
    setCurrentScreen('simple');
  };

  const handleSelectLevel = async (levelNumber) => {
    const data = await loadLevel(levelNumber);
    if (data) {
      // 使用新的 Level 組件（支援障礙物和完整關卡系統）
      setCurrentScreen('level');
      // Reset game state
      setSteeringInput(0);
      setGearInput('P');
      setBrakeInput(false);
    }
  };

  const handleSteer = (angle) => {
    setSteeringInput(angle);
  };

  const handleGearChange = (gear) => {
    setGearInput(gear);
  };

  const handleBrake = (isBraking) => {
    setBrakeInput(isBraking);
  };

  const handleStatsUpdate = (stats) => {
    setGameStats(prev => ({
      ...prev,
      ...stats
    }));
  };

  const handleLevelComplete = ({ timeTaken, accuracy, collisions }) => {
    // Calculate score
    const scoreResult = calculateScore(
      accuracy,
      timeTaken,
      collisions,
      levelData.par
    );

    const stars = getStarRating(scoreResult.totalScore);

    // Save progress
    completeLevel(levelData.levelNumber, stars, scoreResult.totalScore);

    // Set completion data and show modal
    setCompletionData({
      stars,
      totalScore: scoreResult.totalScore,
      breakdown: {
        accuracy,
        timeTaken,
        collisions
      }
    });

    setShowLevelComplete(true);
  };

  const handleLevelFailed = ({ reason }) => {
    setFailureData({
      reason,
      stats: {
        timeTaken: gameStats.time,
        collisions: gameStats.collisions,
        accuracy: gameStats.accuracy
      }
    });

    setShowLevelFailed(true);
  };

  const handleNextLevel = async () => {
    setShowLevelComplete(false);
    const nextLevel = currentLevelNumber + 1;
    if (nextLevel <= 15) {
      await handleSelectLevel(nextLevel);
    } else {
      // All levels complete!
      alert('Congratulations! You have completed all levels!');
      setCurrentScreen('menu');
    }
  };

  const handleRetry = () => {
    setShowLevelComplete(false);
    setShowLevelFailed(false);
    setShowPauseMenu(false);
    // Reload current level
    loadLevel(currentLevelNumber);
  };

  const handlePause = () => {
    setShowPauseMenu(true);
  };

  const handleResume = () => {
    setShowPauseMenu(false);
  };

  const handleHome = () => {
    setShowLevelComplete(false);
    setShowLevelFailed(false);
    setShowPauseMenu(false);
    setCurrentScreen('menu');
  };

  const handleRestart = () => {
    // Reload level data to restart
    setLevelData({ ...levelData });
  };

  // Keyboard controls for 2D game
  useEffect(() => {
    if (currentScreen !== 'game') return;

    const handleKeyDown = (e) => {
      // Prevent default for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (gearInput === 'P') setGearInput('D');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (gearInput === 'P') setGearInput('R');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setSteeringInput(-1); // Steer left
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setSteeringInput(1); // Steer right
          break;
        case ' ':
          setBrakeInput(true); // Brake
          break;
        case 'p':
        case 'P':
          setGearInput('P'); // Park
          break;
        case 'Escape':
          handlePause();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'a':
        case 'A':
        case 'd':
        case 'D':
          setSteeringInput(0); // Center steering
          break;
        case ' ':
          setBrakeInput(false); // Release brake
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
  }, [currentScreen, gearInput]);

  if (currentScreen === 'menu') {
    return (
      <MainMenu
        onStartGame={handleStartGame}
        onTutorial={handleTutorial}
        onSettings={() => console.log('Settings')}
        onLeaderboard={() => console.log('Leaderboard')}
      />
    );
  }

  if (currentScreen === 'simple') {
    return <SimpleCar />;
  }

  if (currentScreen === 'levelSelect') {
    return (
      <LevelSelect
        onSelectLevel={handleSelectLevel}
        onBack={() => setCurrentScreen('menu')}
        unlockedLevels={gameProgress?.unlockedLevels || 1}
        levelScores={gameProgress?.levelScores || {}}
      />
    );
  }

  if (currentScreen === 'level') {
    return (
      <Level
        levelData={levelData}
        onLevelComplete={handleLevelComplete}
        onLevelFailed={handleLevelFailed}
        onNextLevel={handleNextLevel}
        currentLevelNumber={currentLevelNumber}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* HUD Overlay */}
      <HUD
        level={gameStats.level}
        time={gameStats.time}
        score={gameStats.score}
        speed={gameStats.speed}
        accuracy={gameStats.accuracy}
        onPause={handlePause}
        onRestart={handleRestart}
        onHome={handleHome}
      />

      {/* 2D Game Canvas */}
      {levelData && (
        <GameCanvas
          levelData={levelData}
          onLevelComplete={handleLevelComplete}
          onLevelFailed={handleLevelFailed}
          onStatsUpdate={handleStatsUpdate}
          steeringInput={steeringInput}
          gearInput={gearInput}
          brakeInput={brakeInput}
        />
      )}

      {/* 2D Controls - Bottom Left: Steering, Bottom Right: Gear */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end pointer-events-none">
        <div className="pointer-events-auto">
          <SteeringWheel onSteer={handleSteer} />
        </div>
        <div className="pointer-events-auto">
          <GearControls
            currentGear={gearInput}
            onGearChange={handleGearChange}
            onBrake={handleBrake}
          />
        </div>
      </div>

      {/* Keyboard Controls Help */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg text-xs text-gray-300 text-center">
          🎮 <span className="font-semibold">鍵盤控制：</span>
          <span className="mx-2">W/↑ 前進(D)</span>
          <span className="mx-2">S/↓ 倒車(R)</span>
          <span className="mx-2">A/← D/→ 轉向</span>
          <span className="mx-2">空白鍵 煞車</span>
          <span className="mx-2">P 停車(P)</span>
        </div>
      </div>

      {/* Modals */}
      <LevelComplete
        isOpen={showLevelComplete}
        stars={completionData.stars}
        totalScore={completionData.totalScore}
        breakdown={completionData.breakdown}
        onNextLevel={handleNextLevel}
        onRetry={handleRetry}
        onHome={handleHome}
      />

      <LevelFailed
        isOpen={showLevelFailed}
        reason={failureData.reason}
        stats={failureData.stats}
        onRetry={handleRetry}
        onHome={handleHome}
      />

      <PauseMenu
        isOpen={showPauseMenu}
        stats={gameStats}
        onResume={handleResume}
        onRestart={handleRetry}
        onSettings={() => console.log('Settings')}
        onHome={handleHome}
      />

      <Tutorial
        isOpen={showTutorial}
        steps={levelData?.hints || []}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}

export default App
