import React, { useState, useEffect } from "react";
import { 
  FaCamera, FaBrain, FaDiagnoses, FaPrescriptionBottle, 
  FaShieldAlt, FaRocket, FaChartLine, FaSync, FaUsers,
  FaMobile, FaCloud, FaDatabase, FaLock, FaBell
} from "react-icons/fa";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";

const HowItWorks = () => {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
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
          [key]: Math.floor(current)
        }));
      }, 16);
    });
  };

  // Auto-rotate through steps
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const steps = [
    {
      icon: <FaCamera />,
      title: "Image Capture",
      description: "Take or upload a clear, well-lit photo of your skin concern. Ensure the area is in focus and properly visible.",
      details: ["Use good lighting", "Keep camera steady", "Include surrounding area for context"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: <FaBrain />,
      title: "AI Analysis",
      description: "Our advanced neural network processes the image using deep learning algorithms trained on thousands of dermatological cases.",
      details: ["Pattern recognition", "Feature extraction", "Comparative analysis"],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: <FaDiagnoses />,
      title: "Instant Diagnosis",
      description: "Receive immediate, AI-powered insights with confidence scores and detailed analysis of potential conditions.",
      details: ["Multiple condition screening", "Confidence scoring", "Risk assessment"],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    },
    {
      icon: <FaPrescriptionBottle />,
      title: "Care Plan",
      description: "Get personalized recommendations including self-care tips, when to see a doctor, and potential treatment options.",
      details: ["Personalized advice", "Doctor consultation guidance", "Monitoring recommendations"],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50"
    },
  ];

  const features = [
    {
      icon: <FaShieldAlt />,
      title: "Privacy First",
      description: "Your images and data are encrypted and never stored without your permission.",
      stat: "100% Secure"
    },
    {
      icon: <FaRocket />,
      title: "Lightning Fast",
      description: "Get results in seconds with our optimized AI model processing.",
      stat: "< 30s Analysis"
    },
    {
      icon: <FaChartLine />,
      title: "High Accuracy",
      description: "Clinical-grade accuracy verified through extensive testing and validation.",
      stat: `${stats.accuracy}% Accurate`
    },
    {
      icon: <FaUsers />,
      title: "Trusted by Many",
      description: "Join thousands of users who trust our platform for skin health insights.",
      stat: `${stats.users}+ Users`
    }
  ];

  const techSpecs = [
    {
      icon: <FaMobile />,
      title: "Mobile-Optimized",
      description: "Responsive design works seamlessly on all devices"
    },
    {
      icon: <FaCloud />,
      title: "Cloud Processing",
      description: "Scalable infrastructure for reliable performance"
    },
    {
      icon: <FaDatabase />,
      title: "Large Dataset",
      description: "Trained on 10,000+ dermatoscopic images"
    },
    {
      icon: <FaLock />,
      title: "End-to-End Encryption",
      description: "Military-grade security for your data"
    },
    {
      icon: <FaSync />,
      title: "Continuous Learning",
      description: "Model improves with each analysis"
    },
    {
      icon: <FaBell />,
      title: "Real-time Updates",
      description: "Instant notifications and results"
    }
  ];

  const conditions = [
    { name: "Melanoma", confidence: "98%", color: "bg-red-100 text-red-800" },
    { name: "Basal Cell Carcinoma", confidence: "96%", color: "bg-orange-100 text-orange-800" },
    { name: "Actinic Keratosis", confidence: "94%", color: "bg-yellow-100 text-yellow-800" },
    { name: "Benign Nevi", confidence: "97%", color: "bg-green-100 text-green-800" },
    { name: "Eczema", confidence: "95%", color: "bg-blue-100 text-blue-800" },
    { name: "Psoriasis", confidence: "93%", color: "bg-purple-100 text-purple-800" }
  ];

  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

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
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading How It Works...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isVisible ? { scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-medium mb-4"
          >
            <FaRocket className="mr-2" /> How It Works
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Simple, Fast, and Accurate
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Our cutting-edge AI technology makes skin analysis accessible to everyone. 
            Get professional-level insights in just a few simple steps.
          </p>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          variants={staggerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {[
            { label: "Analyses Done", value: stats.analyses, icon: "🔍" },
            { label: "Accuracy Rate", value: `${stats.accuracy}%`, icon: "🎯" },
            { label: "Active Users", value: stats.users, icon: "👥" },
            { label: "Conditions", value: stats.conditions, icon: "🩺" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Steps */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">4 Simple Steps to Better Skin Health</h3>
            <p className="text-gray-600">Click on each step or watch them auto-play</p>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-2xl p-2 shadow-lg flex space-x-2">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    activeStep === index
                      ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Step {index + 1}
                </button>
              ))}
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
                className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 p-8">
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${steps[activeStep].color} flex items-center justify-center text-white font-bold text-xl mr-4`}>
                        {activeStep + 1}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{steps[activeStep].title}</h3>
                        <p className="text-gray-600">{steps[activeStep].description}</p>
                      </div>
                    </div>
                    
                    <ul className="space-y-3">
                      {steps[activeStep].details.map((detail, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center text-gray-700"
                        >
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0"></span>
                          {detail}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8 min-h-[300px]">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                        {React.cloneElement(steps[activeStep].icon, { 
                          className: `text-3xl bg-gradient-to-r ${steps[activeStep].color} bg-clip-text text-transparent` 
                        })}
                      </div>
                      <p className="text-gray-600">Step {activeStep + 1} of {steps.length}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          variants={staggerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 group cursor-pointer"
              whileHover={{ 
                scale: 1.05,
                y: -5,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
            >
              <div className="w-12 h-12 mb-4 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                {React.cloneElement(feature.icon, { className: "text-xl text-blue-600" })}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
              <div className="text-blue-600 font-bold text-sm">{feature.stat}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-600 font-medium mb-4">
                  <FaBrain className="mr-2" /> Technology Stack
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Powered by Cutting-Edge AI
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {techSpecs.map((spec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {React.cloneElement(spec.icon, { className: "text-blue-600" })}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{spec.title}</h4>
                        <p className="text-gray-600 text-xs">{spec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Accuracy by Condition */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Detection Accuracy by Condition</h4>
                  <div className="space-y-3">
                    {conditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{condition.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${condition.color.split(' ')[0]}`}
                              style={{ width: condition.confidence }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-12">{condition.confidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Live Demo Side */}
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8 min-h-[500px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center text-white"
              >
                <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <FaBrain className="text-6xl text-white/90" />
                </div>
                <h4 className="text-2xl font-bold mb-2">Live AI Processing</h4>
                <p className="text-white/80 mb-6 max-w-sm">
                  Real-time analysis powered by our advanced neural network
                </p>
                
                {/* Simulated Processing Animation */}
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex space-x-2 mb-3">
                    {[1, 2, 3].map((dot) => (
                      <motion.div
                        key={dot}
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: dot * 0.2 }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-white/70">Analyzing skin patterns...</p>
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Experience AI-Powered Skin Analysis?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join {stats.users}+ users who trust our platform for accurate, instant skin health insights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Analysis
              </motion.button>
              <motion.button
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;