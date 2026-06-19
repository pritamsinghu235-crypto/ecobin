"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";

/**
 * Procedural low-poly smart bin — a faceted hexagonal body with a glowing
 * recycle ring, deposit slot, pulsing status LED and cyan base accent.
 * No external model files (keeps the bundle lean and the CSP unchanged).
 */
export function SmartBinModel() {
  const group = useRef<Group>(null);
  const led = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * (hovered ? 0.55 : 0.22);
    }
    if (led.current) {
      const mat = led.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 1.6 + Math.sin(state.clock.elapsedTime * 3) * 1.1;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.18} floatIntensity={0.55}>
      <group
        ref={group}
        scale={hovered ? 1.05 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        dispose={null}
      >
        {/* base platform */}
        <mesh position={[0, -1.4, 0]}>
          <cylinderGeometry args={[1.15, 1.28, 0.18, 8]} />
          <meshStandardMaterial color="#0e1626" metalness={0.6} roughness={0.45} />
        </mesh>

        {/* faceted body */}
        <mesh>
          <cylinderGeometry args={[0.95, 1.02, 2.4, 8]} />
          <meshStandardMaterial color="#172742" metalness={0.72} roughness={0.28} />
        </mesh>

        {/* glowing recycle ring */}
        <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.04, 0.05, 16, 8]} />
          <meshStandardMaterial
            color="#34d399"
            emissive="#34d399"
            emissiveIntensity={hovered ? 2.4 : 1.4}
            toneMapped={false}
          />
        </mesh>

        {/* deposit slot */}
        <mesh position={[0, 0.85, 0.97]}>
          <boxGeometry args={[0.72, 0.16, 0.14]} />
          <meshStandardMaterial color="#04070d" metalness={0.2} roughness={0.85} />
        </mesh>

        {/* lid */}
        <mesh position={[0, 1.33, 0]}>
          <cylinderGeometry args={[1.02, 0.95, 0.26, 8]} />
          <meshStandardMaterial color="#1d2f4f" metalness={0.7} roughness={0.24} />
        </mesh>

        {/* pulsing status LED */}
        <mesh ref={led} position={[0, 1.02, 0.92]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>

        {/* cyan base accent */}
        <mesh position={[0, -0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.99, 0.025, 12, 8]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Float>
  );
}
