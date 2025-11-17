import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import Ground from './3d/Ground';
import Car from './3d/Car';
import ParkingSpot from './3d/ParkingSpot';
import Obstacles from './3d/Obstacles';

/**
 * 3D Parking Game Component
 * 使用 Three.js + Cannon.js 物理引擎
 */
const Game3D = ({
  levelData,
  onLevelComplete,
  onLevelFailed,
  onStatsUpdate,
  steeringInput = 0,
  throttleInput = 0,
  brakeInput = false
}) => {
  const [cameraPosition] = useState([0, 15, 25]);
  const carRef = useRef();

  return (
    <div className="w-full h-screen bg-sky-200">
      <Canvas shadows>
        {/* 摄像机设置 */}
        <PerspectiveCamera makeDefault position={cameraPosition} fov={60} />

        {/* 天空 */}
        <Sky sunPosition={[100, 20, 100]} />

        {/* 光照 */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        {/* 物理世界 */}
        <Physics
          gravity={[0, -20, 0]}
          iterations={10}
          tolerance={0.0001}
          broadphase="SAP"
        >
          <Suspense fallback={null}>
            {/* 地面 */}
            <Ground />

            {/* 停车位 */}
            {levelData?.parkingSpot && (
              <ParkingSpot spot={levelData.parkingSpot} />
            )}

            {/* 障碍物 */}
            {levelData?.obstacles && (
              <Obstacles obstacles={levelData.obstacles} />
            )}

            {/* 车辆 */}
            <Car
              ref={carRef}
              position={[
                (levelData?.carStartPosition?.x || 200) / 10,
                0.5,
                (levelData?.carStartPosition?.y || 300) / 10
              ]}
              rotation={[0, -(levelData?.carStartPosition?.angle || 0) * Math.PI / 180, 0]}
              steeringInput={steeringInput}
              throttleInput={throttleInput}
              brakeInput={brakeInput}
              onStatsUpdate={onStatsUpdate}
            />
          </Suspense>
        </Physics>

        {/* 调试用轨道控制（后续可以改成跟随摄像机） */}
        <OrbitControls
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 2}
          minDistance={10}
          maxDistance={50}
        />
      </Canvas>
    </div>
  );
};

export default Game3D;
