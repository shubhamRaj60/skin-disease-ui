import React, { useCallback, useState, useEffect } from 'react';
import { 
  FaCloudUploadAlt, 
  FaCamera, 
  FaSpinner, 
  FaCheck,
  FaRedo,
  FaExclamationTriangle,
  FaInfoCircle,
  FaRobot,
  FaSync,
  FaShieldAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { predictImage, getRetrainingStatus } from '../api';

const UploadSection = ({ 
  onUpload, 
  onReset, 
  analysisComplete, 
  user,
  setCurrentAnalysis,
  setAnalysisHistory 
}) => {
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [retrainingStatus, setRetrainingStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);

  // Poll retraining status for notifications
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'doctor') {
      const interval = setInterval(async () => {
        try {
          const status = await getRetrainingStatus();
          setRetrainingStatus(status);
        } catch (error) {
          console.error('Error fetching retraining status:', error);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image (JPEG, PNG, or WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Image size must be less than 10MB');
    }

    if (file.size < 1024) {
      throw new Error('Image file seems too small');
    }

    return true;
  };

  const handleFile = (file) => {
    try {
      setError(null);
      validateFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFileInfo({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          type: file.type,
          lastModified: new Date(file.lastModified).toLocaleDateString()
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setPreview(null);
      setFileInfo(null);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave' || e.type === 'drop') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

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
    if (!preview) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Get the actual file for upload
      const fileInput = document.getElementById('file-upload');
      const file = fileInput.files[0];

      if (!file) {
        throw new Error('No file selected');
      }

      // Create FormData for the upload
      const formData = new FormData();
      formData.append('file', file);

      // Make the actual API call
      const analysisResult = await predictImage(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Wait a moment to show completion
      await new Promise(resolve => setTimeout(resolve, 500));

      // Pass results to parent
      if (onUpload) {
        onUpload(analysisResult);
      }

      // Also update current analysis and history if callbacks are provided
      if (setCurrentAnalysis) {
        setCurrentAnalysis(analysisResult);
      }

      if (setAnalysisHistory) {
        setAnalysisHistory(analysisResult);
      }

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setFileInfo(null);
    setError(null);
    setUploadProgress(0);
    
    // Reset file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
    
    if (onReset) {
      onReset();
    }
  };

  // Variants for animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: 'easeOut' 
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { 
        duration: 0.3, 
        ease: 'easeIn' 
      } 
    }
  };

  // Retraining Notification Component
  const RetrainingNotification = () => {
    if (!retrainingStatus?.is_retraining) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FaSync className="text-yellow-600 mt-1 animate-spin" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-800 mb-1">
              Model Retraining in Progress
            </h4>
            <p className="text-yellow-700 text-sm mb-2">
              {retrainingStatus.current_step} ({retrainingStatus.progress}%)
            </p>
            <div className="w-full bg-yellow-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${retrainingStatus.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Error Display Component
  const ErrorDisplay = () => {
    if (!error) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
      >
        <div className="flex items-start space-x-3">
          <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800 mb-1">Upload Error</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  // File Info Component
  const FileInfoDisplay = () => {
    if (!fileInfo) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="bg-blue-50 rounded-lg p-4 mb-4"
      >
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">Filename:</span>
            <p className="text-blue-800 truncate">{fileInfo.name}</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Size:</span>
            <p className="text-blue-800">{fileInfo.size}</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Type:</span>
            <p className="text-blue-800">{fileInfo.type.split('/')[1].toUpperCase()}</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Uploaded:</span>
            <p className="text-blue-800">{fileInfo.lastModified}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  // Upload Progress Component
  const ProgressBar = () => {
    if (!isUploading || uploadProgress === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4"
      >
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Uploading and analyzing...</span>
          <span>{uploadProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            initial={{ width: '0%' }}
            animate={{ width: `${uploadProgress}%` }}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <section className="py-16 bg-gray-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Upload Your Skin Image
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our advanced AI model analyzes skin conditions with high accuracy using ResNet technology. 
            Upload a clear, well-lit photo of the affected area for instant analysis.
          </p>
        </div>

        {/* Retraining Notification */}
        <RetrainingNotification />
        
        {/* Error Display */}
        <ErrorDisplay />
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          <div 
            className={`relative p-8 md:p-12 text-center cursor-pointer transition-all duration-300
              ${dragActive ? 'bg-blue-50 border-blue-300' : 'bg-white border-dashed border-transparent'}
              ${error ? 'border-red-300 bg-red-50' : ''}`}
            onClick={triggerUpload}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              id="file-upload"
              type="file" 
              className="hidden" 
              accept="image/jpeg, image/jpg, image/png, image/webp"
              onChange={handleChange}
            />
            
            <AnimatePresence mode="wait">
              {!preview && !isUploading && !analysisComplete && (
                <motion.div
                  key="upload"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={containerVariants}
                >
                  <div className="mb-6">
                    <FaCloudUploadAlt className="text-5xl text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Drag & Drop or Browse Files
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Supported formats: JPG, PNG, WebP (max 10MB)
                    </p>
                    
                    {/* Tips for better analysis */}
                    <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                      <div className="flex items-start space-x-2 text-sm text-blue-700">
                        <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                          <strong>Tips for best results:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• Use good lighting without shadows</li>
                            <li>• Focus clearly on the skin area</li>
                            <li>• Include some surrounding skin for context</li>
                            <li>• Avoid filters or edited images</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <motion.button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-md transition-all transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaCamera className="inline mr-2" /> Upload Image
                  </motion.button>
                </motion.div>
              )}
              
              {preview && !isUploading && !analysisComplete && (
                <motion.div
                  key="preview"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={containerVariants}
                >
                  <FileInfoDisplay />
                  
                  <div className="relative inline-block">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-80 mx-auto rounded-xl mb-6 shadow-md transition-all hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      Ready to Analyze
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <motion.button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-md transition-all transform hover:scale-105"
                      onClick={startAnalysis}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaRobot className="inline mr-2" /> Analyze with AI
                    </motion.button>
                    
                    <div className="text-sm text-gray-500 flex items-center justify-center space-x-4">
                      <div className="flex items-center">
                        <FaShieldAlt className="mr-1 text-green-500" />
                        <span>Secure & Private</span>
                      </div>
                      <div className="flex items-center">
                        <FaRobot className="mr-1 text-blue-500" />
                        <span>AI-Powered Analysis</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {isUploading && (
                <motion.div
                  key="uploading"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={containerVariants}
                >
                  <div className="py-8">
                    <motion.div 
                      className="w-16 h-16 mx-auto mb-6 border-4 border-blue-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    ></motion.div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Analyzing Your Image
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Our AI is examining skin patterns and features...
                    </p>
                    
                    <ProgressBar />
                    
                    <div className="mt-6 text-sm text-gray-500">
                      <div className="flex items-center justify-center space-x-6">
                        <div className="text-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mx-auto mb-1"></div>
                          <span>Processing Image</span>
                        </div>
                        <div className="text-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mx-auto mb-1"></div>
                          <span>AI Analysis</span>
                        </div>
                        <div className="text-center">
                          <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto mb-1"></div>
                          <span>Generating Report</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {analysisComplete && (
                <motion.div
                  key="complete"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={containerVariants}
                >
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCheck className="text-2xl text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Analysis Complete!
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Your AI-powered skin analysis is ready
                    </p>
                    <motion.button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full shadow-md transition-all transform hover:scale-105"
                      onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Detailed Results
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="border-t border-gray-100 p-4 flex justify-between items-center bg-gray-50">
            <button 
              className="text-gray-600 hover:text-blue-600 flex items-center transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleReset}
              disabled={isUploading}
            >
              <FaRedo className="mr-1" /> Reset
            </button>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <FaShieldAlt className="mr-1 text-green-500" />
                Your data is secure
              </span>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Privacy Policy
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <FaRobot className="text-2xl text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-800">AI-Powered</h4>
            <p className="text-gray-600 text-sm">Advanced ResNet model trained on medical data</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <FaShieldAlt className="text-2xl text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-800">Secure & Private</h4>
            <p className="text-gray-600 text-sm">Your images are never stored or shared</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <FaInfoCircle className="text-2xl text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-800">Instant Results</h4>
            <p className="text-gray-600 text-sm">Get detailed analysis in seconds</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;