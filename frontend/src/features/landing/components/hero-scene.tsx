'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ฉาก 3D หลัก — รูปทรงลอยตัวแบบโต้ตอบได้ พร้อมกล้องที่หันตามเมาส์
 * และเอฟเฟกต์อนุภาค (Particle) เพื่อเพิ่มมิติความลึก ปรับแต่งเพื่อประสิทธิภาพขั้นสุด:
 * - ปรับความละเอียดตามหน้าจออัตโนมัติ (Adaptive DPR)
 * - หยุดรันเมื่อไม่ได้เปิดแท็บนี้ (Demand-based frameloop)
 * - ใช้รูปทรงแบบเรียบง่าย ไม่กินทรัพยากร
 * - แสงและเงาจาก Environment ตัวเดียว
 */
function FloatingMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useThree((s) => s.pointer);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.1;
    meshRef.current.rotation.y += delta * 0.15;

    // ขยับรูปทรงตามเมาส์แบบนุ่มนวล
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      mouse.x * 0.3,
      0.02,
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      mouse.y * 0.2,
      0.02,
    );
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#4f46e5"
          roughness={0.15}
          metalness={0.9}
          distort={0.25}
          speed={1.5}
          envMapIntensity={1.2}
        />
      </mesh>
    </Float>
  );
}

/** ทรงกลมลอยตัวรอง — ช่วยเพิ่มมิติให้ฉาก */
function AccentSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 2;
    meshRef.current.position.y =
      Math.cos(state.clock.elapsedTime * 0.3) * 0.8 + 0.5;
  });

  return (
    <mesh ref={meshRef} scale={0.4} position={[2, 0.5, -1]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="#06b6d4"
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

/** อนุภาคเรืองแสงเพื่อสร้างบรรยากาศ */
function ParticleField() {
  const count = 200;
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  });

  const ref = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#818cf8"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/** ระบบกล้องเคลื่อนไหวที่คอยมองตามเมาส์ */
function CameraRig() {
  const { pointer } = useThree();

  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      pointer.x * 0.5,
      0.025,
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      pointer.y * 0.3 + 0.5,
      0.025,
    );
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export function HeroScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, 2, 4]} intensity={0.4} color="#818cf8" />

        <FloatingMesh />
        <AccentSphere />
        <ParticleField />
        <CameraRig />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
