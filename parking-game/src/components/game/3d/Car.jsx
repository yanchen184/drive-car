import React, { useRef, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, useRaycastVehicle } from '@react-three/cannon';
import { useKeyboardControls } from '../../../hooks/useKeyboardControls3D';

/**
 * 3D车辆组件 - 使用Cannon.js真实物理
 */
const Car = forwardRef(({
  position = [0, 0.5, 0],
  rotation = [0, 0, 0],
  steeringInput = 0,
  throttleInput = 0,
  brakeInput = false,
  onStatsUpdate
}, ref) => {
  // 车辆物理参数
  const chassisSize = [1.8, 0.6, 4]; // 车身尺寸
  const wheelRadius = 0.4;
  const wheelWidth = 0.3;
  const suspensionStiffness = 30;
  const suspensionRestLength = 0.3;
  const maxSuspensionTravel = 0.3;
  const suspensionCompression = 4.4;
  const suspensionDamping = 2.3;
  const maxSteerVal = 0.5; // 最大转向角度
  const maxForce = 1500; // 最大驱动力
  const brakeForce = 100; // 刹车力

  // 创建车身物理体
  const [chassisBody, chassisApi] = useBox(() => ({
    mass: 500,
    position,
    rotation,
    args: chassisSize,
    angularDamping: 0.5,
    linearDamping: 0.5
  }), useRef());

  // 创建轮子物理体（4个轮子）
  const wheelInfo = {
    radius: wheelRadius,
    directionLocal: [0, -1, 0],
    suspensionStiffness,
    suspensionRestLength,
    maxSuspensionForce: 100000,
    maxSuspensionTravel,
    dampingRelaxation: suspensionDamping,
    dampingCompression: suspensionCompression,
    frictionSlip: 5,
    rollInfluence: 0.01,
    axleLocal: [-1, 0, 0],
    chassisConnectionPointLocal: [1, 0, 1],
    isFrontWheel: false,
    useCustomSlidingRotationalSpeed: true,
    customSlidingRotationalSpeed: -30
  };

  const wheelInfos = [
    // 前左轮
    {
      ...wheelInfo,
      isFrontWheel: true,
      chassisConnectionPointLocal: [-0.8, 0, 1.3]
    },
    // 前右轮
    {
      ...wheelInfo,
      isFrontWheel: true,
      chassisConnectionPointLocal: [0.8, 0, 1.3]
    },
    // 后左轮
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [-0.8, 0, -1.3]
    },
    // 后右轮
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [0.8, 0, -1.3]
    }
  ];

  const wheels = wheelInfos.map(() => useRef());

  // 创建车辆（底盘+轮子）
  const [vehicle, vehicleApi] = useRaycastVehicle(() => ({
    chassisBody,
    wheels: wheels.map(() => ({
      ref: useRef(),
      radius: wheelRadius,
      directionLocal: wheelInfo.directionLocal,
      suspensionStiffness,
      suspensionRestLength: wheelInfo.suspensionRestLength,
      frictionSlip: wheelInfo.frictionSlip,
      dampingRelaxation: wheelInfo.dampingRelaxation,
      dampingCompression: wheelInfo.dampingCompression,
      maxSuspensionForce: wheelInfo.maxSuspensionForce,
      rollInfluence: wheelInfo.rollInfluence,
      axleLocal: wheelInfo.axleLocal,
      chassisConnectionPointLocal: [0, 0, 0],
      isFrontWheel: false
    })),
    wheelInfos
  }), useRef());

  // 键盘控制（作为备用）
  const controls = useKeyboardControls();

  // 控制车辆
  useFrame(() => {
    if (!vehicleApi) return;

    // 合并输入（触控优先，键盘作为备用）
    const steering = steeringInput !== 0 ? steeringInput * maxSteerVal : controls.left ? -maxSteerVal : controls.right ? maxSteerVal : 0;
    const throttle = throttleInput !== 0 ? throttleInput : controls.forward ? 1 : controls.backward ? -1 : 0;
    const brake = brakeInput || controls.brake;

    // 前轮转向
    vehicleApi.setSteeringValue(steering, 0);
    vehicleApi.setSteeringValue(steering, 1);

    // 后轮驱动
    const force = throttle * maxForce;
    vehicleApi.applyEngineForce(force, 2);
    vehicleApi.applyEngineForce(force, 3);

    // 刹车（所有轮子）
    const bForce = brake ? brakeForce : 0;
    for (let i = 0; i < 4; i++) {
      vehicleApi.setBrake(bForce, i);
    }

    // 更新统计数据
    if (onStatsUpdate) {
      chassisApi.velocity.subscribe((v) => {
        const speed = Math.sqrt(v[0] ** 2 + v[2] ** 2) * 3.6; // 转换为 km/h
        onStatsUpdate({
          speed,
          throttle,
          steering,
          brake: bForce > 0
        });
      });
    }
  });

  return (
    <group ref={ref}>
      {/* 车身 */}
      <mesh ref={chassisBody} castShadow>
        <boxGeometry args={chassisSize} />
        <meshStandardMaterial color="#EF4444" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* 车顶（稍小） */}
      <mesh position={[0, 0.6, -0.3]} castShadow>
        <boxGeometry args={[1.6, 0.7, 2]} />
        <meshStandardMaterial color="#B91C1C" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* 车窗（深色玻璃） */}
      <mesh position={[0, 0.65, 0.2]} castShadow>
        <boxGeometry args={[1.5, 0.6, 1.5]} />
        <meshStandardMaterial
          color="#1F2937"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 轮子 */}
      {wheels.map((wheelRef, index) => (
        <mesh key={index} ref={wheelRef}>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.8} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
});

Car.displayName = 'Car';

export default Car;
