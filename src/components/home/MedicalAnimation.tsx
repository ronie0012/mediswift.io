
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Float } from '@react-three/drei';
import { Group } from 'three';

function MedicalSymbol(props: any) {
  const group = useRef<Group>(null);
  
  // Rotate the symbol gently
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
      group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });
  
  return (
    <group ref={group} {...props}>
      {/* Medical Cross */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 3, 0.8]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.8, 0.8]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
      </Float>
      
      {/* Pill Shape 1 */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh position={[2, 1, 0]} castShadow receiveShadow rotation={[0, 0, Math.PI / 4]}>
          <capsuleGeometry args={[0.3, 1, 10, 20]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </Float>
      
      {/* Pill Shape 2 */}
      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[-2, -1, 0]} castShadow receiveShadow rotation={[0, 0, -Math.PI / 6]}>
          <capsuleGeometry args={[0.3, 1, 10, 20]} />
          <meshStandardMaterial color="#7dd3fc" />
        </mesh>
      </Float>
      
      {/* Circular element - like a stethoscope */}
      <Float speed={1.3} rotationIntensity={0.5} floatIntensity={0.7}>
        <mesh position={[-1.5, 1.5, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.6, 0.2, 16, 32]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </Float>
    </group>
  );
}

export default function MedicalAnimation() {
  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50 to-indigo-50 shadow-inner">
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <MedicalSymbol position={[0, 0, 0]} scale={[0.75, 0.75, 0.75]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={true} autoRotateSpeed={0.5} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
