import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";

// Order must match backend/main.py PIPELINE_STAGES. Color follows the
// project's semantic mapping: green=data, blue=processing/embeddings,
// cyan=RAG/retrieval, pink=agent, violet=LLM/insight.
export const STAGE_META = {
  upload:          { label: "CSV Upload",         color: "#34D399" },
  missing_values:  { label: "Missing Values",     color: "#3B82F6" },
  duplicates:      { label: "Duplicates",         color: "#3B82F6" },
  data_types:      { label: "Data Types",         color: "#3B82F6" },
  invalid_values:  { label: "Invalid Values",     color: "#3B82F6" },
  outliers:        { label: "Outliers",           color: "#3B82F6" },
  quality_score:   { label: "Quality Score",      color: "#3B82F6" },
  tokenization:    { label: "Tokenization",       color: "#60A5FA" },
  embeddings:      { label: "Embeddings",         color: "#22D3EE" },
  vector_search:   { label: "Vector Search",      color: "#22D3EE" },
  llm_explanation: { label: "LLM Explanation",    color: "#8B5CF6" },
  done:            { label: "Report Ready",       color: "#D946EF" },
};

const STAGES = Object.keys(STAGE_META);

function layoutPositions(n) {
  // Wider spacing + fewer per row than the first version, specifically to
  // stop node labels from overlapping at this stage count (12 stages
  // packed 4-per-row put adjacent rows' labels on top of each other in
  // screen space once perspective foreshortening kicked in).
  const positions = [];
  const perRow = 3;
  const xStep = 3.2;
  const zStep = 3.0;
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const x = (row % 2 === 0 ? col : perRow - 1 - col) * xStep - xStep;
    const z = -row * zStep + zStep;
    positions.push([x, 0, z]);
  }
  return positions;
}

function Node({ position, label, color, active, done }) {
  const displayColor = done ? color : active ? "#FBBF24" : "#1E2740";
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color={displayColor} emissive={displayColor} emissiveIntensity={done || active ? 1 : 0.15} />
      </mesh>
      <Html distanceFactor={11} position={[0, -0.55, 0]} center>
        <div className="case-tag whitespace-nowrap text-white/90 text-[10px] bg-panel-950/85 border border-white/10 px-1.5 py-0.5 rounded">
          {label}
        </div>
      </Html>
    </group>
  );
}

function Packet({ path, activeIndex }) {
  const ref = useRef();
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current || activeIndex <= 0) return;
    progress.current = Math.min(progress.current + delta * 1.2, activeIndex);
    const idx = Math.min(Math.floor(progress.current), path.length - 2);
    const frac = progress.current - idx;
    const a = path[idx], b = path[idx + 1] || path[idx];
    ref.current.position.set(
      a[0] + (b[0] - a[0]) * frac,
      0.18,
      a[2] + (b[2] - a[2]) * frac
    );
  });

  if (activeIndex <= 0) return null;
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={1.6} />
    </mesh>
  );
}

export default function PipelineViz3D({ stageStatus = {} }) {
  const positions = useMemo(() => layoutPositions(STAGES.length), []);
  const activeIndex = useMemo(() => {
    let idx = -1;
    STAGES.forEach((s, i) => { if (stageStatus[s]) idx = i; });
    return idx;
  }, [stageStatus]);

  return (
    <div className="h-[460px] w-full rounded-xl border border-border bg-panel-950">
      <Canvas camera={{ position: [0, 7.5, 10], fov: 42 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[4, 6, 4]} intensity={0.7} />
        <Line points={positions} color="#1E2740" lineWidth={1.5} />
        {positions.map((pos, i) => (
          <Node
            key={STAGES[i]}
            position={pos}
            label={STAGE_META[STAGES[i]].label}
            color={STAGE_META[STAGES[i]].color}
            active={i === activeIndex}
            done={i < activeIndex || (i === activeIndex && STAGES[i] === "done")}
          />
        ))}
        <Packet path={positions} activeIndex={activeIndex} />
      </Canvas>
    </div>
  );
}

export { STAGES };
