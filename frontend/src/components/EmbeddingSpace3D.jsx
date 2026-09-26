import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";

/**
 * Plots the knowledge-base chunks (and, when present, a live query vector)
 * as points in 3D, PCA-reduced by the backend. Cyan = retrieval/RAG space,
 * violet pulse = the live query, matching the project's color language.
 */
function Point({ point, highlighted }) {
  const [hovered, setHovered] = useState(false);
  const color = point.type === "query" ? "#8B5CF6" : "#22D3EE";
  const size = point.type === "query" ? 0.13 : highlighted ? 0.11 : 0.06;

  return (
    <group position={[point.x * 4, point.y * 4, point.z * 4]}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || highlighted ? 1.2 : 0.4}
          transparent
          opacity={point.type === "query" ? 1 : 0.9}
        />
      </mesh>
      {(hovered || highlighted) && (
        <Html distanceFactor={8} position={[0, 0.22, 0]}>
          <div className="case-tag max-w-[200px] bg-panel-950/95 border border-teal-400/40 text-white/90 text-[10px] px-2 py-1.5 rounded-lg">
            <div className="text-teal-400 mb-0.5">{point.source}</div>
            <div className="text-ink-500">{point.label}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function EmbeddingSpace3D({ data, highlightedSources = [] }) {
  const points = data?.points || [];

  return (
    <div className="h-[400px] w-full rounded-xl border border-border bg-panel-950">
      <Canvas camera={{ position: [3, 3, 6], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[4, 4, 4]} intensity={0.6} />
        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.6} />
        {points.map((p, i) => (
          <Point key={i} point={p} highlighted={highlightedSources.includes(p.source)} />
        ))}
      </Canvas>
    </div>
  );
}
