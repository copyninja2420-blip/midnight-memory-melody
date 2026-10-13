import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

function Ruby({ color, light, progress, active }: { color: string; light: string; progress: number; active: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const time = useRef(0);
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -.9); shape.bezierCurveTo(-1.6, .1, -1.1, 1.3, 0, .65); shape.bezierCurveTo(1.1, 1.3, 1.6, .1, 0, -.9);
    const g = new THREE.ExtrudeGeometry(shape, { depth: .28, bevelEnabled: true, bevelSize: .17, bevelThickness: .22, bevelSegments: 2, curveSegments: 5 });
    g.center(); return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    time.current += Math.min(delta, .05);
    if (!mesh.current) return;
    const phase = time.current * (active ? 5 + progress * .04 : 3);
    mesh.current.scale.setScalar(1 + Math.pow(Math.max(0, Math.sin(phase)), 8) * .09);
    mesh.current.rotation.y = .3 + Math.sin(time.current * .55) * .25;
  });
  return <><mesh ref={mesh} geometry={geometry}><meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={.22 + progress * .006} roughness={.14} metalness={.16} clearcoat={1} clearcoatRoughness={.04} flatShading /></mesh><Environment resolution={32}><Lightformer position={[0, 3, 3]} scale={[3, 4, 1]} intensity={4} color={light} /><Lightformer position={[-3, 0, 2]} scale={[1, 3, 1]} intensity={3} color={light} /></Environment></>;
}
export default function CrystalHeart({ progress, active }: { progress: number; active: boolean }) {
  const [colors, setColors] = useState<{ color: string; light: string } | null>(null);
  useEffect(() => { const s = getComputedStyle(document.documentElement); setColors({ color: s.getPropertyValue('--avatar-rose').trim(), light: s.getPropertyValue('--avatar-light').trim() }); }, []);
  if (!colors) return null;
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.5], fov: 40 }} gl={{ alpha: true }}><ambientLight intensity={.8} /><directionalLight position={[2, 3, 4]} intensity={3} color={colors.light} /><Ruby {...colors} progress={progress} active={active} /></Canvas>;
}