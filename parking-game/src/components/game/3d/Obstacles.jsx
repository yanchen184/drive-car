import React from 'react';
import { useBox } from '@react-three/cannon';

/**
 * 单个障碍物组件
 */
const Obstacle = ({ obstacle }) => {
  const { x, y, width, height, type } = obstacle;

  const [ref] = useBox(() => ({
    type: 'Static',
    position: [x / 10, 1, y / 10],
    args: [width / 10, 2, height / 10]
  }));

  // 根据类型选择颜色
  const getColor = () => {
    switch (type?.toLowerCase()) {
      case 'wall':
        return '#6B7280';
      case 'cone':
        return '#F59E0B';
      case 'car':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[width / 10, 2, height / 10]} />
      <meshStandardMaterial color={getColor()} roughness={0.7} metalness={0.3} />
    </mesh>
  );
};

/**
 * 障碍物组 - 渲染所有障碍物
 */
const Obstacles = ({ obstacles = [] }) => {
  return (
    <group>
      {obstacles.map((obstacle, index) => (
        <Obstacle key={index} obstacle={obstacle} />
      ))}
    </group>
  );
};

export default Obstacles;
