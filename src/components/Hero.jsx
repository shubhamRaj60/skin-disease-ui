// src/components/Hero.jsx
import React, { useEffect, useRef } from 'react';
import { FaArrowRight, FaVideo, FaStethoscope, FaShieldAlt, FaClock, FaUserMd, FaCheckCircle, FaStar, FaHeartbeat, FaClinicMedical, FaUsers, FaAward } from 'react-icons/fa';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

const Hero = ({ onStartAnalysis, onFindDoctors, onViewCommunityInsights, onViewPreventionGuide, user, communityInsights }) => {
  const heroRef = useRef(null);
  
  // Medical background images
  const medicalImages = {
    main: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    pattern: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    doctor: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    technology: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  };

  // Enhanced animated text values
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  // Floating medical elements
  const FloatingElement = ({ delay = 0, size = 40, color = "from-cyan-400 to-blue-400" }) => (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-r ${color} opacity-10`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1, 0.5],
        opacity: [0, 0.2, 0],
        y: [0, -80, -160],
        x: [0, 30, -30],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800"
    >
      {/* Medical Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${medicalImages.main})` }}
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-gray-800/95" />

      {/* Medical Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: `url(${medicalImages.pattern})` }}
      />

      {/* Enhanced floating elements */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <FloatingElement 
            key={i} 
            delay={i * 0.8} 
            size={Math.random() * 50 + 20}
            color={i % 4 === 0 ? "from-cyan-400 to-blue-400" : 
                   i % 4 === 1 ? "from-blue-400 to-indigo-400" : 
                   i % 4 === 2 ? "from-emerald-400 to-cyan-400" : 
                   "from-sky-400 to-blue-400"}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="text-center max-w-4xl mx-auto py-16 md:py-20">
          {/* Medical Trust Badge */}
          <motion.div 
            className="relative inline-flex items-center gap-3 bg-blue-800/40 backdrop-blur-md border border-cyan-500/30 px-5 py-2 rounded-xl mb-10 shadow-lg"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, type: "spring" }}
          >
            <FaClinicMedical className="text-cyan-400 text-lg" />
            <span className="font-semibold text-cyan-300 text-sm tracking-wide">
              TRUSTED BY HEALTHCARE PROFESSIONALS
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div 
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={textVariants}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <motion.div 
                className="mb-3"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-white bg-clip-text text-transparent">
                  AI-Powered Skin
                </span>
              </motion.div>
              
              <motion.div 
                className="mb-3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <span className="text-white">
                  Health Analysis
                </span>
              </motion.div>
            </h1>
          </motion.div>
          
          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.p 
              className="text-lg md:text-xl text-blue-200 mb-10 font-normal max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              Instantly detect common skin conditions with{" "}
              <span className="font-semibold text-cyan-400 bg-blue-800/30 px-2 py-1 rounded-lg border border-cyan-500/30">
                85% accuracy
              </span>{" "}
              and receive expert-backed recommendations using advanced artificial intelligence.
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            {/* Primary Button */}
            <motion.button
              onClick={onStartAnalysis}
              className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-xl font-semibold flex items-center gap-3 text-lg overflow-hidden border border-cyan-400/30 shadow-xl"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0px 15px 30px rgba(34, 211, 238, 0.4)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaVideo className="text-lg" />
              </motion.div>
              Start Free Analysis
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FaArrowRight />
              </motion.div>
            </motion.button>

            {/* Secondary Button */}
            <motion.button
              onClick={onFindDoctors}
              className="group relative bg-blue-800/40 backdrop-blur-md border border-cyan-500 text-cyan-300 hover:bg-blue-700/40 px-8 py-4 rounded-xl font-semibold flex items-center gap-3 text-lg transition-all duration-300 shadow-lg"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0px 10px 25px rgba(34, 211, 238, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <FaStethoscope className="text-lg" />
              Find Dermatologists
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1 }}
          >
            {[
              { 
                icon: FaCheckCircle, 
                value: "85%", 
                label: "Clinical Accuracy", 
                color: "cyan"
              },
              { 
                icon: FaUsers, 
                value: "10K+", 
                label: "Patients Served", 
                color: "blue"
              },
              { 
                icon: FaStethoscope, 
                value: "50+", 
                label: "Conditions", 
                color: "cyan"
              },
              { 
                icon: FaAward, 
                value: "24/7", 
                label: "Available", 
                color: "blue"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="text-center p-5 rounded-xl bg-blue-800/20 backdrop-blur-sm border border-blue-600/20 hover:border-cyan-500/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02,
                  borderColor: "rgba(34, 211, 238, 0.4)"
                }}
              >
                <div className={`text-xl mx-auto mb-2 text-${item.color}-400`}>
                  <item.icon />
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mb-1">
                  {item.value}
                </div>
                <div className="text-xs text-blue-300 font-medium tracking-wide">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature Tags */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 text-blue-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.3 }}
          >
            {[
              { text: "No registration required", icon: "🔒" },
              { text: "Results in 30 seconds", icon: "⚡" },
              { text: "Free forever", icon: "🎯" },
              { text: "Doctor verified", icon: "👨‍⚕️" }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-2 bg-blue-800/30 px-3 py-2 rounded-lg backdrop-blur-sm border border-blue-600/30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.3 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(30, 64, 175, 0.4)",
                }}
              >
                <span className="text-sm">{feature.icon}</span>
                <span className="text-sm font-medium text-blue-100">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Medical Features */}
          <motion.div 
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
          >
            {[
              {
                icon: FaShieldAlt,
                title: "Secure & Private",
                description: "HIPAA compliant data protection",
                color: "green"
              },
              {
                icon: FaHeartbeat,
                title: "Clinical Grade",
                description: "Validated by dermatologists",
                color: "red"
              },
              {
                icon: FaClinicMedical,
                title: "Always Available",
                description: "24/7 access to analysis",
                color: "blue"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl bg-blue-800/10 backdrop-blur-sm border border-blue-600/20 hover:border-cyan-500/30 transition-all duration-300"
                whileHover={{ 
                  scale: 1.03,
                  backgroundColor: "rgba(30, 64, 175, 0.2)",
                }}
              >
                <div className={`w-12 h-12 bg-${feature.color}-600/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-${feature.color}-500/30`}>
                  <feature.icon className={`text-${feature.color}-400 text-xl`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-blue-300 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div 
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="flex flex-col items-center gap-2">
          <motion.span 
            className="text-sm font-medium text-cyan-400"
            animate={{ 
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Discover More
          </motion.span>
          <motion.div 
            className="w-5 h-8 border-2 border-cyan-400 rounded-full flex justify-center"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div 
              className="w-1 h-2 bg-cyan-400 rounded-full mt-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;