import React from 'react';
import { usePlane } from '@react-three/cannon';
import { Plane, MeshReflectorMaterial } from '@react-three/drei';

/**
 * 地面组件 - 带物理碰撞
 */
const Ground = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: {
      friction: 0.8,
      restitution: 0.1
    }
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#555555" roughness={0.9} metalness={0.1} />
    </mesh>
  );
};

export default Ground;
