import React, { useState, useEffect } from "react";
import { 
  FaCamera, FaBrain, FaDiagnoses, FaPrescriptionBottle, 
  FaShieldAlt, FaRocket, FaChartLine, FaSync, FaUsers,
  FaMobile, FaCloud, FaDatabase, FaLock, FaBell,
  FaArrowRight, FaCheckCircle, FaPlay, FaPause
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const HowItWorks = () => {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [stats, setStats] = useState({
    analyses: 0,
    accuracy: 0,
    users: 0,
    conditions: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer to trigger animations when component is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('how-it-works');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  // Simulate loading animation and dynamic data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate API calls for dynamic data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Animate stats counting up
        animateStats();
        
        // Set animation data (in real app, this would be your Lottie JSON)
        setAnimationData(null);
        
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      loadData();
    }
  }, [isVisible]);

  const animateStats = () => {
    const targetStats = {
      analyses: 12500,
      accuracy: 95.7,
      users: 8400,
      conditions: 28
    };

    Object.keys(targetStats).forEach((key, index) => {
      const target = targetStats[key];
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setStats(prev => ({
          ...prev,
          [key]: key === 'accuracy' ? Number(current.toFixed(1)) : Math.floor(current)
        }));
      }, 16);
    });
  };

  // Auto-rotate through steps
  useEffect(() => {
    if (!isVisible || !autoPlay) return;

    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, autoPlay]);

  const steps = [
    {
      icon: <FaCamera />,
      title: "Image Capture",
      description: "Take or upload a clear, well-lit photo of your skin concern. Ensure the area is in focus and properly visible.",
      details: ["Use good lighting", "Keep camera steady", "Include surrounding area for context"],
      color: "from-cyan-400 to-blue-500",
      bgColor: "bg-gradient-to-br from-blue-900/30 to-cyan-900/20",
      iconColor: "text-cyan-400"
    },
    {
      icon: <FaBrain />,
      title: "AI Analysis",
      description: "Our advanced neural network processes the image using deep learning algorithms trained on thousands of dermatological cases.",
      details: ["Pattern recognition", "Feature extraction", "Comparative analysis"],
      color: "from-purple-400 to-indigo-500",
      bgColor: "bg-gradient-to-br from-purple-900/30 to-indigo-900/20",
      iconColor: "text-purple-400"
    },
    {
      icon: <FaDiagnoses />,
      title: "Instant Diagnosis",
      description: "Receive immediate, AI-powered insights with confidence scores and detailed analysis of potential conditions.",
      details: ["Multiple condition screening", "Confidence scoring", "Risk assessment"],
      color: "from-emerald-400 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-900/30 to-green-900/20",
      iconColor: "text-emerald-400"
    },
    {
      icon: <FaPrescriptionBottle />,
      title: "Care Plan",
      description: "Get personalized recommendations including self-care tips, when to see a doctor, and potential treatment options.",
      details: ["Personalized advice", "Doctor consultation guidance", "Monitoring recommendations"],
      color: "from-orange-400 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-900/30 to-red-900/20",
      iconColor: "text-orange-400"
    },
  ];

  const features = [
    {
      icon: <FaShieldAlt />,
      title: "Privacy First",
      description: "Your images and data are encrypted and never stored without your permission.",
      stat: "100% Secure",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: <FaRocket />,
      title: "Lightning Fast",
      description: "Get results in seconds with our optimized AI model processing.",
      stat: "< 30s Analysis",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: <FaChartLine />,
      title: "High Accuracy",
      description: "Clinical-grade accuracy verified through extensive testing and validation.",
      stat: `${stats.accuracy}% Accurate`,
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: <FaUsers />,
      title: "Trusted by Many",
      description: "Join thousands of users who trust our platform for skin health insights.",
      stat: `${stats.users}+ Users`,
      color: "from-orange-400 to-red-500"
    }
  ];

  const techSpecs = [
    {
      icon: <FaMobile />,
      title: "Mobile-Optimized",
      description: "Responsive design works seamlessly on all devices",
      color: "text-blue-400 bg-blue-900/50"
    },
    {
      icon: <FaCloud />,
      title: "Cloud Processing",
      description: "Scalable infrastructure for reliable performance",
      color: "text-cyan-400 bg-cyan-900/50"
    },
    {
      icon: <FaDatabase />,
      title: "Large Dataset",
      description: "Trained on 10,000+ dermatoscopic images",
      color: "text-purple-400 bg-purple-900/50"
    },
    {
      icon: <FaLock />,
      title: "End-to-End Encryption",
      description: "Military-grade security for your data",
      color: "text-green-400 bg-green-900/50"
    },
    {
      icon: <FaSync />,
      title: "Continuous Learning",
      description: "Model improves with each analysis",
      color: "text-orange-400 bg-orange-900/50"
    },
    {
      icon: <FaBell />,
      title: "Real-time Updates",
      description: "Instant notifications and results",
      color: "text-red-400 bg-red-900/50"
    }
  ];

  const conditions = [
    { name: "Melanoma", confidence: "98%", color: "from-red-400 to-pink-500", width: "98%" },
    { name: "Basal Cell Carcinoma", confidence: "96%", color: "from-orange-400 to-red-500", width: "96%" },
    { name: "Actinic Keratosis", confidence: "94%", color: "from-amber-400 to-orange-500", width: "94%" },
    { name: "Benign Nevi", confidence: "97%", color: "from-green-400 to-emerald-500", width: "97%" },
    { name: "Eczema", confidence: "95%", color: "from-blue-400 to-cyan-500", width: "95%" },
    { name: "Psoriasis", confidence: "93%", color: "from-purple-400 to-indigo-500", width: "93%" }
  ];

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (loading && !isVisible) {
    return (
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading How It Works...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-900/20 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-900/20 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/10 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isVisible ? { scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-blue-800/50 backdrop-blur-sm text-cyan-300 font-semibold mb-6 shadow-lg border border-cyan-500/30"
          >
            <FaRocket className="mr-3 text-cyan-400" /> 
            <span className="text-sm uppercase tracking-wide">How It Works</span>
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent mb-6">
            Simple, Fast, and Accurate
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our cutting-edge AI technology makes professional skin analysis accessible to everyone. 
            Get clinical-level insights in just a few simple steps.
          </p>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          variants={staggerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {[
            { label: "Analyses Done", value: stats.analyses.toLocaleString(), icon: "🔍", color: "from-blue-400 to-cyan-500" },
            { label: "Accuracy Rate", value: `${stats.accuracy}%`, icon: "🎯", color: "from-green-400 to-emerald-500" },
            { label: "Active Users", value: stats.users.toLocaleString(), icon: "👥", color: "from-purple-400 to-indigo-500" },
            { label: "Conditions", value: stats.conditions, icon: "🩺", color: "from-orange-400 to-red-500" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700/50 text-center group hover:shadow-2xl transition-all duration-500"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
              <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-400 font-medium text-sm uppercase tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Steps */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">4 Simple Steps to Better Skin Health</h3>
            <p className="text-gray-400 text-lg">Click on each step or watch them auto-play</p>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 shadow-lg flex space-x-3 border border-gray-700/50">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    activeStep === index
                      ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                      : "text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700/80"
                  }`}
                >
                  <span>Step {index + 1}</span>
                  {activeStep === index && <FaArrowRight className="text-sm" />}
                </button>
              ))}
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className="px-4 py-3 rounded-xl font-semibold text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700/80 transition-all duration-300"
              >
                {autoPlay ? <FaPause /> : <FaPlay />}
              </button>
            </div>
          </div>

          {/* Animated Step Display */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 p-10">
                    <div className="flex items-start mb-8">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${steps[activeStep].color} flex items-center justify-center text-white font-bold text-2xl mr-6 shadow-lg`}>
                        {activeStep + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold text-white mb-4">{steps[activeStep].title}</h3>
                        <p className="text-gray-300 text-lg leading-relaxed">{steps[activeStep].description}</p>
                      </div>
                    </div>
                    
                    <ul className="space-y-4">
                      {steps[activeStep].details.map((detail, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="flex items-center text-gray-300 text-lg p-3 rounded-xl hover:bg-gray-700/30 transition-colors duration-300"
                        >
                          <FaCheckCircle className={`text-xl mr-4 ${steps[activeStep].iconColor} flex-shrink-0`} />
                          <span>{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={`lg:w-1/2 ${steps[activeStep].bgColor} flex items-center justify-center p-10 min-h-[400px] relative overflow-hidden border-l border-gray-700/30`}>
                    <div className="text-center relative z-10">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 border border-gray-700/50">
                        <div className={`text-4xl bg-gradient-to-r ${steps[activeStep].color} bg-clip-text text-transparent`}>
                          {steps[activeStep].icon}
                        </div>
                      </div>
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl px-4 py-2 inline-block border border-gray-700/50">
                        <p className="text-gray-300 font-semibold">Step {activeStep + 1} of {steps.length}</p>
                      </div>
                    </div>
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-10 right-10 text-6xl text-white">•</div>
                      <div className="absolute bottom-10 left-10 text-6xl text-white">•</div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl text-white">•</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          variants={staggerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700/50 group cursor-pointer relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                y: -8,
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {React.cloneElement(feature.icon, { className: "text-2xl" })}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
              <div className={`text-transparent bg-gradient-to-r ${feature.color} bg-clip-text font-bold text-lg`}>
                {feature.stat}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden mb-20 border border-gray-700/50"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col xl:flex-row">
            <div className="xl:w-1/2 p-10 xl:p-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-emerald-900/50 text-emerald-300 font-semibold mb-6 border border-emerald-500/30">
                  <FaBrain className="mr-3" /> 
                  <span className="text-sm uppercase tracking-wide">Technology Stack</span>
                </div>
                <h3 className="text-4xl font-bold text-white mb-8">
                  Powered by Cutting-Edge AI
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                  {techSpecs.map((spec, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-gray-700/30 transition-all duration-300 group border border-gray-700/30"
                    >
                      <div className={`w-12 h-12 rounded-xl ${spec.color.split(' ')[1]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-gray-600/30`}>
                        {React.cloneElement(spec.icon, { className: `${spec.color.split(' ')[0]} text-lg` })}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg mb-2">{spec.title}</h4>
                        <p className="text-gray-300">{spec.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Accuracy by Condition */}
                <div className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-600/30">
                  <h4 className="font-bold text-white text-2xl mb-6">Detection Accuracy by Condition</h4>
                  <div className="space-y-5">
                    {conditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between group">
                        <span className="text-gray-300 font-medium text-lg flex-1">{condition.name}</span>
                        <div className="flex items-center space-x-4 w-48">
                          <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
                            <motion.div 
                              className={`h-3 rounded-full bg-gradient-to-r ${condition.color} shadow-lg`}
                              initial={{ width: 0 }}
                              animate={{ width: condition.width }}
                              transition={{ delay: 1 + index * 0.1, duration: 1 }}
                            />
                          </div>
                          <span className="text-white font-bold text-lg w-12 text-right">{condition.confidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Live Demo Side */}
            <div className="xl:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 flex items-center justify-center p-10 xl:p-12 min-h-[600px] relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center text-white relative z-10"
              >
                <div className="w-40 h-40 mx-auto mb-8 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-lg border border-white/30 shadow-2xl">
                  <FaBrain className="text-7xl text-white/90" />
                </div>
                <h4 className="text-3xl font-bold mb-4">Live AI Processing</h4>
                <p className="text-white/90 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  Real-time analysis powered by our advanced neural network trained on clinical data
                </p>
                
                {/* Enhanced Processing Animation */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                  <div className="flex justify-center space-x-3 mb-4">
                    {[1, 2, 3].map((dot) => (
                      <motion.div
                        key={dot}
                        className="w-3 h-3 bg-white rounded-full"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity, 
                          delay: dot * 0.2 
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-white/80 font-medium">Analyzing skin patterns in real-time...</p>
                  
                  {/* Progress bars */}
                  <div className="mt-4 space-y-3">
                    {['Pattern Recognition', 'Feature Analysis', 'Condition Matching'].map((stage, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white/70 text-sm flex-1">{stage}</span>
                        <motion.div 
                          className="h-2 bg-white/20 rounded-full overflow-hidden flex-1 max-w-32"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 1 + idx * 0.5, duration: 2 }}
                        >
                          <div className="h-full bg-green-400 rounded-full"></div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Interactive CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden border border-cyan-500/30">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
              Ready to Experience AI-Powered Skin Analysis?
            </h3>
            <p className="text-cyan-100 text-xl mb-8 max-w-2xl mx-auto relative z-10">
              Join {stats.users.toLocaleString()}+ users who trust our platform for accurate, instant skin health insights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <motion.button
                className="bg-white text-cyan-700 px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center space-x-3 hover:bg-cyan-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Start Free Analysis</span>
                <FaArrowRight className="text-sm" />
              </motion.button>
              <motion.button
                className="border-2 border-white text-white px-10 py-4 rounded-2xl font-bold hover:bg-white hover:text-cyan-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Live Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;