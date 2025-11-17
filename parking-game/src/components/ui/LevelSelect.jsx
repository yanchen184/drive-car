import React, { useEffect, useRef } from 'react';
import { Lock, Star, ChevronLeft, Trophy } from 'lucide-react';
import gsap from 'gsap';

const LevelSelect = ({ onSelectLevel, onBack, unlockedLevels = 5, levelScores = {} }) => {
  const levelsRef = useRef([]);
  const containerRef = useRef(null);

  const levels = Array.from({ length: 15 }, (_, i) => ({
    number: i + 1,
    name: `Level ${i + 1}`,
    difficulty: i < 3 ? 'Easy' : i < 7 ? 'Medium' : i < 11 ? 'Hard' : 'Expert',
    description: getLevelDescription(i + 1),
    unlocked: i < unlockedLevels,
    stars: levelScores[i + 1] || 0,
  }));

  function getLevelDescription(level) {
    const descriptions = {
      1: 'Empty Lot - Forward Parking',
      2: 'Simple Parallel Parking',
      3: 'Angled Parking',
      4: 'Tight Forward Parking',
      5: 'Reverse Bay Parking',
      6: 'Parallel Parking Challenge',
      7: 'Shopping Mall Parking',
      8: 'Time Trial Parking',
      9: 'Multi-Point Turn',
      10: 'Advanced Parallel',
      11: 'Precision Parallel',
      12: 'Garage Parking',
      13: 'Valet Challenge',
      14: 'Tight Squeeze',
      15: 'Master Challenge',
    };
    return descriptions[level];
  }

  useEffect(() => {
    // Container fade in
    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );

    // Level cards animation
    gsap.fromTo(levelsRef.current,
      { scale: 0, opacity: 0, rotation: -10 },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.4,
        stagger: {
          amount: 0.5,
          from: 'start',
          grid: [5, 3],
        },
        ease: 'back.out(1.2)',
        delay: 0.2
      }
    );
  }, []);

  const handleLevelClick = (level) => {
    if (!level.unlocked) return;

    const index = level.number - 1;
    gsap.to(levelsRef.current[index], {
      scale: 1.2,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 0.9,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => onSelectLevel(level.number)
        });
      }
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 border-green-400/30';
      case 'Medium': return 'text-yellow-400 border-yellow-400/30';
      case 'Hard': return 'text-orange-400 border-orange-400/30';
      case 'Expert': return 'text-red-400 border-red-400/30';
      default: return 'text-gray-400 border-gray-400/30';
    }
  };

  const getProgressPercentage = () => {
    return Math.round((unlockedLevels / 15) * 100);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-semibold">Back</span>
          </button>

          <h1 className="text-3xl font-display font-bold gradient-text">Select Level</h1>

          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300 font-mono">{getProgressPercentage()}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-800 rounded-full h-3 overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Level Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {levels.map((level, index) => (
          <div
            key={level.number}
            ref={(el) => levelsRef.current[index] = el}
            onClick={() => handleLevelClick(level)}
            className={`
              level-card relative p-4 rounded-xl border-2 transition-all duration-300
              ${level.unlocked
                ? 'bg-surface hover:bg-surface-light border-border hover:border-primary cursor-pointer hover:scale-105 hover:shadow-xl'
                : 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed'
              }
            `}
          >
            {/* Level Number */}
            <div className="text-center mb-3">
              <div className="text-3xl font-bold font-mono text-white mb-1">
                {level.unlocked ? (
                  level.number.toString().padStart(2, '0')
                ) : (
                  <Lock className="w-8 h-8 mx-auto text-gray-600" />
                )}
              </div>
              <div className={`text-xs font-semibold ${getDifficultyColor(level.difficulty)}`}>
                {level.difficulty}
              </div>
            </div>

            {/* Stars */}
            {level.unlocked && (
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= level.stars
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-700 text-gray-700'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Description */}
            <div className="text-xs text-gray-400 text-center">
              {level.description}
            </div>

            {/* New indicator for unlocked but unplayed levels */}
            {level.unlocked && level.stars === 0 && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                NEW
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Level Info Panel */}
      <div className="max-w-6xl mx-auto mt-8 p-4 bg-surface rounded-xl border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">{levels.filter(l => l.stars === 3).length}</div>
            <div className="text-xs text-gray-400">Perfect Scores</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{unlockedLevels}/15</div>
            <div className="text-xs text-gray-400">Levels Unlocked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {Object.values(levelScores).reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Stars</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelSelect;