"use client";

import { useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";

/**
 * Procedural low-poly smart bin — a faceted hexagonal body with a glowing
 * recycle ring, deposit slot, pulsing status LED and cyan base accent.
 * No external model files (keeps the bundle lean and the CSP unchanged).
 *
 * `lite` (mobile / low-end): drops polygon counts on the round geometry so the
 * GPU has far fewer triangles to push, keeping touch devices at 60fps. Visual
 * silhouette stays identical. Pointer handlers double as touch handlers:
 * press-and-hold boosts the spin (mirrors desktop hover) and dragging across
 * the bin rotates it with a little momentum — works for mouse and finger alike.
 */
export function SmartBinModel({ lite = false }: { lite?: boolean }) {
  const group = useRef<Group>(null);
  const led = useRef<Mesh>(null);
  const [active, setActive] = useState(false);
  // Manual drag state (refs so dragging never triggers a React re-render).
  const dragging = useRef(false);
  const lastX = useRef(0);
  const spin = useRef(0); // momentum carried after a flick

  // Lower-poly segment counts for round geometry on mobile.
  const radial = lite ? 6 : 8;
  const ringSeg = lite ? 8 : 16;
  const ledSeg = lite ? 8 : 16;

  useFrame((state, delta) => {
    if (group.current) {
      if (!dragging.current) {
        group.current.rotation.y += delta * (active ? 0.55 : 0.22) + spin.current;
        spin.current *= 0.9; // decay flick momentum
      }
    }
    if (led.current) {
      const mat = led.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 1.6 + Math.sin(state.clock.elapsedTime * 3) * 1.1;
    }
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setActive(true);
    dragging.current = true;
    lastX.current = e.clientX;
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current || !group.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    group.current.rotation.y += dx * 0.01;
    spin.current = dx * 0.004;
  };
  const release = () => {
    dragging.current = false;
    setActive(false);
  };

  return (
    <Float speed={1.6} rotationIntensity={0.18} floatIntensity={0.55}>
      <group
        ref={group}
        scale={active ? 1.05 : 1}
        onPointerOver={() => setActive(true)}
        onPointerOut={release}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={release}
        dispose={null}
      >
        {/* base platform */}
        <mesh position={[0, -1.4, 0]}>
          <cylinderGeometry args={[1.15, 1.28, 0.18, radial]} />
          <meshStandardMaterial color="#0e1626" metalness={0.6} roughness={0.45} />
        </mesh>

        {/* faceted body */}
        <mesh>
          <cylinderGeometry args={[0.95, 1.02, 2.4, radial]} />
          <meshStandardMaterial color="#172742" metalness={0.72} roughness={0.28} />
        </mesh>

        {/* glowing recycle ring */}
        <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.04, 0.05, ringSeg, radial]} />
          <meshStandardMaterial
            color="#34d399"
            emissive="#34d399"
            emissiveIntensity={active ? 2.4 : 1.4}
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
          <cylinderGeometry args={[1.02, 0.95, 0.26, radial]} />
          <meshStandardMaterial color="#1d2f4f" metalness={0.7} roughness={0.24} />
        </mesh>

        {/* pulsing status LED */}
        <mesh ref={led} position={[0, 1.02, 0.92]}>
          <sphereGeometry args={[0.07, ledSeg, ledSeg]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>

        {/* cyan base accent */}
        <mesh position={[0, -0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.99, 0.025, lite ? 8 : 12, radial]} />
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
