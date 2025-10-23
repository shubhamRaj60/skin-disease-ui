// src/components/Hero.jsx
import React, { useEffect, useRef } from 'react';
import { FaArrowRight, FaVideo, FaStethoscope, FaShieldAlt, FaClock, FaUserMd, FaCheckCircle, FaStar } from 'react-icons/fa';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

const Hero = ({ onStartAnalysis, onFindDoctors }) => {
  const heroRef = useRef(null);

  // Animated floating elements
  const FloatingElement = ({ delay = 0, size = 40, color = "from-cyan-400 to-purple-500" }) => (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-r ${color} opacity-20`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1, 0],
        opacity: [0, 0.3, 0],
        y: [0, -80, -160],
        x: [0, 30, -30]
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        repeatType: "loop"
      }}
      style={{
        width: size,
        height: size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  );

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900"
    >
      {/* Clean Background with Less Blur */}
      <div className="absolute inset-0">
        {/* Static Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900" />
        
        {/* Subtle Animated Overlay */}
        <motion.div 
          className="absolute inset-0 opacity-40"
          animate={{
            background: [
              'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)',
              'linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6)',
              'linear-gradient(45deg, #8b5cf6, #06b6d4, #3b82f6)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{
            mixBlendMode: 'overlay'
          }}
        />
        
        {/* Clean floating elements */}
        {[...Array(8)].map((_, i) => (
          <FloatingElement 
            key={i} 
            delay={i * 0.8} 
            size={Math.random() * 40 + 20}
            color={i % 3 === 0 ? "from-cyan-400 to-blue-500" : i % 3 === 1 ? "from-purple-400 to-pink-500" : "from-blue-400 to-cyan-500"}
          />
        ))}
      </div>

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto py-16 md:py-24">
          {/* Clear Security Badge */}
          <motion.div 
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl mb-12 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <FaShieldAlt className="text-green-400 text-lg" />
            <span className="font-bold text-white text-sm tracking-wide">HIPAA COMPLIANT • 100% SECURE</span>
            <div className="flex gap-1">
              <FaStar className="text-yellow-400 text-xs" />
              <FaStar className="text-yellow-400 text-xs" />
              <FaStar className="text-yellow-400 text-xs" />
            </div>
          </motion.div>

          {/* Clear Main Heading */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <motion.span 
                className="bg-gradient-to-r from-cyan-300 via-white to-blue-300 bg-clip-text text-transparent block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                AI-Powered
              </motion.span>
              <motion.span 
                className="text-white block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Skin Health
              </motion.span>
              <motion.span 
                className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Analysis
              </motion.span>
            </h1>
          </motion.div>
          
          {/* Clear Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-100 mb-12 font-medium max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            Instantly detect common skin conditions with{" "}
            <span className="font-bold text-cyan-300 bg-cyan-900/30 px-2 py-1 rounded-lg">
              98% accuracy
            </span>{" "}
            and receive expert-backed recommendations using advanced artificial intelligence.
          </motion.p>

          {/* Clear CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            {/* Primary Button */}
            <motion.button
              onClick={onStartAnalysis}
              className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-12 py-6 rounded-2xl font-bold shadow-2xl flex items-center gap-4 text-lg overflow-hidden border-2 border-cyan-400/50"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0px 20px 40px rgba(6, 182, 212, 0.4)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center gap-4">
                <FaVideo className="text-xl" />
                Start Free Analysis
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FaArrowRight />
                </motion.div>
              </span>
              
              {/* Shine effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full"
                whileHover={{ translateX: "200%" }}
                transition={{ duration: 0.8 }}
              />
            </motion.button>

            {/* Secondary Button */}
            <motion.button
              onClick={onFindDoctors}
              className="group relative bg-white/15 backdrop-blur-md border-2 border-white/40 text-white px-10 py-5 rounded-2xl font-semibold shadow-xl flex items-center gap-4 text-lg hover:bg-white/25 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaStethoscope className="text-xl" />
              Find Dermatologists
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                →
              </motion.div>
            </motion.button>
          </motion.div>

          {/* Clear Trust Indicators */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            {[
              { 
                icon: FaCheckCircle, 
                value: "98%", 
                label: "Accuracy Rate", 
                gradient: "from-green-400 to-emerald-500",
                bg: "bg-green-500/20",
                border: "border-green-400/30"
              },
              { 
                icon: FaUserMd, 
                value: "10K+", 
                label: "Skin Analyses", 
                gradient: "from-blue-400 to-cyan-500",
                bg: "bg-blue-500/20",
                border: "border-blue-400/30"
              },
              { 
                icon: FaStethoscope, 
                value: "50+", 
                label: "Conditions", 
                gradient: "from-purple-400 to-fuchsia-500",
                bg: "bg-purple-500/20",
                border: "border-purple-400/30"
              },
              { 
                icon: FaClock, 
                value: "24/7", 
                label: "Available", 
                gradient: "from-cyan-400 to-blue-500",
                bg: "bg-cyan-500/20",
                border: "border-cyan-400/30"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className={`text-center p-6 rounded-2xl border-2 ${item.border} ${item.bg} backdrop-blur-sm shadow-lg`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3 + index * 0.1 }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02,
                  borderColor: item.border.replace('30', '50')
                }}
              >
                <div className={`text-2xl mx-auto mb-3 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                  <item.icon />
                </div>
                <div className="text-2xl md:text-3xl font-black text-white mb-1">
                  {item.value}
                </div>
                <div className="text-sm text-gray-200 font-semibold tracking-wide">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Clear Features */}
          <motion.div 
            className="mt-12 flex flex-wrap justify-center gap-6 text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium">No registration required</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm font-medium">Results in 30 seconds</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-sm font-medium">Free forever</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Clean Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="flex flex-col items-center gap-3">
          <motion.span 
            className="text-sm font-medium text-gray-300"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Scroll to explore
          </motion.span>
          <motion.div 
            className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div 
              className="w-1 h-3 bg-cyan-400 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;