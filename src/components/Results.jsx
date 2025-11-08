// src/components/Results.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { verifyDiagnosis, suggestTreatment } from '../api';
import { 
    FaDiagnoses, 
    FaFilePdf, 
    FaUserMd, 
    FaMapMarkerAlt, 
    FaArrowRight, 
    FaBrain,
    FaLayerGroup,
    FaExclamation,
    FaCheck,
    FaArrowLeft,
    FaShieldAlt,
    FaInfoCircle,
    FaCheckCircle,
    FaDownload,
    FaShare,
    FaBookmark,
    FaHeartbeat,
    FaMedkit,
    FaCalendarCheck,
    FaClipboardList,
    FaLightbulb,
    FaSync,
    FaExclamationTriangle,
    FaThumbsUp,
    FaThumbsDown,
    FaHistory,
    FaStar,
    FaSpinner
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import XAIExplanation from './XAIExplanation';


const Results = ({ analysis, user, onVerificationSubmit, analysisHistory, preventionData, onLoadPreventionData }) => {
    const [treatmentSuggestions, setTreatmentSuggestions] = useState(null);
    const [loadingTreatment, setLoadingTreatment] = useState(false);
    const [analysisSteps, setAnalysisSteps] = useState([]);
    const [doctorVerification, setDoctorVerification] = useState({
        isCorrect: null,
        correctedDiagnosis: '',
        notes: '',
        isSubmitting: false
    });
    const [error, setError] = useState(null);
    const [showDetailedXAI, setShowDetailedXAI] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showAllFeatures, setShowAllFeatures] = useState(false);

    const validateAnalysisData = (analysisData) => {
        if (!analysisData) {
            return { isValid: false, error: 'No analysis data provided' };
        }

        const { diagnosis } = analysisData;
        
        if (!diagnosis || (!diagnosis.disease && !diagnosis.classCode)) {
            return { isValid: false, error: 'Disease information is missing' };
        }

        if (typeof diagnosis.confidence !== 'number') {
            return { isValid: false, error: 'Confidence data is invalid' };
        }

        if (typeof diagnosis.isCancer !== 'boolean') {
            return { isValid: false, error: 'Cancer status is missing' };
        }

        return { isValid: true };
    };

    useEffect(() => {
        if (analysis) {
            const validation = validateAnalysisData(analysis);
            if (!validation.isValid) {
                setError(validation.error);
                return;
            }
            setError(null);
            
            setAnalysisSteps(analysis.analysisPipeline || []);
            fetchTreatmentSuggestions();
            
            if (analysis.diagnosis?.disease && onLoadPreventionData) {
                onLoadPreventionData(analysis.diagnosis.disease);
            }
        }
    }, [analysis]);

    const fetchTreatmentSuggestions = async () => {
        if (!analysis?.diagnosis) return;
        
        setLoadingTreatment(true);
        try {
            const data = await suggestTreatment({
                disease: analysis.diagnosis.disease || analysis.diagnosis.classCode || 'Unknown',
                isCancer: analysis.diagnosis.isCancer || false,
                confidence: analysis.diagnosis.confidence || 0,
                detectedFeatures: analysis.detectedFeatures || []
            });
            setTreatmentSuggestions(data);
        } catch (error) {
            console.error('Error fetching treatment suggestions:', error);
            setTreatmentSuggestions({
                treatmentSuggestions: {
                    urgency: analysis.diagnosis.isCancer ? 'HIGH' : 'LOW',
                    recommendations: [
                        'Consult dermatologist for professional evaluation',
                        analysis.diagnosis.isCancer ? 'Biopsy recommended for confirmation' : 'Regular monitoring advised'
                    ],
                    nextSteps: [
                        'Schedule appointment with specialist',
                        'Document lesion characteristics',
                        analysis.diagnosis.isCancer ? 'Immediate evaluation needed' : 'Follow up in 3 months'
                    ]
                }
            });
        } finally {
            setLoadingTreatment(false);
        }
    };
    
    const handleVerificationSubmit = async (isCorrect) => {
        if (!analysis?.diagnosis) return;

        setDoctorVerification(prev => ({ ...prev, isSubmitting: true }));

        try {
            const verificationData = {
                originalDiagnosis: analysis.diagnosis.classCode || analysis.diagnosis.disease || 'Unknown',
                verifiedDiagnosis: isCorrect ? 
                    (analysis.diagnosis.classCode || analysis.diagnosis.disease || 'Unknown') : 
                    doctorVerification.correctedDiagnosis,
                doctorId: user?.id || 'demo_doctor',
                imageId: analysis.imageId || `img_${Date.now()}`,
                isCorrect: isCorrect,
                confidenceScore: analysis.diagnosis.confidence || 0,
                notes: doctorVerification.notes
            };

            await verifyDiagnosis(verificationData);
            
            setDoctorVerification({
                isCorrect: null,
                correctedDiagnosis: '',
                notes: '',
                isSubmitting: false
            });

            if (onVerificationSubmit) {
                onVerificationSubmit(verificationData);
            }

        } catch (error) {
            console.error('Error submitting verification:', error);
        } finally {
            setDoctorVerification(prev => ({ ...prev, isSubmitting: false }));
        }
    };

    const getUrgencyColor = (urgency) => {
        if (!urgency) return 'bg-gray-800/50 text-gray-300 border-gray-600/50';
        
        switch (urgency?.toUpperCase()) {
            case 'HIGH': return 'bg-red-900/30 text-red-300 border-red-500/30';
            case 'MEDIUM_HIGH': return 'bg-orange-900/30 text-orange-300 border-orange-500/30';
            case 'MEDIUM': return 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30';
            case 'LOW_MEDIUM': return 'bg-blue-900/30 text-blue-300 border-blue-500/30';
            case 'LOW': return 'bg-green-900/30 text-green-300 border-green-500/30';
            case 'MONITOR': return 'bg-purple-900/30 text-purple-300 border-purple-500/30';
            default: return 'bg-gray-800/50 text-gray-300 border-gray-600/50';
        }
    };

    const getCancerStatusColor = (isCancer) => {
        return isCancer ? 
            'bg-red-900/30 text-red-300 border-red-500/30' : 
            'bg-green-900/30 text-green-300 border-green-500/30';
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 90) return 'from-green-500 to-emerald-500';
        if (confidence >= 80) return 'from-green-400 to-green-500';
        if (confidence >= 70) return 'from-yellow-400 to-yellow-500';
        if (confidence >= 60) return 'from-orange-400 to-orange-500';
        return 'from-red-400 to-red-500';
    };

    const formatConfidence = (confidence) => {
        if (typeof confidence !== 'number') return '0%';
        return `${confidence.toFixed(2)}%`;
    };

    const HAM10000_CLASSES = [
        { value: 'akiec', label: 'Actinic Keratosis' },
        { value: 'bcc', label: 'Basal Cell Carcinoma' },
        { value: 'bkl', label: 'Benign Keratosis' },
        { value: 'df', label: 'Dermatofibroma' },
        { value: 'mel', label: 'Melanoma' },
        { value: 'nv', label: 'Melanocytic Nevus' },
        { value: 'vasc', label: 'Vascular Lesion' }
    ];

    const getDiagnosisDisease = () => { 
        return analysis?.diagnosis?.disease || analysis?.diagnosis?.classCode || 'Unknown Diagnosis'; 
    };
    
    const getDiagnosisConfidence = () => { 
        return analysis?.diagnosis?.confidence || 0; 
    };
    
    const getIsCancer = () => { 
        return analysis?.diagnosis?.isCancer || false; 
    };
    
    const getCancerStatus = () => { 
        return analysis?.diagnosis?.cancerStatus || (getIsCancer() ? 'CANCEROUS' : 'NON-CANCEROUS'); 
    };
    
    const getUrgency = () => { 
        return analysis?.diagnosis?.urgency || (getIsCancer() ? 'HIGH' : 'LOW'); 
    };
    
    const getAlternativeDiagnoses = () => { 
        return analysis?.alternativeDiagnoses || []; 
    };
    
    const getExplanations = () => { 
        return analysis?.explanations || {}; 
    };
    
    const hasXAIExplanations = () => {
        const explanations = getExplanations();
        return explanations && Object.keys(explanations).length > 0;
    };

    const handleExportReport = async (format) => {
        setExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log(`Exporting report as ${format}`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900">
                <motion.div 
                    className="text-center max-w-md mx-auto p-8 bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700/50"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                        <FaExclamation className="text-3xl text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Analysis Error</h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <div className="space-y-3">
                        <Link 
                            to="/" 
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-medium inline-block transition-all duration-300 shadow-lg hover:shadow-xl border border-cyan-500/30"
                        >
                            Start New Analysis
                        </Link>
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full border border-gray-600 hover:border-gray-500 text-gray-300 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gray-700/50"
                        >
                            Reload Page
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900">
                <motion.div 
                    className="text-center max-w-md mx-auto p-8 bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700/50"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <h2 className="text-2xl font-bold text-white mb-4">No Analysis Results Found</h2>
                    <p className="text-gray-300 mb-6">Please upload an image for analysis first.</p>
                    <Link to="/" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl border border-cyan-500/30">
                        Go to Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (showDetailedXAI) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <motion.button
                            onClick={() => setShowDetailedXAI(false)}
                            className="flex items-center text-cyan-400 hover:text-cyan-300 font-medium bg-gray-800/50 px-6 py-3 rounded-2xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Summary
                        </motion.button>
                        <h1 className="text-4xl font-black text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Detailed AI Explanation
                        </h1>
                        <div className="w-32"></div>
                    </div>
                    
                    <XAIExplanation 
                        explanations={getExplanations()}
                        diagnosis={analysis.diagnosis}
                    />
                </div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 py-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1, 0], opacity: [0, 0.2, 0] }}
                        transition={{
                            duration: 20,
                            delay: i * 6,
                            repeat: Infinity,
                        }}
                        style={{
                            width: Math.random() * 100 + 50,
                            height: Math.random() * 100 + 50,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-md border border-cyan-500/30 px-3 py-1 rounded-lg mb-3 shadow-lg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full flex items-center justify-center">
                            <FaCheck className="text-white text-xs" />
                        </div>
                        <span className="font-bold text-cyan-300 text-xs">ANALYSIS COMPLETE</span>
                    </motion.div>

                    <h1 className="text-2xl md:text-3xl font-black mb-3 bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
                        Analysis Results
                    </h1>
                    
                    <p className="text-gray-300 text-sm max-w-2xl mx-auto">
                        Comprehensive AI-powered diagnosis with personalized recommendations
                    </p>
                </motion.div>

                {/* Doctor Verification Section */}
                {(user?.role === 'doctor' || user?.role === 'admin') && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700/50 p-4 mb-4"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg border border-cyan-500/30">
                                <FaUserMd className="text-sm text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Medical Verification</h3>
                                <p className="text-gray-300 text-xs">Help improve AI accuracy</p>
                            </div>
                        </div>
                        
                        <AnimatePresence mode="wait">
                            {doctorVerification.isCorrect === null ? (
                                <motion.div
                                    key="initial"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="space-y-3"
                                >
                                    <p className="text-gray-300 text-sm">
                                        Verify the AI diagnosis for quality assurance.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <motion.button
                                            onClick={() => setDoctorVerification(prev => ({ ...prev, isCorrect: true }))}
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-500/30 text-xs"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FaThumbsUp className="text-xs" />
                                            Correct
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setDoctorVerification(prev => ({ ...prev, isCorrect: false }))}
                                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all duration-300 shadow-lg hover:shadow-xl border border-red-500/30 text-xs"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FaThumbsDown className="text-xs" />
                                            Incorrect
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="action"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="space-y-3"
                                >
                                    <div className={`${doctorVerification.isCorrect ? 'bg-green-900/30 border-green-500/30' : 'bg-yellow-900/30 border-yellow-500/30'} border rounded-lg p-3`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 ${doctorVerification.isCorrect ? 'bg-green-900/30' : 'bg-yellow-900/30'} rounded flex items-center justify-center border ${doctorVerification.isCorrect ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
                                                {doctorVerification.isCorrect ? <FaCheck className="text-green-400 text-xs" /> : <FaExclamationTriangle className="text-yellow-400 text-xs" />}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white text-sm">{doctorVerification.isCorrect ? 'Diagnosis Confirmed' : 'Correction Needed'}</h4>
                                                <p className="text-gray-300 text-xs">{doctorVerification.isCorrect ? 'AI diagnosis is correct' : 'Please provide correct diagnosis'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button
                                            onClick={() => handleVerificationSubmit(doctorVerification.isCorrect)}
                                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-2 px-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-cyan-500/30 text-xs flex-1"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Submit
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setDoctorVerification({
                                                isCorrect: null,
                                                correctedDiagnosis: '',
                                                notes: '',
                                                isSubmitting: false
                                            })}
                                            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg font-semibold transition-all duration-300 border border-gray-600 text-xs"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Cancel
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* FIXED: Balanced Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-4"> {/* Changed to 2 equal columns */}
                    {/* Left Column - Diagnosis & Confidence */}
                    <div className="space-y-4">
                        {/* Diagnosis Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700/50 p-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg border border-cyan-500/30">
                                        <FaDiagnoses className="text-lg text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white">AI Diagnosis</h3>
                                        <p className="text-gray-300 text-xs">Neural network analysis</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getCancerStatusColor(getIsCancer())}`}>
                                    {getCancerStatus()}
                                </span>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-white text-sm mb-2">Condition Detected</h4>
                                    <p className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                        {getDiagnosisDisease()}
                                    </p>
                                    <p className="text-gray-300 text-xs mt-1">
                                        {getIsCancer() ? '🛑 Malignant' : '✅ Benign'}
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-white text-sm mb-2">AI Confidence</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-700 rounded-full h-2 shadow-inner">
                                                <motion.div 
                                                    className={`h-2 rounded-full bg-gradient-to-r ${getConfidenceColor(getDiagnosisConfidence())}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${getDiagnosisConfidence()}%` }}
                                                    transition={{ duration: 1.5 }}
                                                />
                                            </div>
                                            <span className="text-lg font-black text-white">
                                                {formatConfidence(getDiagnosisConfidence())}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>Low</span>
                                            <span>High</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* XAI Quick Overview - Made more compact */}
                        {hasXAIExplanations() && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700/50 p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg border border-purple-500/30">
                                            <FaBrain className="text-lg text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white">AI Explanation</h3>
                                            <p className="text-gray-300 text-xs">Understanding the analysis</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        onClick={() => setShowDetailedXAI(true)}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-3 py-1 rounded-lg font-semibold shadow-lg hover:shadow-xl flex items-center gap-1 transition-all duration-300 border border-purple-500/30 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Details
                                        <FaArrowRight className="text-xs" />
                                    </motion.button>
                                </div>

                                <div className="space-y-3">
                                    {getExplanations().visualExplanation && (
                                        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg p-3 border border-blue-500/30">
                                            <h4 className="font-semibold text-cyan-300 text-sm mb-1 flex items-center gap-1">
                                                <FaInfoCircle className="text-xs" />
                                                Analysis Summary
                                            </h4>
                                            <p className="text-cyan-100 text-xs leading-relaxed">
                                                {getExplanations().visualExplanation.length > 100 
                                                    ? `${getExplanations().visualExplanation.substring(0, 100)}...`
                                                    : getExplanations().visualExplanation
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {getExplanations().keyFindings && getExplanations().keyFindings.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-white text-sm mb-2">Key Features</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {getExplanations().keyFindings.slice(0, 4).map((finding, index) => (
                                                    <motion.div 
                                                        key={index}
                                                        className="bg-gradient-to-r from-gray-700/50 to-gray-800/30 rounded-lg p-2 border border-gray-600/50"
                                                        whileHover={{ scale: 1.02 }}
                                                    >
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-semibold text-white text-xs capitalize">
                                                                {finding.finding?.replace(/_/g, ' ').substring(0, 12) || 'Feature'}
                                                            </span>
                                                            <span className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 text-green-300 px-1 rounded text-xs font-bold border border-green-500/30">
                                                                {Math.round((finding.confidence || 0) * 100)}%
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Actions & Recommendations */}
                    <div className="space-y-4">
                        {/* Treatment Suggestions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700/50 p-4"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg border border-orange-500/30">
                                    <FaMedkit className="text-lg text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white">Recommended Actions</h3>
                                    <p className="text-gray-300 text-xs">Personalized next steps</p>
                                </div>
                            </div>
                            
                            {loadingTreatment ? (
                                <div className="flex flex-col items-center justify-center py-4">
                                    <motion.div
                                        className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full mb-2"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span className="text-gray-300 text-xs">Loading recommendations...</span>
                                </div>
                            ) : treatmentSuggestions ? (
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-white text-sm">Urgency Level</h4>
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${getUrgencyColor(treatmentSuggestions.treatmentSuggestions?.urgency)}`}>
                                                {treatmentSuggestions.treatmentSuggestions?.urgency?.replace('_', ' ') || getUrgency()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-1">
                                            <FaHeartbeat className="text-red-400 text-xs" />
                                            Medical Recommendations
                                        </h4>
                                        <ul className="space-y-2">
                                            {(treatmentSuggestions.treatmentSuggestions?.recommendations || [
                                                'Consult dermatologist',
                                                getIsCancer() ? 'Biopsy recommended' : 'Regular monitoring'
                                            ]).map((rec, index) => (
                                                <li key={index} className="flex items-start text-gray-300 text-xs">
                                                    <FaCheckCircle className="text-green-400 mr-2 mt-0.5 flex-shrink-0 text-xs" />
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-1">
                                            <FaCalendarCheck className="text-cyan-400 text-xs" />
                                            Next Steps
                                        </h4>
                                        <ul className="space-y-1">
                                            {(treatmentSuggestions.treatmentSuggestions?.nextSteps || [
                                                'Schedule specialist appointment',
                                                'Document characteristics',
                                                getIsCancer() ? 'Immediate evaluation' : 'Follow up in 3 months'
                                            ]).map((step, index) => (
                                                <li key={index} className="text-gray-300 text-xs flex items-start">
                                                    <span className="text-cyan-400 mr-2">•</span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-400">
                                    <FaClipboardList className="text-2xl text-gray-500 mx-auto mb-2" />
                                    <p className="text-xs">Generating recommendations...</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700/50 p-4"
                        >
                            <h4 className="text-base font-black text-white mb-3">Take Action</h4>
                            <div className="space-y-2">
                                <Link
                                    to="/dermatologists"
                                    aria-label="Find nearby dermatologists"
                                    className="w-full"
                                >
                                    <motion.div 
                                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl border border-cyan-500/30 text-xs"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <FaUserMd className="text-sm" /> 
                                        Find Dermatologists
                                    </motion.div>
                                </Link>
                                
                                <Link
                                    to="/dermatologists"
                                    aria-label="See nearby clinics"
                                    className="w-full"
                                >
                                    <motion.div 
                                        className="w-full border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 text-xs"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <FaMapMarkerAlt className="text-sm" /> 
                                        Nearby Clinics
                                    </motion.div>
                                </Link>
                                
                                <motion.button 
                                    className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 text-xs"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleExportReport('pdf')}
                                    aria-label="Save report as PDF"
                                >
                                    <FaFilePdf className="text-sm" /> 
                                    Save Report
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Export & Share */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700/50 p-4"
                        >
                            <h4 className="text-base font-black text-white mb-3">Export & Share</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <motion.button 
                                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-2 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all duration-300 shadow-lg hover:shadow-xl border border-cyan-500/30 text-xs"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaDownload className="text-xs" /> 
                                    PDF
                                </motion.button>
                                
                                <motion.button 
                                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-2 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all duration-300 shadow-lg hover:shadow-xl border border-purple-500/30 text-xs"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaShare className="text-xs" /> 
                                    Share
                                </motion.button>
                                
                                <motion.button 
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-500/30 text-xs"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaBookmark className="text-xs" /> 
                                    Save
                                </motion.button>
                                
                                <motion.button 
                                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all duration-300 shadow-lg hover:shadow-xl border border-orange-500/30 text-xs"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaFilePdf className="text-xs" /> 
                                    Print
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Analysis Pipeline - Now placed below both columns */}
                {analysisSteps.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700/50 p-4"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg border border-emerald-500/30">
                                <FaLayerGroup className="text-lg text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">Analysis Steps</h3>
                                <p className="text-gray-300 text-xs">AI processing pipeline</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {analysisSteps.map((step, index) => (
                                <motion.div 
                                    key={index}
                                    className="bg-gradient-to-r from-gray-700/50 to-blue-900/30 rounded-lg p-3 border border-gray-600/50"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded flex items-center justify-center font-bold text-xs shadow-lg border border-cyan-500/30">
                                                {step.step}
                                            </div>
                                            <h4 className="font-semibold text-white text-sm">{step.description}</h4>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            (step.confidence || 0) > 80 ? 'bg-green-900/30 text-green-300 border border-green-500/30' :
                                            (step.confidence || 0) > 60 ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30' :
                                            'bg-red-900/30 text-red-300 border border-red-500/30'
                                        }`}>
                                            {(step.confidence || 0)}%
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-xs">{step.result}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default Results;