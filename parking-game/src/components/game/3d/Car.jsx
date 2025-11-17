import React, { useRef, forwardRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, useCylinder } from '@react-three/cannon';
import { useKeyboardControls } from '../../../hooks/useKeyboardControls3D';
import * as THREE from 'three';

/**
 * 3D车辆组件 - 使用简化的Box物理 + 手动控制
 * 更稳定可靠，适合停车游戏
 */
const Car = forwardRef(({
  position = [0, 0.5, 0],
  rotation = [0, 0, 0],
  steeringInput = 0,
  throttleInput = 0,
  brakeInput = false,
  onStatsUpdate
}, ref) => {
  // 存储当前车辆状态
  const currentStatsRef = useRef({ throttle: 0, steering: 0, brake: false });

  // 车辆物理参数
  const chassisSize = [1.8, 0.6, 4]; // 车身尺寸 (宽, 高, 长)
  const wheelRadius = 0.4;
  const wheelWidth = 0.3;

  // 驱动参数
  const maxSpeed = 15; // 最大速度 m/s
  const acceleration = 8; // 加速度
  const reverseAcceleration = 5; // 倒车加速度
  const brakingForce = 12; // 刹车力
  const friction = 2; // 摩擦力
  const steeringSpeed = 0.03; // 转向速度

  // 创建车身物理体
  const [chassisBody, chassisApi] = useBox(() => ({
    mass: 500,
    position,
    args: chassisSize,
    material: {
      friction: 0.1,
      restitution: 0.1
    }
  }));

  // 创建轮子（纯视觉，不参与物理）
  const wheel1Ref = useRef();
  const wheel2Ref = useRef();
  const wheel3Ref = useRef();
  const wheel4Ref = useRef();

  // 存储车身的位置、旋转和速度
  const velocityRef = useRef([0, 0, 0]);
  const positionRef = useRef(position);
  const rotationRef = useRef([0, rotation[1], 0]);
  const currentSteeringRef = useRef(0);

  // 键盘控制（作为备用）
  const controls = useKeyboardControls();

  // 订阅物理状态
  useEffect(() => {
    const unsubscribeVelocity = chassisApi.velocity.subscribe(v => {
      velocityRef.current = v;
    });

    const unsubscribePosition = chassisApi.position.subscribe(p => {
      positionRef.current = p;
    });

    const unsubscribeRotation = chassisApi.rotation.subscribe(r => {
      rotationRef.current = r;
    });

    return () => {
      unsubscribeVelocity();
      unsubscribePosition();
      unsubscribeRotation();
    };
  }, [chassisApi]);

  // 更新统计数据
  useEffect(() => {
    if (!onStatsUpdate) return;

    const interval = setInterval(() => {
      const v = velocityRef.current;
      const speed = Math.sqrt(v[0] ** 2 + v[2] ** 2) * 3.6; // 转换为 km/h
      const stats = currentStatsRef.current;

      onStatsUpdate({
        speed,
        throttle: stats.throttle,
        steering: stats.steering,
        brake: stats.brake
      });
    }, 100); // 每 100ms 更新一次

    return () => clearInterval(interval);
  }, [onStatsUpdate]);

  // 控制车辆
  useFrame(() => {
    // 合并输入（触控优先，键盘作为备用）
    const steeringInputValue = steeringInput !== 0 ? steeringInput : controls.left ? -1 : controls.right ? 1 : 0;
    const throttle = throttleInput !== 0 ? throttleInput : controls.forward ? 1 : controls.backward ? -1 : 0;
    const brake = brakeInput || controls.brake;

    // 更新当前状态引用
    currentStatsRef.current = {
      throttle,
      steering: steeringInputValue,
      brake
    };

    // 调试输出
    if (throttle !== 0 || brake) {
      console.log('🚗 车辆控制:', { throttle, brake, steeringInputValue });
    }

    // 获取当前速度和旋转
    const velocity = velocityRef.current;
    const currentRotation = rotationRef.current;
    const currentSpeed = Math.sqrt(velocity[0] ** 2 + velocity[2] ** 2);

    // 平滑转向
    const targetSteering = steeringInputValue;
    currentSteeringRef.current += (targetSteering - currentSteeringRef.current) * steeringSpeed;

    // 计算新的旋转角度（只在移动时转向）
    if (Math.abs(throttle) > 0.01 && Math.abs(currentSteeringRef.current) > 0.01) {
      const rotationDelta = currentSteeringRef.current * 0.02 * (throttle > 0 ? 1 : -1);
      chassisApi.rotation.set(
        currentRotation[0],
        currentRotation[1] + rotationDelta,
        currentRotation[2]
      );
    }

    // 计算运动方向（基于车身朝向）
    const yaw = currentRotation[1];
    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);

    // 应用油门/倒车力
    if (Math.abs(throttle) > 0.01 && !brake) {
      const accel = throttle > 0 ? acceleration : reverseAcceleration;
      const targetSpeed = throttle * maxSpeed;

      // 如果未达到最大速度，施加加速力
      if (currentSpeed < Math.abs(targetSpeed)) {
        const forceX = forwardX * accel * throttle;
        const forceZ = forwardZ * accel * throttle;
        chassisApi.applyForce([forceX, 0, forceZ], [0, 0, 0]);
      }
    }

    // 应用刹车
    if (brake) {
      const brakeForceX = -velocity[0] * brakingForce;
      const brakeForceZ = -velocity[2] * brakingForce;
      chassisApi.applyForce([brakeForceX, 0, brakeForceZ], [0, 0, 0]);
    } else if (Math.abs(throttle) < 0.01) {
      // 自然减速（摩擦力）
      const frictionForceX = -velocity[0] * friction;
      const frictionForceZ = -velocity[2] * friction;
      chassisApi.applyForce([frictionForceX, 0, frictionForceZ], [0, 0, 0]);
    }

    // 更新轮子视觉旋转
    if (wheel1Ref.current && wheel2Ref.current && wheel3Ref.current && wheel4Ref.current) {
      const wheelRotation = currentSpeed * 0.1;

      // 前轮转向
      wheel1Ref.current.rotation.y = currentSteeringRef.current * 0.5;
      wheel2Ref.current.rotation.y = currentSteeringRef.current * 0.5;

      // 所有轮子滚动
      [wheel1Ref.current, wheel2Ref.current, wheel3Ref.current, wheel4Ref.current].forEach(wheel => {
        wheel.rotation.x += wheelRotation * (throttle > 0 ? 1 : -1);
      });
    }
  });

  return (
    <group ref={ref}>
      {/* 车身 */}
      <mesh ref={chassisBody} castShadow receiveShadow>
        <boxGeometry args={chassisSize} />
        <meshStandardMaterial color="#EF4444" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* 车顶（稍小） */}
      <mesh ref={chassisBody} position={[0, 0.6, -0.3]} castShadow>
        <boxGeometry args={[1.6, 0.7, 2]} />
        <meshStandardMaterial color="#B91C1C" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* 车窗（深色玻璃） */}
      <mesh ref={chassisBody} position={[0, 0.65, 0.2]} castShadow>
        <boxGeometry args={[1.5, 0.6, 1.5]} />
        <meshStandardMaterial
          color="#1F2937"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 轮子 - 前左 */}
      <group ref={chassisBody} position={[-0.9, -0.2, 1.3]}>
        <mesh ref={wheel1Ref} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.8} metalness={0.2} />
        </mesh>
      </group>

      {/* 轮子 - 前右 */}
      <group ref={chassisBody} position={[0.9, -0.2, 1.3]}>
        <mesh ref={wheel2Ref} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.8} metalness={0.2} />
        </mesh>
      </group>

      {/* 轮子 - 后左 */}
      <group ref={chassisBody} position={[-0.9, -0.2, -1.3]}>
        <mesh ref={wheel3Ref} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.8} metalness={0.2} />
        </mesh>
      </group>

      {/* 轮子 - 后右 */}
      <group ref={chassisBody} position={[0.9, -0.2, -1.3]}>
        <mesh ref={wheel4Ref} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.8} metalness={0.2} />
        </mesh>
      </group>
    </group>
  );
});

Car.displayName = 'Car';

export default Car;
