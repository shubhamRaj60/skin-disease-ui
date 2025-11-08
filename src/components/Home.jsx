// src/components/Home.jsx
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCloudUploadAlt, FaCamera, FaSpinner, FaCheck, FaRedo, FaFlask, FaUserMd, FaShieldAlt, FaRobot, FaStar, FaMagic, FaStethoscope, FaHeartbeat, FaClinicMedical } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { predictImage } from '../api';

const Home = ({ setCurrentAnalysis, setAnalysisHistory, user, loading, communityInsights }) => {
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Medical-themed background images
  const medicalImages = {
    background: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    pattern: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  };

  // Floating animation variants
  const floatingAnimation = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const handleFile = (file) => {
    if (file && file.type.match('image.*')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Please select an image smaller than 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setSelectedFile(file);
    } else {
      alert('Please select a valid image file (JPG, PNG, etc.)');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    if (!preview && !isUploading && !analysisComplete) {
      fileInputRef.current?.click();
    }
  };

  const startAnalysis = async () => {
    if (!preview || !selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const analysisResult = await predictImage(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const newAnalysis = {
        id: `analysis_${Date.now()}`,
        timestamp: new Date().toISOString(),
        image: preview,
        ...analysisResult
      };
      
      setCurrentAnalysis(newAnalysis);
      setAnalysisHistory(newAnalysis);
      setAnalysisComplete(true);
      
      setTimeout(() => {
        navigate('/results');
      }, 2000);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      clearInterval(progressInterval);
      alert('Analysis failed. Please try again. Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setPreview(null);
    setSelectedFile(null);
    setIsUploading(false);
    setAnalysisComplete(false);
    setUploadProgress(0);
  };

  return (
    <div className="font-sans min-h-screen text-white relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: `url(${medicalImages.pattern})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-gray-800/95" />

      <div className="relative z-10">
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            {/* Header Section */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                className="inline-flex items-center gap-3 bg-blue-800/40 backdrop-blur-md border border-blue-600 px-5 py-2 rounded-xl mb-6 shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FaClinicMedical className="text-cyan-400 text-lg" />
                <span className="font-semibold text-cyan-300 text-sm">TRUSTED BY DERMATOLOGISTS</span>
              </motion.div>

              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                DermaScan AI
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                Advanced skin analysis powered by clinical AI with{" "}
                <span className="font-semibold text-cyan-400 bg-blue-800/30 px-2 py-1 rounded-lg border border-cyan-500/30">
                  85% accuracy
                </span>
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row justify-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <Link 
                  to="/how-it-works"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 border border-cyan-500/30"
                >
                  <FaFlask className="text-sm" />
                  How It Works
                </Link>
                
                <Link 
                  to="/dermatologists"
                  className="bg-blue-800/40 backdrop-blur-md border border-cyan-500 text-cyan-300 hover:bg-blue-700/40 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaUserMd className="text-sm" />
                  Find Specialists
                </Link>
              </motion.div>
            </motion.div>

            {/* Medical Features Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
            >
              {[
                { 
                  icon: FaStethoscope, 
                  title: "Clinical Validation", 
                  desc: "Developed with dermatologists and validated on clinical data",
                  color: "blue"
                },
                { 
                  icon: FaHeartbeat, 
                  title: "Patient First", 
                  desc: "Prioritizes accurate detection and patient safety above all",
                  color: "cyan"
                },
                { 
                  icon: FaClinicMedical, 
                  title: "Healthcare Ready", 
                  desc: "Designed to support professional medical diagnosis",
                  color: "indigo"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-blue-800/20 backdrop-blur-sm rounded-xl p-5 border border-blue-600/20 hover:border-cyan-500/30 transition-all duration-300"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                  }}
                >
                  <div className={`w-12 h-12 bg-${feature.color}-600/20 rounded-lg flex items-center justify-center mb-3 border border-${feature.color}-500/30`}>
                    <feature.icon className={`text-${feature.color}-400 text-lg`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Upload Section */}
            <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-700/20 p-8 flex flex-col lg:flex-row items-start gap-10">
              {/* Left Column: Features */}
              <div className="lg:w-2/5 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Professional Skin Analysis in Seconds
                  </h2>
                  <p className="text-blue-200 leading-relaxed">
                    Get instant preliminary analysis of skin conditions using our clinically-trained AI model.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: FaShieldAlt, text: "Secure & Private", color: "green" },
                    { icon: FaCheck, text: "85% Clinical Accuracy", color: "blue" },
                    { icon: FaUserMd, text: "Medical Grade Analysis", color: "cyan" },
                    { icon: FaMagic, text: "Instant Results", color: "indigo" }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-700/20"
                      whileHover={{ 
                        scale: 1.02,
                        borderColor: "rgba(34, 211, 238, 0.3)"
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className={`w-10 h-10 bg-${feature.color}-600/20 rounded-lg flex items-center justify-center border border-${feature.color}-500/30`}>
                        <feature.icon className={`text-${feature.color}-400 text-base`} />
                      </div>
                      <span className="font-medium text-white text-sm">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                {!user && (
                  <div className="bg-blue-900/30 rounded-lg p-4 border border-cyan-500/20">
                    <p className="text-cyan-300 text-xs font-medium">
                      <Link to="/auth" className="font-bold underline hover:text-cyan-200">
                        Create an account
                      </Link>{" "}
                      to save your analysis history and track progress.
                    </p>
                  </div>
                )}

                {/* Community Stats */}
                {communityInsights && (
                  <div className="bg-indigo-900/30 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/30">
                        <FaStar className="text-purple-400 text-xs" />
                      </div>
                      <span className="font-semibold text-purple-300 text-sm">Community Today</span>
                    </div>
                    <div className="text-xs text-purple-200">
                      <span className="font-medium">{communityInsights.today?.total_scans || 0}+</span> scans •{" "}
                      <span className="font-medium text-green-400">{communityInsights.today?.benign_percentage || 0}%</span> benign
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Upload Area */}
              <div className="lg:w-3/5 w-full">
                <div className="bg-gradient-to-br from-gray-800 to-blue-900/30 rounded-2xl p-6 shadow-xl border border-cyan-500/10">
                  <motion.div
                    className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
                      dragActive 
                        ? 'border-cyan-400 bg-cyan-900/20 scale-[1.01]' 
                        : preview 
                          ? 'border-green-400/50 bg-green-900/10' 
                          : 'border-blue-600/50 hover:border-cyan-400 hover:bg-blue-900/20'
                    }`}
                    whileHover={!preview && !isUploading && !analysisComplete ? { scale: 1.01 } : {}}
                  >
                    <input 
                      ref={fileInputRef}
                      id="file-upload"
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleChange}
                    />

                    <div
                      className="text-center cursor-pointer p-6"
                      onClick={triggerUpload}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <AnimatePresence mode="wait">
                        {/* Default Upload State */}
                        {!preview && !isUploading && !analysisComplete && (
                          <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="py-8"
                          >
                            <motion.div
                              className="relative mb-4"
                              variants={floatingAnimation}
                              animate="animate"
                            >
                              <FaCloudUploadAlt className="text-5xl text-cyan-400 mx-auto" />
                            </motion.div>
                            
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {dragActive ? 'Drop to Analyze' : 'Upload Skin Image'}
                            </h3>
                            
                            <p className="text-blue-300 text-sm mb-6 max-w-sm mx-auto">
                              Drag & drop or click to browse. JPG, PNG (max 5MB)
                            </p>
                            
                            <button 
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 border border-cyan-400/30 hover:scale-105"
                            >
                              <span className="flex items-center gap-2">
                                <FaCamera className="text-sm" />
                                Choose Image
                              </span>
                            </button>
                          </motion.div>
                        )}

                        {/* Preview State */}
                        {preview && !isUploading && !analysisComplete && (
                          <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="py-6"
                          >
                            <div className="relative mb-4">
                              <img 
                                src={preview} 
                                alt="Preview" 
                                className="max-h-64 mx-auto rounded-xl shadow-lg border-2 border-cyan-500/30" 
                              />
                            </div>
                            
                            <button 
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 border border-green-400/30 hover:scale-105"
                              onClick={startAnalysis}
                            >
                              <span className="flex items-center gap-2">
                                <FaRobot className="text-sm" />
                                Start Analysis
                              </span>
                            </button>
                          </motion.div>
                        )}

                        {/* Loading State */}
                        {isUploading && (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-8"
                          >
                            <div className="w-16 h-16 mx-auto mb-4 relative">
                              <div className="absolute inset-0 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                            </div>
                            
                            <h3 className="text-lg font-semibold text-white mb-2">
                              Analyzing Image
                            </h3>
                            
                            <p className="text-cyan-300 text-sm mb-4">
                              Our AI is processing your image...
                            </p>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-3 overflow-hidden">
                              <motion.div 
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${uploadProgress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <div className="text-xs text-cyan-300 font-medium">
                              {uploadProgress}% Complete
                            </div>
                          </motion.div>
                        )}

                        {/* Complete State */}
                        {analysisComplete && (
                          <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="py-8"
                          >
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border border-green-300">
                              <FaCheck className="text-xl text-white" />
                            </div>
                            
                            <h3 className="text-lg font-semibold text-white mb-2">
                              Analysis Complete
                            </h3>
                            
                            <p className="text-cyan-300 text-sm mb-4">
                              Redirecting to your results...
                            </p>

                            <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto animate-pulse" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  {(preview || isUploading || analysisComplete) && (
                    <div className="mt-4 flex justify-between items-center border-t border-blue-700/30 pt-4">
                      <button 
                        className="text-blue-300 hover:text-cyan-400 flex items-center gap-1 transition-all px-3 py-1 rounded-lg hover:bg-blue-800/20 text-sm"
                        onClick={resetUpload}
                      >
                        <FaRedo className="text-xs" />
                        New Image
                      </button>
                      
                      {analysisComplete && (
                        <button
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-green-400/30 text-sm"
                          onClick={() => navigate('/results')}
                        >
                          View Results
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Disclaimer */}
            <motion.div 
              className="mt-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-blue-400 text-xs max-w-3xl mx-auto leading-relaxed">
                <strong className="text-cyan-400">Note:</strong> This tool provides preliminary analysis and is not a substitute for professional medical diagnosis. 
                Always consult healthcare providers for medical concerns. Accuracy rates are based on clinical validation studies.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;