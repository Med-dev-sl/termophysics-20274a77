import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Atom, ArrowRight, Mail, Phone, MapPin, Zap, Brain, BookOpen, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { InquiryForm } from "@/components/InquiryForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Box, Torus } from "@react-three/drei";
import * as THREE from "three";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showInquiry, setShowInquiry] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-inset-top">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-termo-deep-blue to-termo-deep-blue-dark flex items-center justify-center flex-shrink-0">
              <Atom className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
            </div>
            <h1 className="font-display font-bold text-base sm:text-lg md:text-xl text-foreground truncate">
              Termo<span className="termo-gradient-text">Physics</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap justify-end">
            <a href="#about" className="hidden sm:block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition">
              {t("landing.nav.about")}
            </a>
            <a href="#team" className="hidden sm:block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition">
              {t("landing.nav.team")}
            </a>
            <a href="#contact" className="hidden sm:block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition">
              {t("landing.nav.contact")}
            </a>
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="hero" size="sm" onClick={() => navigate("/chat")} className="text-xs sm:text-sm px-2 sm:px-4">
              {t("landing.nav.launchApp")}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern Design */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 rounded-full bg-termo-light-orange/10 blur-3xl"
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-40 right-20 w-32 h-32 rounded-full bg-termo-deep-blue/10 blur-3xl"
            animate={{ x: [0, 30, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 left-1/4 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl"
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Side - 3D Visualization */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative">
                {/* 3D Canvas Container */}
                <motion.div
                  className="rounded-2xl overflow-hidden border-2 border-termo-light-orange/30 shadow-2xl h-52 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent relative"
                  whileHover={{ borderColor: "rgba(245, 158, 11, 0.8)" }}
                  transition={{ duration: 0.3 }}
                >
                  <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <pointLight position={[-10, -10, 5]} intensity={0.5} color="#8b5cf6" />
                    
                    <group>
                      <Sphere args={[1.5, 64, 64]}>
                        <meshStandardMaterial
                          color="#3b82f6"
                          emissive="#1e40af"
                          emissiveIntensity={0.5}
                          metalness={0.4}
                          roughness={0.1}
                        />
                      </Sphere>
                    </group>

                    <group>
                      <Torus args={[2.5, 0.4, 32, 128]} position={[0, 0, 0]}>
                        <meshStandardMaterial
                          color="#f59e0b"
                          emissive="#d97706"
                          emissiveIntensity={0.4}
                          metalness={0.6}
                          roughness={0.2}
                        />
                      </Torus>
                    </group>

                    <OrbitControls autoRotate autoRotateSpeed={3} enableZoom={false} enablePan={false} />
                  </Canvas>
                </motion.div>

                {/* Floating decorative circles */}
                <motion.div
                  className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-termo-light-orange/20 blur-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2 space-y-6"
            >
              {/* Decorative dots */}
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-termo-light-orange"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </motion.div>

              {/* Main Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              >
                {t("landing.hero.title").split(" ").map((word, i) => (
                  <span
                    key={i}
                    className={word.toLowerCase() === "physics" ? "termo-gradient-text" : "text-foreground"}
                  >
                    {word}{" "}
                  </span>
                ))}
              </motion.h2>

              {/* Why 3D & Motion Explanation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="space-y-3 bg-gradient-to-r from-termo-deep-blue/10 to-termo-light-orange/10 rounded-lg p-4 border border-termo-light-orange/20"
              >
                <p className="text-base sm:text-lg font-semibold text-termo-light-orange flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-termo-light-orange" />
                  Why 3D & Motion?
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Interactive 3D visualizations bring abstract physics concepts to life, making complex theories intuitive and engaging. Smooth animations guide your attention and create immersive learning experiences that enhance understanding and retention.
                </p>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="text-xl sm:text-2xl text-termo-light-orange font-semibold"
              >
                {t("landing.hero.description")}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-base sm:text-lg text-muted-foreground leading-relaxed"
              >
                Explore the fundamental principles of physics through interactive 3D visualizations and AI-powered learning. Master complex concepts with ease.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button
                  size="lg"
                  variant="hero"
                  onClick={() => navigate("/arcade")}
                  className="gap-2 text-base sm:text-lg font-bold px-6 sm:px-8 h-12 sm:h-auto"
                >
                  <Gamepad2 className="w-5 h-5" /> Play Physics Arcade
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate("/chat")}
                  className="gap-2 text-base sm:text-lg font-bold px-6 sm:px-8 h-12 sm:h-auto"
                >
                  {t("landing.hero.getStarted")} <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Decorative arrow */}
              <motion.div
                className="absolute -right-10 top-1/2 text-termo-light-orange/20 text-6xl"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ➤
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - 3D Icons */}
      <section className="py-12 sm:py-20 px-3 sm:px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-16 sm:mb-24"
          >
            {t("landing.features.title")}
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
            {/* Feature 1 - Brain */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <motion.div
                animate={{
                  rotateX: [0, Math.PI * 2],
                  rotateY: [0, Math.PI * 2],
                  rotateZ: [0, Math.PI],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <motion.div
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-termo-light-orange/30 to-termo-light-orange/10 flex items-center justify-center shadow-2xl border-2 border-termo-light-orange/40"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(245, 158, 11, 0.3)",
                      "0 0 40px rgba(245, 158, 11, 0.6)",
                      "0 0 20px rgba(245, 158, 11, 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Brain className="w-16 h-16 sm:w-20 sm:h-20 text-termo-light-orange" />
                </motion.div>
              </motion.div>

              <div className="space-y-3">
                <h4 className="text-xl sm:text-2xl font-bold">{t("landing.features.aiTitle")}</h4>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
                  {t("landing.features.aiDesc")}
                </p>
              </div>
            </motion.div>

            {/* Feature 2 - Zap */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <motion.div
                animate={{
                  rotateX: [0, -Math.PI * 2],
                  rotateY: [0, Math.PI * 2],
                  rotateZ: [0, -Math.PI],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <motion.div
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-termo-light-orange/30 to-termo-light-orange/10 flex items-center justify-center shadow-2xl border-2 border-termo-light-orange/40"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(245, 158, 11, 0.3)",
                      "0 0 40px rgba(245, 158, 11, 0.6)",
                      "0 0 20px rgba(245, 158, 11, 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <Zap className="w-16 h-16 sm:w-20 sm:h-20 text-termo-light-orange" />
                </motion.div>
              </motion.div>

              <div className="space-y-3">
                <h4 className="text-xl sm:text-2xl font-bold">{t("landing.features.visualTitle")}</h4>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
                  {t("landing.features.visualDesc")}
                </p>
              </div>
            </motion.div>

            {/* Feature 3 - BookOpen */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <motion.div
                animate={{
                  rotateX: [0, Math.PI * 2],
                  rotateY: [0, -Math.PI * 2],
                  rotateZ: [0, Math.PI],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <motion.div
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-termo-light-orange/30 to-termo-light-orange/10 flex items-center justify-center shadow-2xl border-2 border-termo-light-orange/40"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(245, 158, 11, 0.3)",
                      "0 0 40px rgba(245, 158, 11, 0.6)",
                      "0 0 20px rgba(245, 158, 11, 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                >
                  <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-termo-light-orange" />
                </motion.div>
              </motion.div>

              <div className="space-y-3">
                <h4 className="text-xl sm:text-2xl font-bold">{t("landing.features.pathTitle")}</h4>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
                  {t("landing.features.pathDesc")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 items-center">
            <motion.div
              className="order-2 md:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">{t("landing.about.title")}</h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4">
                {t("landing.about.desc1")}
              </p>
              <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4">
                {t("landing.about.desc2")}
              </p>
              <p className="text-base sm:text-lg text-muted-foreground">
                {t("landing.about.desc3")}
              </p>
            </motion.div>
            <motion.div 
              className="order-1 md:order-2 rounded-lg sm:rounded-xl overflow-hidden h-60 sm:h-80 md:h-96"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Canvas camera={{ position: [0, 0, 3.5], fov: 75 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[5, 5, 5]} intensity={0.8} color="#f59e0b" />
                
                {/* Nucleus (Center Sphere) */}
                <mesh>
                  <sphereGeometry args={[0.25, 32, 32]} />
                  <meshStandardMaterial
                    color="#f59e0b"
                    emissive="#f59e0b"
                    emissiveIntensity={0.8}
                    metalness={0.7}
                    roughness={0.2}
                  />
                </mesh>

                {/* Electron Orbit 1 (XY Plane) */}
                <group>
                  <mesh position={[1.2, 0, 0]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial
                      color="#3b82f6"
                      emissive="#1e40af"
                      emissiveIntensity={0.6}
                      metalness={0.8}
                      roughness={0.1}
                    />
                  </mesh>
                </group>

                {/* Electron Orbit 2 (YZ Plane) */}
                <group>
                  <mesh position={[0, 1.2, 0]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial
                      color="#8b5cf6"
                      emissive="#6d28d9"
                      emissiveIntensity={0.6}
                      metalness={0.8}
                      roughness={0.1}
                    />
                  </mesh>
                </group>

                {/* Electron Orbit 3 (XZ Plane) */}
                <group>
                  <mesh position={[0, 0, 1.2]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial
                      color="#ec4899"
                      emissive="#be123c"
                      emissiveIntensity={0.6}
                      metalness={0.8}
                      roughness={0.1}
                    />
                  </mesh>
                </group>

                {/* Orbit Rings (Guide) */}
                <group>
                  <Torus args={[1.2, 0.03, 16, 100]}>
                    <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
                  </Torus>
                </group>

                <group rotation={[Math.PI / 3, 0, 0]}>
                  <Torus args={[1.2, 0.03, 16, 100]}>
                    <meshStandardMaterial color="#8b5cf6" transparent opacity={0.3} />
                  </Torus>
                </group>

                <group rotation={[0, Math.PI / 4, 0]}>
                  <Torus args={[1.2, 0.03, 16, 100]}>
                    <meshStandardMaterial color="#ec4899" transparent opacity={0.3} />
                  </Torus>
                </group>
              </Canvas>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-12 sm:py-20 px-3 sm:px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-16 sm:mb-24"
          >
            {t("landing.team.title")}
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Team Member 1 - Circle */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <motion.div
                animate={{
                  rotateY: [0, Math.PI * 2],
                  y: [0, -10, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <motion.div
                  className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-termo-light-orange/40 to-termo-light-orange/10 flex items-center justify-center shadow-2xl border-2 border-termo-light-orange/50 flex-shrink-0"
                  animate={{
                    boxShadow: [
                      "0 0 30px rgba(245, 158, 11, 0.4)",
                      "0 0 50px rgba(245, 158, 11, 0.8)",
                      "0 0 30px rgba(245, 158, 11, 0.4)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-5xl sm:text-6xl font-bold texto-gradient">👨</span>
                </motion.div>
              </motion.div>

              <div className="space-y-2">
                <h4 className="text-xl sm:text-2xl font-bold">Dr. Alex Chen</h4>
                <p className="text-sm text-termo-light-orange font-semibold">Lead Physics AI Researcher</p>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                  Expert in quantum mechanics and machine learning integration
                </p>
              </div>
            </motion.div>

            {/* Team Member 2 - Diamond */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <motion.div
                  className="w-40 h-40 sm:w-48 sm:h-48 bg-gradient-to-br from-termo-light-orange/40 to-termo-light-orange/10 flex items-center justify-center shadow-2xl border-2 border-termo-light-orange/50"
                  style={{ transform: "rotate(45deg)" }}
                  animate={{
                    boxShadow: [
                      "0 0 30px rgba(245, 158, 11, 0.4)",
                      "0 0 50px rgba(245, 158, 11, 0.8)",
                      "0 0 30px rgba(245, 158, 11, 0.4)",
                    ],
                    x: [0, 10, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-5xl sm:text-6xl" style={{ transform: "rotate(-45deg)" }}>👩</span>
                </motion.div>
              </motion.div>

              <div className="space-y-2">
                <h4 className="text-xl sm:text-2xl font-bold">Sarah Johnson</h4>
                <p className="text-sm text-termo-light-orange font-semibold">3D Visualization Director</p>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                  Specializes in creating immersive learning experiences with graphics
                </p>
              </div>
            </motion.div>

            {/* Team Member 3 - Hexagon */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <motion.div
                animate={{
                  rotateX: [0, Math.PI * 2],
                  rotateZ: [0, -Math.PI * 2],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <motion.div
                  className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center shadow-2xl border-2 border-termo-light-orange/50 flex-shrink-0"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.4), rgba(245, 158, 11, 0.1))",
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 30px rgba(245, 158, 11, 0.4)",
                      "0 0 50px rgba(245, 158, 11, 0.8)",
                      "0 0 30px rgba(245, 158, 11, 0.4)",
                    ],
                    y: [0, -15, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <span className="text-5xl sm:text-6xl">🧑</span>
                </motion.div>
              </motion.div>

              <div className="space-y-2">
                <h4 className="text-xl sm:text-2xl font-bold">Marcus Williams</h4>
                <p className="text-sm text-termo-light-orange font-semibold">Education Technology Lead</p>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                  Innovative approach to modern physics education and student engagement
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-16"
          >
            {t("landing.contact.title")}
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
            {/* Contact Info */}
            <motion.div
              className="space-y-6 sm:space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="flex gap-3 sm:gap-4"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-termo-light-orange/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold mb-1 text-sm sm:text-base">{t("landing.contact.email")}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">{t("landing.contact.emailContact")}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">{t("landing.contact.emailSupport")}</p>
                </div>
              </motion.div>

              <motion.div
                className="flex gap-3 sm:gap-4"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-termo-light-orange/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-sm sm:text-base">{t("landing.contact.phone")}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("landing.contact.phoneMain")}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("landing.contact.phoneSecondary")}</p>
                </div>
              </motion.div>

              <motion.div
                className="flex gap-3 sm:gap-4"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-termo-light-orange/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-sm sm:text-base">{t("landing.contact.office")}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("landing.contact.street")}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("landing.contact.city")}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Inquiry Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <InquiryForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-3 sm:px-4 bg-gradient-to-r from-termo-deep-blue/10 to-termo-light-orange/10 safe-area-inset-bottom">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6"
          >
            {t("landing.cta.title")}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-2"
          >
            {t("landing.cta.desc")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <Button
              size="lg"
              onClick={() => navigate("/chat")}
              className="gap-2 text-sm sm:text-base w-full sm:w-auto px-4"
            >
              {t("landing.cta.launchNow")} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
