import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

function Ruby({ color, light, progress, active }: { color: string; light: string; progress: number; active: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.PointLight>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const time = useRef(0);
  const geometry = useMemo(() => {
    // Smooth, organic heart silhouette with deep rounded bevels.
    const s = new THREE.Shape();
    s.moveTo(0, -1);
    s.bezierCurveTo(-.35, -.62, -1.35, -.2, -1.2, .45);
    s.bezierCurveTo(-1.08, 1.02, -.32, 1.12, 0, .62);
    s.bezierCurveTo(.32, 1.12, 1.08, 1.02, 1.2, .45);
    s.bezierCurveTo(1.35, -.2, .35, -.62, 0, -1);
    const g = new THREE.ExtrudeGeometry(s, { depth: .22, bevelEnabled: true, bevelSize: .32, bevelThickness: .38, bevelSegments: 10, curveSegments: 36 });
    g.center(); g.computeVertexNormals(); return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    time.current += Math.min(delta, .05);
    if (!mesh.current) return;
    const phase = time.current * (active ? 5 + progress * .05 : 3);
    const beat = Math.pow(Math.max(0, Math.sin(phase)), 8);
    mesh.current.scale.setScalar(1 + beat * .08);
    mesh.current.rotation.y = Math.sin(time.current * .55) * .35;
    if (core.current) core.current.intensity = 2 + beat * 6 + progress * .04;
    if (mat.current) mat.current.emissiveIntensity = .18 + beat * .35 + progress * .004;
  });
  return <>
    <mesh ref={mesh} geometry={geometry}>
      <meshPhysicalMaterial ref={mat} color={color} emissive={color} roughness={.06} metalness={0} clearcoat={1} clearcoatRoughness={.02} ior={1.76} sheen={.4} sheenColor={light} transparent opacity={.92} />
    </mesh>
    <pointLight ref={core} position={[0, 0, .2]} color={color} distance={4} />
    <Environment resolution={64}><Lightformer position={[0, 3, 3]} scale={[3, 4, 1]} intensity={4} color={light} /><Lightformer position={[-3, 0, 2]} scale={[1, 3, 1]} intensity={3} color={light} /><Lightformer position={[3, -1, 2]} scale={[1, 2, 1]} intensity={2} /></Environment>
  </>;
}
export default function CrystalHeart({ progress, active }: { progress: number; active: boolean }) {
  const [colors, setColors] = useState<{ color: string; light: string } | null>(null);
  useEffect(() => { const s = getComputedStyle(document.documentElement); setColors({ color: s.getPropertyValue('--avatar-rose').trim(), light: s.getPropertyValue('--avatar-light').trim() }); }, []);
  if (!colors) return null;
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.6], fov: 40 }} gl={{ alpha: true, powerPreference: 'high-performance' }}><ambientLight intensity={.6} /><directionalLight position={[2, 3, 4]} intensity={3} color={colors.light} /><Ruby {...colors} progress={progress} active={active} /></Canvas>;
}
