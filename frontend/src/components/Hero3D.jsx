import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

/**
 * Hero3D — a field of "raw data" points that slowly organizes into tidy
 * rows as it settles, then keeps a gentle drift. One deliberate motion
 * moment on page load, per the design brief; nothing else on this page
 * animates on its own.
 */
function DataField({ count = 900 }) {
  const pointsRef = useRef();

  const { positions, targets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const cols = 30;
    for (let i = 0; i < count; i++) {
      // scattered starting position ("raw data")
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      // tidy grid target ("clean data")
      const col = i % cols;
      const row = Math.floor(i / cols);
      targets[i * 3] = (col - cols / 2) * 0.42;
      targets[i * 3 + 1] = (row - count / cols / 2) * 0.34;
      targets[i * 3 + 2] = 0;
    }
    return { positions, targets };
  }, [count]);

  const start = useRef(performance.now());

  useFrame(() => {
    if (!pointsRef.current) return;
    const elapsed = (performance.now() - start.current) / 1000;
    const t = Math.min(elapsed / 3.2, 1); // 3.2s settle-in
    const eased = 1 - Math.pow(1 - t, 3);
    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = positions[i] + (targets[i] - positions[i]) * eased;
      arr[i + 1] = positions[i + 1] + (targets[i + 1] - positions[i + 1]) * eased;
      arr[i + 2] = positions[i + 2] + (targets[i + 2] - positions[i + 2]) * eased * 0 +
                   Math.sin(elapsed * 0.6 + i) * 0.05 * eased;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = elapsed * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#3FC1C9" transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 9], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <DataField />
      </Canvas>
    </div>
  );
}
