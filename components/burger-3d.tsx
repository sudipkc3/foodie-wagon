"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"

function BurgerLayers() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      {/* Bottom Bun */}
      <mesh position={[0, -1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.4, 32]} />
        <meshStandardMaterial color="#D4A373" roughness={0.8} />
      </mesh>

      {/* Beef Patty */}
      <mesh position={[0, -1, 0]} castShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.3, 32]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>

      {/* Cheese */}
      <mesh position={[0, -0.65, 0]} castShadow>
        <cylinderGeometry args={[1.15, 1.05, 0.1, 32]} />
        <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Tomato */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.15, 32]} />
        <meshStandardMaterial color="#FF6347" roughness={0.6} />
      </mesh>

      {/* Lettuce */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.2, 32]} />
        <meshStandardMaterial color="#90EE90" roughness={0.7} />
      </mesh>

      {/* Top Bun */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#D4A373" roughness={0.8} />
      </mesh>

      {/* Sesame Seeds */}
      {Array.from({ length: 15 }).map((_, i) => {
        const angle = (i / 15) * Math.PI * 2
        const radius = 0.6 + Math.random() * 0.3
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, 0.5 + Math.random() * 0.1, Math.sin(angle) * radius]}
            castShadow
          >
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#F5E6D3" />
          </mesh>
        )
      })}
    </group>
  )
}

export function Burger3D() {
  return (
    <div className="w-full h-[400px] md:h-[500px]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={1}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-5, 3, -5]} intensity={0.5} />
        <spotLight position={[0, 5, 0]} intensity={0.3} angle={0.6} penumbra={1} castShadow />

        <BurgerLayers />

        {/* Ground plane for shadow */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.3} />
        </mesh>
      </Canvas>
    </div>
  )
}
