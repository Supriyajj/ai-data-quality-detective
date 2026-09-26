import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function scoreColor(score) {
  // rose (0) -> amber (50) -> emerald (100) - matches this project's
  // critical / warning / healthy status colors everywhere else in the UI.
  if (score < 50) {
    const t = score / 50;
    return lerpColor("#FB7185", "#FBBF24", t);
  }
  const t = (score - 50) / 50;
  return lerpColor("#FBBF24", "#34D399", t);
}

function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 255, ag = (ah >> 8) & 255, ab = ah & 255;
  const br = (bh >> 16) & 255, bg = (bh >> 8) & 255, bb = bh & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

function Orb({ score }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.25;
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.15;
  });

  const color = scoreColor(score);
  const fraction = score / 100;

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.1, 2]} />
        <meshStandardMaterial color={color} wireframe transparent opacity={0.75} />
      </mesh>
      {/* progress ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.03, 16, 100, Math.PI * 2 * fraction]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export default function QualityOrb3D({ score = 0 }) {
  return (
    <div className="relative h-48 w-48 mx-auto">
      <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 3]} intensity={0.8} />
        <Orb score={score} />
      </Canvas>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-display text-4xl font-semibold text-ink-900">{score}</span>
        <span className="case-tag text-ink-500">/ 100</span>
      </div>
    </div>
  );
}
