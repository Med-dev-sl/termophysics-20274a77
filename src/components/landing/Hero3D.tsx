import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Box, Torus, Icosahedron } from "@react-three/drei";
import { motion } from "framer-motion";

function RotatingGeometry() {
  return (
    <group>
      <motion.group
        animate={{
          rotateX: [0, Math.PI * 2],
          rotateY: [0, Math.PI * 2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#1e40af"
            emissiveIntensity={0.5}
            metalness={0.4}
            roughness={0.1}
          />
        </Sphere>
      </motion.group>

      <motion.group
        animate={{
          rotateY: [0, -Math.PI * 2],
          rotateZ: [0, Math.PI],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <Torus args={[2, 0.3, 32, 128]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#b45309"
            emissiveIntensity={0.3}
            metalness={0.5}
            roughness={0.2}
          />
        </Torus>
      </motion.group>

      <motion.group
        animate={{
          rotateX: [0, Math.PI * 2],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <Icosahedron args={[0.8, 4]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#ec4899"
            emissive="#be123c"
            emissiveIntensity={0.4}
            metalness={0.3}
            roughness={0.15}
          />
        </Icosahedron>
      </motion.group>
    </group>
  );
}

export function Hero3D() {
  return (
    <div className="w-full h-[300px] bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, 5]} intensity={0.5} color="#8b5cf6" />
        
        <RotatingGeometry />
        
        <OrbitControls
          autoRotate
          autoRotateSpeed={2}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
