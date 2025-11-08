// src/components/SkinAnalysis.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUpload,
  FaSpinner,
  FaDiagnoses,
  FaBrain,
  FaChartBar,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCamera,
  FaCloudUploadAlt,
  FaArrowRight,
  FaRedo,
  FaUserMd,
  FaStethoscope
} from 'react-icons/fa';
import { skinAnalysisAPI } from '../services/api';
import XAIExplanation from './XAIExplanation';
import HeatmapVisualization from './HeatmapVisualization';

const SkinAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const steps = [
    { 
      number: 1, 
      title: 'Upload Image', 
      icon: FaUpload,
      description: 'Select a clear image of skin condition'
    },
    { 
      number: 2, 
      title: 'AI Analysis', 
      icon: FaBrain,
      description: 'Advanced neural network processing'
    },
    { 
      number: 3, 
      title: 'Results & Insights', 
      icon: FaDiagnoses,
      description: 'Detailed diagnosis with explanations'
    }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');
    setActiveStep(1);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await skinAnalysisAPI.predictSkinDisease(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setAnalysisResult(result);
      setActiveStep(2);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
      setActiveStep(0);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setAnalysisResult(null);
    setActiveStep(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-200 shadow-sm mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaStethoscope className="text-blue-600 text-lg" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Skin Analysis
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Advanced skin condition detection with explainable AI insights and professional-grade analysis
          </p>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 -z-10 transition-all duration-500"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center relative">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${index <= activeStep 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent text-white shadow-lg' 
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                  ${index === activeStep ? 'scale-110 ring-4 ring-blue-100' : ''}
                `}>
                  <step.icon className="text-lg" />
                </div>
                <div className="text-center mt-3">
                  <p className={`font-semibold text-sm ${
                    index <= activeStep ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3"
            >
              <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => setError('')}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Upload */}
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="upload-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
            >
              <div className="text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FaCamera className="text-blue-600 text-2xl" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Upload Skin Image
                </h2>
                <p className="text-gray-600 mb-8">
                  Upload a clear, well-lit photo of the skin condition for AI analysis
                </p>

                {/* Upload Area */}
                <div 
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-8 mb-6 cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  
                  {!previewUrl ? (
                    <div className="text-center">
                      <FaCloudUploadAlt className="text-4xl text-gray-400 mb-4 mx-auto group-hover:text-blue-500 transition-colors" />
                      <p className="text-gray-600 mb-2">
                        <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-gray-500 text-sm">
                        JPEG, PNG, WebP (Max 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-48 rounded-xl mx-auto mb-4 shadow-md"
                      />
                      <p className="text-green-600 font-semibold flex items-center justify-center gap-2">
                        <FaCheckCircle />
                        Image selected successfully
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        {selectedFile?.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Guidelines */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaShieldAlt className="text-blue-600" />
                    Best Practices for Upload
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Use good lighting with minimal shadows
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Focus clearly on the affected area
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Include some surrounding healthy skin for context
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Avoid filters or image enhancements
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={triggerFileInput}
                    className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-medium hover:border-gray-400 transition-colors flex items-center gap-2"
                  >
                    <FaUpload />
                    Choose Different Image
                  </button>
                  
                  <button
                    onClick={handleFileUpload}
                    disabled={!selectedFile}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    Start Analysis
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Loading */}
          {activeStep === 1 && loading && (
            <motion.div
              key="loading-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12"
            >
              <div className="text-center max-w-md mx-auto">
                {/* Animated Spinner */}
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-blue-100 rounded-full mx-auto"></div>
                  <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2"></div>
                  <FaBrain className="text-2xl text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  AI Analysis in Progress
                </h3>
                <p className="text-gray-600 mb-6">
                  Our neural network is analyzing your image and generating detailed insights...
                </p>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Processing</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="space-y-3 text-left">
                  {[
                    'Image preprocessing and enhancement',
                    'Feature extraction and pattern recognition',
                    'Neural network classification',
                    'XAI explanation generation',
                    'Report compilation'
                  ].map((step, index) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-center gap-3 text-gray-600"
                    >
                      <FaSpinner className={`text-blue-500 animate-spin ${index <= Math.floor(uploadProgress / 20) ? 'opacity-100' : 'opacity-30'}`} />
                      <span className={index <= Math.floor(uploadProgress / 20) ? 'text-gray-800' : 'text-gray-400'}>
                        {step}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {activeStep === 2 && analysisResult && (
            <motion.div
              key="results-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Main Diagnosis Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className={`p-6 ${
                  analysisResult.diagnosis.isCancer 
                    ? 'bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100' 
                    : 'bg-gradient-to-r from-green-50 to-teal-50 border-b border-green-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        analysisResult.diagnosis.isCancer 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        <FaDiagnoses className="text-2xl" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {analysisResult.diagnosis.disease}
                        </h2>
                        <p className="text-gray-600">
                          AI Diagnosis Result
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800">
                        {analysisResult.diagnosis.confidence.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Confidence</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Cancer Assessment</h4>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        analysisResult.diagnosis.isCancer 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {analysisResult.diagnosis.isCancer ? (
                          <>
                            <FaExclamationTriangle />
                            Potentially Cancerous - Urgent Evaluation Recommended
                          </>
                        ) : (
                          <>
                            <FaCheckCircle />
                            Likely Benign - Routine Monitoring Advised
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Clinical Status</h4>
                      <p className="text-gray-700">
                        {analysisResult.diagnosis.cancerStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* XAI Explanations */}
              <XAIExplanation 
                explanations={analysisResult.explanations}
                diagnosis={analysisResult.diagnosis}
              />

              {/* Heatmap Visualization */}
              <HeatmapVisualization 
                heatmap={analysisResult.heatmap}
                diagnosis={analysisResult.diagnosis}
              />

              {/* Alternative Diagnoses */}
              {analysisResult.top_predictions && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <FaChartBar className="text-blue-600" />
                    Alternative Diagnoses
                  </h3>
                  <div className="space-y-4">
                    {analysisResult.top_predictions.map((pred, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center font-semibold text-gray-700">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{pred.class}</p>
                            <p className="text-gray-500 text-sm">Alternative possibility</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {(pred.confidence * 100).toFixed(1)}%
                          </p>
                          <p className="text-gray-500 text-sm">confidence</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-8">
                <button
                  onClick={handleReset}
                  className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-medium hover:border-gray-400 transition-colors flex items-center gap-2"
                >
                  <FaRedo />
                  Analyze Another Image
                </button>
                
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2">
                  <FaUserMd />
                  Find Dermatologist
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SkinAnalysis;