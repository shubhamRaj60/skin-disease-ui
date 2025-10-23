// src/components/HistoryTimeline.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaChevronRight, 
  FaTrash, 
  FaFilter, 
  FaChartLine,
  FaUserMd,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaDownload,
  FaShare,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSync,
  FaEye,
  FaEdit
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyDiagnosis, getRetrainingMetrics } from '../api';

const HistoryTimeline = ({ history, user, onVerificationSubmit }) => {
  const [filter, setFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    isCorrect: null,
    correctedDiagnosis: '',
    notes: ''
  });
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // HAM10000 classes for verification
  const HAM10000_CLASSES = [
    { value: 'akiec', label: 'Actinic Keratosis' },
    { value: 'bcc', label: 'Basal Cell Carcinoma' },
    { value: 'bkl', label: 'Benign Keratosis' },
    { value: 'df', label: 'Dermatofibroma' },
    { value: 'mel', label: 'Melanoma' },
    { value: 'nv', label: 'Melanocytic Nevus' },
    { value: 'vasc', label: 'Vascular Lesion' }
  ];

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'doctor') {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const data = await getRetrainingMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Filter history based on selections
  const filteredHistory = history.filter(item => {
    // Disease type filter
    if (filter !== 'all' && item.diagnosis?.disease !== filter) {
      return false;
    }

    // Verification status filter
    if (verificationFilter !== 'all') {
      if (verificationFilter === 'verified' && !item.doctorVerified) return false;
      if (verificationFilter === 'pending' && item.doctorVerified) return false;
      if (verificationFilter === 'corrected' && !item.doctorCorrection) return false;
    }

    return true;
  });

  const getSeverityColor = (disease, isCancer) => {
    if (isCancer) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    
    switch (disease) {
      case 'Actinic Keratosis':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Benign Keratosis':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getVerificationBadge = (analysis) => {
    if (analysis.doctorVerified) {
      if (analysis.doctorCorrection) {
        return {
          text: 'Corrected',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: FaEdit
        };
      }
      return {
        text: 'Verified',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: FaCheckCircle
      };
    }
    return {
      text: 'Pending Review',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: FaClock
    };
  };

  const getDiseaseStats = () => {
    const stats = {};
    history.forEach(item => {
      const disease = item.diagnosis?.disease || 'Unknown';
      stats[disease] = (stats[disease] || 0) + 1;
    });
    return stats;
  };

  const getVerificationStats = () => {
    const stats = {
      verified: 0,
      corrected: 0,
      pending: 0,
      total: history.length
    };

    history.forEach(item => {
      if (item.doctorVerified) {
        if (item.doctorCorrection) {
          stats.corrected++;
        } else {
          stats.verified++;
        }
      } else {
        stats.pending++;
      }
    });

    return stats;
  };

  const handleVerificationStart = (analysis) => {
    setSelectedAnalysis(analysis);
    setVerificationData({
      isCorrect: null,
      correctedDiagnosis: '',
      notes: ''
    });
    setShowVerificationModal(true);
  };

  const handleVerificationSubmit = async () => {
    if (!selectedAnalysis || verificationData.isCorrect === null) return;

    try {
      const verificationPayload = {
        originalDiagnosis: selectedAnalysis.diagnosis?.classCode || selectedAnalysis.diagnosis?.disease,
        verifiedDiagnosis: verificationData.isCorrect ? 
          (selectedAnalysis.diagnosis?.classCode || selectedAnalysis.diagnosis?.disease) : 
          verificationData.correctedDiagnosis,
        doctorId: user?.id || 'demo_doctor',
        imageId: selectedAnalysis.id,
        isCorrect: verificationData.isCorrect,
        confidenceScore: selectedAnalysis.diagnosis?.confidence || 0,
        notes: verificationData.notes
      };

      await verifyDiagnosis(verificationPayload);

      // Update local state through callback
      if (onVerificationSubmit) {
        onVerificationSubmit(selectedAnalysis.id, verificationPayload);
      }

      setShowVerificationModal(false);
      setSelectedAnalysis(null);
      
      alert('Verification submitted successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to submit verification. Please try again.');
    }
  };

  const exportAnalysisData = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skin-analysis-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const diseaseStats = getDiseaseStats();
  const verificationStats = getVerificationStats();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <FaCalendarAlt className="text-3xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis History</h2>
          <p className="text-gray-600 mb-6">
            Sign in to save and track your skin analysis history over time.
          </p>
          <Link 
            to="/auth" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium inline-block"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Analysis History</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review your past skin analysis, track progress, and manage doctor verifications
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Analyses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="text-2xl font-bold text-blue-600 mb-2">{history.length}</div>
            <div className="text-gray-600">Total Analyses</div>
          </motion.div>

          {/* Verified Analyses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="text-2xl font-bold text-green-600 mb-2">{verificationStats.verified}</div>
            <div className="text-gray-600">Verified</div>
          </motion.div>

          {/* Pending Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="text-2xl font-bold text-blue-600 mb-2">{verificationStats.pending}</div>
            <div className="text-gray-600">Pending Review</div>
          </motion.div>

          {/* Corrected */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="text-2xl font-bold text-orange-600 mb-2">{verificationStats.corrected}</div>
            <div className="text-gray-600">Corrected</div>
          </motion.div>
        </div>

        {/* Admin/Doctor Metrics */}
        {(user?.role === 'admin' || user?.role === 'doctor') && metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaChartLine className="mr-2 text-blue-600" />
                Model Performance Metrics
              </h3>
              <button 
                onClick={fetchMetrics}
                disabled={loadingMetrics}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <FaSync className={`mr-1 ${loadingMetrics ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            {metrics.accuracy_trends && metrics.accuracy_trends.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {metrics.accuracy_trends[0]?.accuracy || 0}%
                  </div>
                  <div className="text-gray-600">Current Accuracy</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {metrics.accuracy_trends.reduce((sum, trend) => sum + trend.verification_count, 0)}
                  </div>
                  <div className="text-gray-600">Total Verifications</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {metrics.model_health?.accuracy_improvement || 0}%
                  </div>
                  <div className="text-gray-600">Last Improvement</div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Header with Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
            <h3 className="text-xl font-semibold text-gray-800">Analysis History</h3>
            
            <div className="flex flex-wrap gap-3">
              {/* Disease Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Conditions</option>
                <option value="Melanoma">Melanoma</option>
                <option value="Basal Cell Carcinoma">Basal Cell Carcinoma</option>
                <option value="Actinic Keratosis">Actinic Keratosis</option>
                <option value="Benign Keratosis">Benign Keratosis</option>
                <option value="Dermatofibroma">Dermatofibroma</option>
                <option value="Melanocytic Nevus">Melanocytic Nevus</option>
                <option value="Vascular Lesion">Vascular Lesion</option>
              </select>

              {/* Verification Filter */}
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending Review</option>
                <option value="corrected">Corrected</option>
              </select>

              {/* Export Button */}
              <button
                onClick={exportAnalysisData}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                disabled={history.length === 0}
              >
                <FaDownload className="mr-1" /> Export
              </button>

              {/* New Analysis Button */}
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
              >
                <FaEye className="mr-1" /> New Analysis
              </Link>
            </div>
          </div>

          {/* Analysis List */}
          <AnimatePresence>
            {filteredHistory.length > 0 ? (
              <div className="space-y-4">
                {filteredHistory.map((item, index) => {
                  const verificationBadge = getVerificationBadge(item);
                  const IconComponent = verificationBadge.icon;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => setSelectedAnalysis(item)}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image Preview */}
                        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                          <div className="bg-gray-100 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center overflow-hidden relative">
                            {item.imagePath || item.image ? (
                              <img 
                                src={item.imagePath || item.image} 
                                alt="Skin analysis" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                                  <FaCalendarAlt className="text-blue-600" />
                                </div>
                                <p className="text-gray-500 text-sm">Skin Image</p>
                              </div>
                            )}
                            
                            {/* Cancer Indicator */}
                            {item.diagnosis?.isCancer && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                CANCER
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Analysis Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-gray-800 text-lg">
                                {item.diagnosis?.disease || 'Unknown Diagnosis'}
                              </h4>
                              <p className="text-gray-500 text-sm">
                                <FaCalendarAlt className="inline mr-1" /> 
                                {new Date(item.timestamp).toLocaleDateString()} at {' '}
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {/* Verification Badge */}
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${verificationBadge.color}`}>
                                <IconComponent className="mr-1" size={10} />
                                {verificationBadge.text}
                              </span>

                              {/* Confidence Badge */}
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(item.diagnosis?.disease, item.diagnosis?.isCancer)}`}>
                                {item.diagnosis?.confidence || 0}% confidence
                              </span>

                              {/* Doctor Verification Button */}
                              {(user?.role === 'doctor' || user?.role === 'admin') && !item.doctorVerified && (
                                <button
                                  className="text-blue-600 hover:text-blue-800 transition p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerificationStart(item);
                                  }}
                                  title="Verify Diagnosis"
                                >
                                  <FaUserMd size={14} />
                                </button>
                              )}

                              {/* Delete Button */}
                              <button 
                                className="text-gray-400 hover:text-red-500 transition p-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Are you sure you want to delete this analysis?')) {
                                    // Implement delete functionality
                                    console.log('Delete analysis:', item.id);
                                  }
                                }}
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Additional Information */}
                          <div className="mb-3">
                            <p className="text-gray-600 text-sm mb-1">
                              <strong>Cancer Status:</strong>{' '}
                              <span className={item.diagnosis?.isCancer ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                                {item.diagnosis?.cancerStatus || (item.diagnosis?.isCancer ? 'CANCEROUS' : 'NON-CANCEROUS')}
                              </span>
                            </p>
                            
                            {item.doctorCorrection && (
                              <p className="text-orange-600 text-sm mb-1">
                                <strong>Doctor Correction:</strong> {item.doctorCorrection}
                              </p>
                            )}

                            {item.detectedFeatures && item.detectedFeatures.length > 0 && (
                              <p className="text-gray-600 text-sm">
                                <strong>Detected Features:</strong>{' '}
                                {item.detectedFeatures.map(f => f.feature).join(', ')}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                              View Full Details <FaChevronRight className="ml-1 text-xs" />
                            </button>
                            
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <span>ID: {item.id.slice(-8)}</span>
                              {item.userRole && (
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                  {item.userRole}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaCalendarAlt className="text-3xl text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No analysis history</h4>
                <p className="text-gray-500 mb-6">
                  {filter === 'all' 
                    ? "You haven't performed any skin analysis yet."
                    : `No analysis found for the selected filters.`
                  }
                </p>
                <Link 
                  to="/" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium inline-block"
                >
                  Start Your First Analysis
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Load More Button */}
          {filteredHistory.length > 0 && (
            <div className="mt-8 text-center">
              <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-lg transition flex items-center justify-center mx-auto">
                Load More Analyses
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Detail Modal */}
      <AnalysisDetailModal 
        analysis={selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
        user={user}
        onVerificationStart={handleVerificationStart}
      />

      {/* Doctor Verification Modal */}
      <DoctorVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        analysis={selectedAnalysis}
        verificationData={verificationData}
        setVerificationData={setVerificationData}
        onSubmit={handleVerificationSubmit}
        HAM10000_CLASSES={HAM10000_CLASSES}
      />
    </section>
  );
};

// Analysis Detail Modal Component
const AnalysisDetailModal = ({ analysis, onClose, user, onVerificationStart }) => {
  if (!analysis) return null;

  return (
    <AnimatePresence>
      {analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Analysis Details</h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  {analysis.imagePath || analysis.image ? (
                    <img 
                      src={analysis.imagePath || analysis.image} 
                      alt="Skin analysis" 
                      className="w-full rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaCalendarAlt className="text-4xl mx-auto mb-2" />
                      <p>Image not available</p>
                    </div>
                  )}
                </div>
                
                {/* Doctor Verification Section */}
                {(user?.role === 'doctor' || user?.role === 'admin') && !analysis.doctorVerified && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <FaUserMd className="mr-2" />
                      Doctor Verification Required
                    </h4>
                    <p className="text-blue-700 text-sm mb-3">
                      Please verify this AI diagnosis for quality assurance.
                    </p>
                    <button
                      onClick={() => onVerificationStart(analysis)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium w-full"
                    >
                      Verify Diagnosis
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Diagnosis Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 mb-1">Condition</p>
                    <p className="text-xl font-bold text-gray-900">{analysis.diagnosis?.disease}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 mb-1">Confidence Level</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${analysis.diagnosis?.confidence || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-sm text-gray-500 mt-1">{analysis.diagnosis?.confidence || 0}%</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 mb-1">Cancer Status</p>
                      <p className={`font-medium ${analysis.diagnosis?.isCancer ? 'text-red-600' : 'text-green-600'}`}>
                        {analysis.diagnosis?.cancerStatus || (analysis.diagnosis?.isCancer ? 'CANCEROUS' : 'NON-CANCEROUS')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Urgency</p>
                      <p className="font-medium text-gray-800">{analysis.diagnosis?.urgency || 'CONSULT DOCTOR'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 mb-1">Date & Time</p>
                    <p className="text-gray-800">
                      {new Date(analysis.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {/* Verification Status */}
                  {analysis.doctorVerified && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        <span className="font-medium text-green-800">Doctor Verified</span>
                      </div>
                      {analysis.doctorCorrection && (
                        <p className="text-green-700 text-sm mt-1">
                          <strong>Correction:</strong> {analysis.doctorCorrection}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Explanations */}
            {analysis.explanations?.dynamic && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">AI Explanation</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-800">
                      {analysis.explanations.dynamic.visualExplanation || 
                       `The AI identified ${analysis.diagnosis?.disease} based on analysis of visual features.`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700">
                      {analysis.explanations.dynamic.clinicalRationale || 
                       `Clinical characteristics are consistent with ${analysis.diagnosis?.disease}.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={onClose}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Close
              </button>
              <Link 
                to="/" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                New Analysis
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Doctor Verification Modal Component
const DoctorVerificationModal = ({ 
  isOpen, 
  onClose, 
  analysis, 
  verificationData, 
  setVerificationData, 
  onSubmit,
  HAM10000_CLASSES 
}) => {
  if (!isOpen || !analysis) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-800">Verify Diagnosis</h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">AI Diagnosis</h4>
                <p className="text-lg text-blue-600 font-medium">{analysis.diagnosis?.disease}</p>
                <p className="text-sm text-gray-600">
                  Confidence: {analysis.diagnosis?.confidence}%
                </p>
              </div>

              <div>
                <p className="text-gray-700 mb-3">Is this diagnosis correct?</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setVerificationData({ ...verificationData, isCorrect: true })}
                    className={`flex-1 py-3 rounded-lg font-medium transition ${
                      verificationData.isCorrect === true
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    <FaCheckCircle className="inline mr-2" />
                    Correct
                  </button>
                  <button
                    onClick={() => setVerificationData({ ...verificationData, isCorrect: false })}
                    className={`flex-1 py-3 rounded-lg font-medium transition ${
                      verificationData.isCorrect === false
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    <FaTimesCircle className="inline mr-2" />
                    Incorrect
                  </button>
                </div>
              </div>

              {verificationData.isCorrect === false && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Diagnosis
                    </label>
                    <select
                      value={verificationData.correctedDiagnosis}
                      onChange={(e) => setVerificationData({
                        ...verificationData,
                        correctedDiagnosis: e.target.value
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select correct diagnosis</option>
                      {HAM10000_CLASSES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={verificationData.notes}
                      onChange={(e) => setVerificationData({
                        ...verificationData,
                        notes: e.target.value
                      })}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional comments about the correction..."
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onSubmit}
                  disabled={
                    verificationData.isCorrect === null ||
                    (verificationData.isCorrect === false && !verificationData.correctedDiagnosis)
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Submit Verification
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HistoryTimeline;