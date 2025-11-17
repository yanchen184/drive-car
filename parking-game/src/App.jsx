import React, { useState, useEffect } from 'react';
import MainMenu from './components/ui/MainMenu';
import LevelSelect from './components/ui/LevelSelect';
import SteeringWheel from './components/controls/SteeringWheel';
import GearControls from './components/controls/GearControls';
import HUD from './components/ui/HUD';
import GameCanvas from './components/game/GameCanvas';
import LevelComplete from './components/ui/LevelComplete';
import LevelFailed from './components/ui/LevelFailed';
import PauseMenu from './components/ui/PauseMenu';
import Tutorial from './components/ui/Tutorial';
import { useGame } from './contexts/GameContext';
import { calculateScore } from './utils/scoring/scoreCalculator';
import { getStarRating } from './utils/scoring/starRating';
import './index.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('menu'); // 'menu', 'levelSelect', 'game'
  const [currentLevelNumber, setCurrentLevelNumber] = useState(1);
  const [levelData, setLevelData] = useState(null);
  const [steeringInput, setSteeringInput] = useState(0);
  const [gearInput, setGearInput] = useState('P');
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
    setCurrentScreen('levelSelect');
  };

  const handleSelectLevel = async (levelNumber) => {
    const data = await loadLevel(levelNumber);
    if (data) {
      setCurrentScreen('game');
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

  // Keyboard controls
  useEffect(() => {
    if (currentScreen !== 'game') return;

    const handleKeyDown = (e) => {
      // Prevent default for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
          setGearInput('D'); // Forward
          break;
        case 'ArrowDown':
          setGearInput('R'); // Reverse
          break;
        case 'ArrowLeft':
          setSteeringInput(-1); // Steer left
          break;
        case 'ArrowRight':
          setSteeringInput(1); // Steer right
          break;
        case ' ':
          setBrakeInput(true); // Brake
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
        case 'ArrowUp':
        case 'ArrowDown':
          setGearInput('N'); // Neutral
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
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
  }, [currentScreen]);

  if (currentScreen === 'menu') {
    return (
      <MainMenu
        onStartGame={handleStartGame}
        onTutorial={() => console.log('Tutorial')}
        onSettings={() => console.log('Settings')}
        onLeaderboard={() => console.log('Leaderboard')}
      />
    );
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

      {/* Game Canvas Area */}
      <div className="game-canvas absolute inset-0">
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
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-4 pointer-events-none">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end gap-4">
            {/* Steering Wheel */}
            <div className="flex-1 flex justify-center pointer-events-auto">
              <SteeringWheel onSteer={handleSteer} />
            </div>

            {/* Gear Controls */}
            <div className="flex-1 flex justify-center pointer-events-auto">
              <GearControls
                onGearChange={handleGearChange}
                onBrake={handleBrake}
              />
            </div>
          </div>
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
