import { useEffect, useState } from 'react';

/**
 * 键盘控制Hook（用于3D游戏）
 */
export const useKeyboardControls = () => {
  const [controls, setControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          setControls(c => ({ ...c, forward: true }));
          break;
        case 'arrowdown':
        case 's':
          setControls(c => ({ ...c, backward: true }));
          break;
        case 'arrowleft':
        case 'a':
          setControls(c => ({ ...c, left: true }));
          break;
        case 'arrowright':
        case 'd':
          setControls(c => ({ ...c, right: true }));
          break;
        case ' ':
          setControls(c => ({ ...c, brake: true }));
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          setControls(c => ({ ...c, forward: false }));
          break;
        case 'arrowdown':
        case 's':
          setControls(c => ({ ...c, backward: false }));
          break;
        case 'arrowleft':
        case 'a':
          setControls(c => ({ ...c, left: false }));
          break;
        case 'arrowright':
        case 'd':
          setControls(c => ({ ...c, right: false }));
          break;
        case ' ':
          setControls(c => ({ ...c, brake: false }));
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

  return controls;
};
