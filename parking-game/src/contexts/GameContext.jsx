import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { STORAGE_KEYS } from '../data/constants';

/**
 * Game Context for global game state management
 *
 * State includes:
 * - Current level
 * - Level progress (unlocked, stars, scores)
 * - Game settings
 */

const GameContext = createContext(null);

// Initial state
const initialState = {
  currentLevel: 1,
  levelProgress: Array.from({ length: 15 }, (_, i) => ({
    levelNumber: i + 1,
    unlocked: i === 0, // Only level 1 unlocked initially
    stars: 0,
    bestScore: 0,
    attempts: 0,
    completed: false
  })),
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    showTutorial: true
  },
  totalScore: 0,
  lastPlayedLevel: 1
};

// Action types
const Actions = {
  SET_LEVEL: 'SET_LEVEL',
  COMPLETE_LEVEL: 'COMPLETE_LEVEL',
  UNLOCK_LEVEL: 'UNLOCK_LEVEL',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  LOAD_PROGRESS: 'LOAD_PROGRESS',
  RESET_PROGRESS: 'RESET_PROGRESS'
};

// Reducer function
const gameReducer = (state, action) => {
  switch (action.type) {
    case Actions.SET_LEVEL:
      return {
        ...state,
        currentLevel: action.payload,
        lastPlayedLevel: action.payload
      };

    case Actions.COMPLETE_LEVEL: {
      const { levelNumber, stars, score } = action.payload;
      const newLevelProgress = [...state.levelProgress];

      // Update current level progress
      const levelIndex = levelNumber - 1;
      const currentProgress = newLevelProgress[levelIndex];

      newLevelProgress[levelIndex] = {
        ...currentProgress,
        completed: true,
        stars: Math.max(currentProgress.stars, stars),
        bestScore: Math.max(currentProgress.bestScore, score),
        attempts: currentProgress.attempts + 1
      };

      // Unlock next level if exists
      if (levelNumber < 15) {
        newLevelProgress[levelNumber].unlocked = true;
      }

      // Calculate total score
      const totalScore = newLevelProgress.reduce(
        (sum, level) => sum + level.bestScore,
        0
      );

      return {
        ...state,
        levelProgress: newLevelProgress,
        totalScore
      };
    }

    case Actions.UNLOCK_LEVEL: {
      const { levelNumber } = action.payload;
      const newLevelProgress = [...state.levelProgress];

      if (levelNumber > 0 && levelNumber <= 15) {
        newLevelProgress[levelNumber - 1].unlocked = true;
      }

      return {
        ...state,
        levelProgress: newLevelProgress
      };
    }

    case Actions.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case Actions.LOAD_PROGRESS:
      return {
        ...state,
        ...action.payload
      };

    case Actions.RESET_PROGRESS:
      return initialState;

    default:
      return state;
  }
};

/**
 * Load progress from localStorage
 */
const loadProgress = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
  return null;
};

/**
 * Save progress to localStorage
 */
const saveProgress = (state) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(state));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded');
    } else {
      console.error('Failed to save progress:', e);
    }
  }
};

/**
 * Game Context Provider
 */
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load progress on mount
  useEffect(() => {
    const savedProgress = loadProgress();
    if (savedProgress) {
      dispatch({ type: Actions.LOAD_PROGRESS, payload: savedProgress });
    }
  }, []);

  // Save progress whenever state changes
  useEffect(() => {
    saveProgress(state);
  }, [state]);

  // Actions
  const actions = {
    setLevel: (levelNumber) => {
      dispatch({ type: Actions.SET_LEVEL, payload: levelNumber });
    },

    completeLevel: (levelNumber, stars, score) => {
      dispatch({
        type: Actions.COMPLETE_LEVEL,
        payload: { levelNumber, stars, score }
      });
    },

    unlockLevel: (levelNumber) => {
      dispatch({ type: Actions.UNLOCK_LEVEL, payload: { levelNumber } });
    },

    updateSettings: (settings) => {
      dispatch({ type: Actions.UPDATE_SETTINGS, payload: settings });
    },

    resetProgress: () => {
      if (window.confirm('Are you sure you want to reset all progress?')) {
        dispatch({ type: Actions.RESET_PROGRESS });
      }
    },

    getLevelProgress: (levelNumber) => {
      return state.levelProgress[levelNumber - 1] || null;
    },

    getUnlockedLevels: () => {
      return state.levelProgress.filter(level => level.unlocked);
    },

    getTotalStars: () => {
      return state.levelProgress.reduce((sum, level) => sum + level.stars, 0);
    }
  };

  const value = {
    state,
    ...actions
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

/**
 * Custom hook to use Game Context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
