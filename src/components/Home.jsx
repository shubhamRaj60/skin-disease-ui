// src/components/Home.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCloudUploadAlt, FaCamera, FaSpinner, FaCheck, FaRedo, FaFlask, FaUserMd, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { predictImage } from '../api'; // Import the actual API function

const Home = ({ setCurrentAnalysis, setAnalysisHistory, user }) => {
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const handleFile = (file) => {
    if (file && file.type.match('image.*')) {
      // Check file size (max 5MB)
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
      document.getElementById('file-upload').click();
    }
  };

  const startAnalysis = async () => {
    if (!preview || !selectedFile) return;
    
    setIsUploading(true);
    
    try {
      console.log('Starting real analysis with backend API...');
      
      // Create FormData for the upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Call the actual backend API
      const analysisResult = await predictImage(formData);
      console.log('Backend analysis result:', analysisResult);
      
      // Create analysis object with backend response
      const newAnalysis = {
        id: `analysis_${Date.now()}`,
        timestamp: new Date().toISOString(),
        image: preview,
        ...analysisResult // This includes diagnosis, explanations, etc. from backend
      };

      console.log('Setting analysis data:', newAnalysis);
      
      setCurrentAnalysis(newAnalysis);
      setAnalysisHistory(newAnalysis);
      setAnalysisComplete(true);
      
      // Auto-navigate to results after a brief delay
      setTimeout(() => {
        navigate('/results');
      }, 1500);
      
    } catch (error) {
      console.error('Analysis failed:', error);
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
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="font-sans min-h-screen text-gray-800 relative overflow-hidden bg-gray-50">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent opacity-50 z-0"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-green-100/30 via-transparent to-transparent opacity-50 z-0"></div>
      
      <div className="relative z-10">
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-4">
                AI-Powered Skin Analysis
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                Your personal dermatological assistant, using advanced AI to provide instant and accurate skin analysis.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/how-it-works"
                  className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center"
                >
                  <FaFlask className="mr-2" /> How It Works
                </Link>
                <Link 
                  to="/dermatologists"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-medium shadow-sm hover:shadow-md transform hover:scale-105 transition-all flex items-center justify-center"
                >
                  <FaUserMd className="mr-2" /> Find a Specialist
                </Link>
              </div>
            </motion.div>

            {/* Upload Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
              {/* Left Column: Descriptive Text */}
              <div className="md:w-1/2 space-y-6 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-800">Analyze Your Skin in Seconds</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our advanced AI model, trained on thousands of clinical images, offers high-accuracy analysis for various skin conditions.
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center justify-center md:justify-start">
                    <FaShieldAlt className="text-green-500 mr-2" />
                    <span>Secure & Confidential</span>
                  </li>
                  <li className="flex items-center justify-center md:justify-start">
                    <FaCheck className="text-green-500 mr-2" />
                    <span>Highly Accurate AI Model</span>
                  </li>
                  <li className="flex items-center justify-center md:justify-start">
                    <FaUserMd className="text-green-500 mr-2" />
                    <span>Personalized Recommendations</span>
                  </li>
                </ul>
                
                {!user && (
                  <div className="bg-blue-50 rounded-lg p-4 mt-6">
                    <p className="text-blue-700 text-sm">
                      <Link to="/auth" className="font-semibold underline">Sign up</Link> to save your analysis history and track your skin health over time.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Upload Component */}
              <motion.div
                className="md:w-1/2 bg-gray-50 rounded-2xl p-8 shadow-inner border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.3 }}
              >
                <div
                  className={`text-center cursor-pointer transition-all ${
                    dragActive ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : 
                    !preview && !isUploading && !analysisComplete ? 'hover:bg-gray-100' : ''
                  } rounded-xl p-4`}
                  onClick={triggerUpload}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    id="file-upload"
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleChange}
                  />

                  {/* Default Upload State */}
                  {!preview && !isUploading && !analysisComplete && (
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="py-10">
                      <FaCloudUploadAlt className="text-6xl text-blue-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {dragActive ? 'Drop your image here' : 'Drag & Drop or Browse'}
                      </h3>
                      <p className="text-gray-500 mb-6">Supported formats: JPG, PNG (max 5MB)</p>
                      <motion.button 
                        className="bg-blue-600 text-white font-medium py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105"
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
                      >
                        <FaCamera className="inline mr-2" /> Upload Image
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Preview State */}
                  {preview && !isUploading && !analysisComplete && (
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="py-6">
                      <img src={preview} alt="Preview" className="max-h-80 mx-auto rounded-xl shadow-md mb-6 transition-all hover:shadow-lg" />
                      <motion.button 
                        className="bg-blue-600 text-white font-medium py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105"
                        onClick={startAnalysis}
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
                      >
                        {isUploading ? <FaSpinner className="inline mr-2 animate-spin" /> : 'Analyze Image'}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Loading State */}
                  {isUploading && (
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="py-10">
                      <motion.div
                        className="w-16 h-16 mx-auto mb-6 border-4 border-blue-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Analyzing Your Image...</h3>
                      <p className="text-gray-500">Our AI is examining your skin condition</p>
                    </motion.div>
                  )}

                  {/* Complete State */}
                  {analysisComplete && (
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="py-10">
                      <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center shadow-md">
                        <FaCheck className="text-2xl text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Analysis Complete!</h3>
                      <p className="text-gray-500 mb-4">Redirecting to results...</p>
                    </motion.div>
                  )}
                </div>

                {/* Action Buttons */}
                {(preview || isUploading || analysisComplete) && (
                  <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
                    <button 
                      className="text-gray-600 hover:text-blue-600 flex items-center transition-all" 
                      onClick={resetUpload}
                    >
                      <FaRedo className="mr-1" /> Reset
                    </button>
                    {analysisComplete && (
                      <button
                        className="bg-green-600 text-white font-medium py-2 px-6 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                        onClick={() => navigate('/results')}
                      >
                        View Results
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;