import React from 'react';
import * as THREE from 'three';

/**
 * 停车位标记组件
 * 显示黄色停车框线
 */
const ParkingSpot = ({ spot }) => {
  const { x, y, width, height, angle } = spot;

  // 将2D坐标转换为3D坐标（缩放10倍以匹配3D场景）
  const position = [x / 10, 0.02, y / 10];
  const size = [width / 10, height / 10];
  const rotation = [0, -angle * Math.PI / 180, 0];

  return (
    <group position={position} rotation={rotation}>
      {/* 停车位地面标记 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={size} />
        <meshBasicMaterial
          color="#FCD34D"
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* 停车位边框线 */}
      <lineSegments>
        <edgesGeometry
          args={[
            new THREE.BoxGeometry(size[0], 0.1, size[1])
          ]}
        />
        <lineBasicMaterial color="#FCD34D" linewidth={3} />
      </lineSegments>

      {/* 四个角的标记柱 */}
      {[
        [-size[0]/2, 0, -size[1]/2],
        [size[0]/2, 0, -size[1]/2],
        [-size[0]/2, 0, size[1]/2],
        [size[0]/2, 0, size[1]/2],
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
          <meshStandardMaterial color="#FCD34D" emissive="#FCD34D" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

export default ParkingSpot;
