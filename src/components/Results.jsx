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
    FaTimesCircle,
    FaArrowLeft, // Used FaArrowLeft instead of FaArrowRight for better visual context
    FaStethoscope,
    FaShieldAlt,
    FaInfoCircle,
    FaCheckCircle,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// KEEP THIS ONE: Import the correct XAIExplanation component
import XAIExplanation from './XAIExplanation';

const Results = ({ analysis, user, onVerificationSubmit }) => {
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
    // State to toggle the full XAI view
    const [showDetailedXAI, setShowDetailedXAI] = useState(false); 

    // Validation and Data Fetching Logic (Kept as provided - it is excellent)
    // ... (All validateAnalysisData and useEffect logic remains the same)

    const validateAnalysisData = (analysisData) => {
        if (!analysisData) {
            return { isValid: false, error: 'No analysis data provided' };
        }

        const { diagnosis } = analysisData;
        
        if (!diagnosis || (!diagnosis.disease && !diagnosis.classCode)) {
            return { isValid: false, error: 'Disease information is missing' };
        }

        if (typeof diagnosis.confidence !== 'number') {
            // Allow 0 confidence but check type
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
            
            // Note: Ensure analysisPipeline is in your backend response for this to work
            setAnalysisSteps(analysis.analysisPipeline || []);
            fetchTreatmentSuggestions();
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
            // Fallback default treatment suggestions if API fails
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
    
    // ... (All handleVerificationSubmit logic remains the same) ...
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
            
            alert('Verification submitted successfully!');
            
            // Reset form
            setDoctorVerification({
                isCorrect: null,
                correctedDiagnosis: '',
                notes: '',
                isSubmitting: false
            });

            // Notify parent component
            if (onVerificationSubmit) {
                onVerificationSubmit(verificationData);
            }

        } catch (error) {
            console.error('Error submitting verification:', error);
            alert('Failed to submit verification. Please try again.');
        } finally {
            setDoctorVerification(prev => ({ ...prev, isSubmitting: false }));
        }
    };


    // Utility Functions (Kept as provided - they are clean and robust)
    const getUrgencyColor = (urgency) => {
        if (!urgency) return 'bg-gray-100 text-gray-800 border-gray-300';
        
        switch (urgency?.toUpperCase()) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
            case 'MEDIUM_HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'LOW_MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
            case 'MONITOR': return 'bg-gray-100 text-gray-800 border-gray-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getCancerStatusColor = (isCancer) => {
        return isCancer ? 
            'bg-red-100 text-red-800 border-red-300' : 
            'bg-green-100 text-green-800 border-green-300';
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

    const getDiagnosisDisease = () => { return analysis?.diagnosis?.disease || analysis?.diagnosis?.classCode || 'Unknown Diagnosis'; };
    const getDiagnosisConfidence = () => { return analysis?.diagnosis?.confidence || 0; };
    const getIsCancer = () => { return analysis?.diagnosis?.isCancer || false; };
    const getCancerStatus = () => { return analysis?.diagnosis?.cancerStatus || (getIsCancer() ? 'CANCEROUS' : 'NON-CANCEROUS'); };
    const getUrgency = () => { return analysis?.diagnosis?.urgency || (getIsCancer() ? 'HIGH' : 'LOW'); };
    const getAlternativeDiagnoses = () => { return analysis?.alternativeDiagnoses || []; };
    const getExplanations = () => { return analysis?.explanations || {}; };
    const hasXAIExplanations = () => {
        const explanations = getExplanations();
        return explanations && Object.keys(explanations).length > 0;
    };
    // End of Utility Functions

    // --- Error and Loading States (Kept clean and clear) ---

    if (error) {
        // ... (Error return JSX remains the same) ...
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaExclamation className="text-2xl text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-y-3">
                        <Link 
                            to="/" 
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium inline-block"
                        >
                            Start New Analysis
                        </Link>
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!analysis) {
        // ... (No analysis return JSX remains the same) ...
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Analysis Results Found</h2>
                    <p className="text-gray-600 mb-6">Please upload an image for analysis first.</p>
                    <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    // --- Detailed XAI View (Uses the dedicated component) ---
    if (showDetailedXAI) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <button
                            onClick={() => setShowDetailedXAI(false)}
                            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <FaArrowLeft className="mr-2" /> {/* Used FaArrowLeft here */}
                            Back to Summary
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Detailed AI Explanation</h1>
                        <div className="w-32"></div> {/* Spacer for balance */}
                    </div>
                    
                    <XAIExplanation 
                        explanations={getExplanations()}
                        diagnosis={analysis.diagnosis}
                    />
                </div>
            </div>
        );
    }

    // --- Main Results Summary View ---
    return (
        <section className="py-16 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">AI Analysis Summary</h1>
                    <p className="text-gray-600">Complete analysis with explainable AI insights</p>
                </motion.div>

                {/* Doctor Verification Section */}
                {(user?.role === 'doctor' || user?.role === 'admin') && (
                    // ... (Doctor Verification JSX remains the same) ...
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-4 border-blue-500"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaUserMd className="mr-2 text-blue-600" />
                            Doctor Verification
                        </h3>
                        
                        {doctorVerification.isCorrect === null ? (
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    Please verify the AI diagnosis for quality assurance and model improvement.
                                </p>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setDoctorVerification(prev => ({ ...prev, isCorrect: true }))}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center transition"
                                        disabled={doctorVerification.isSubmitting}
                                    >
                                        <FaCheck className="mr-2" />
                                        Diagnosis Correct
                                    </button>
                                    <button
                                        onClick={() => setDoctorVerification(prev => ({ ...prev, isCorrect: false }))}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center transition"
                                        disabled={doctorVerification.isSubmitting}
                                    >
                                        <FaTimesCircle className="mr-2" />
                                        Needs Correction
                                    </button>
                                </div>
                            </div>
                        ) : doctorVerification.isCorrect ? (
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-800 font-medium">
                                        You confirmed the AI diagnosis is correct.
                                    </p>
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleVerificationSubmit(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium"
                                        disabled={doctorVerification.isSubmitting}
                                    >
                                        {doctorVerification.isSubmitting ? 'Submitting...' : 'Submit Verification'}
                                    </button>
                                    <button
                                        onClick={() => setDoctorVerification({
                                            isCorrect: null,
                                            correctedDiagnosis: '',
                                            notes: '',
                                            isSubmitting: false
                                        })}
                                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800 font-medium">
                                        Please provide the correct diagnosis:
                                    </p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Correct Diagnosis
                                        </label>
                                        <select
                                            value={doctorVerification.correctedDiagnosis}
                                            onChange={(e) => setDoctorVerification(prev => ({
                                                ...prev,
                                                correctedDiagnosis: e.target.value
                                            }))}
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
                                            value={doctorVerification.notes}
                                            onChange={(e) => setDoctorVerification(prev => ({
                                                ...prev,
                                                notes: e.target.value
                                            }))}
                                            rows="3"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Additional comments about the correction..."
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleVerificationSubmit(false)}
                                        disabled={!doctorVerification.correctedDiagnosis || doctorVerification.isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-lg font-medium"
                                    >
                                        {doctorVerification.isSubmitting ? 'Submitting...' : 'Submit Correction'}
                                    </button>
                                    <button
                                        onClick={() => setDoctorVerification({
                                            isCorrect: null,
                                            correctedDiagnosis: '',
                                            notes: '',
                                            isSubmitting: false
                                        })}
                                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Analysis Pipeline Section */}
                {analysisSteps.length > 0 && (
                    // ... (Analysis Pipeline JSX remains the same) ...
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaLayerGroup className="mr-2 text-blue-600" />
                            AI Analysis Pipeline
                        </h3>
                        <div className="space-y-4">
                            {analysisSteps.map((step, index) => (
                                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                        {step.step}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{step.description}</h4>
                                                <p className="text-gray-600 text-sm">{step.model}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    (step.confidence || 0) > 80 ? 'bg-green-100 text-green-800' :
                                                    (step.confidence || 0) > 60 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {(step.confidence || 0)}% confidence
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 mt-2">{step.result}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Diagnosis & XAI */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Diagnosis Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">AI Diagnosis</h3>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCancerStatusColor(getIsCancer())}`}>
                                        {getCancerStatus()}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                    <FaDiagnoses className="text-2xl text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-xl text-gray-800">{getDiagnosisDisease()}</h4>
                                    <p className="text-gray-500">
                                        {getIsCancer() ? 'Cancer Subtype' : 'Benign Condition'} • 
                                        AI Confidence: {getDiagnosisConfidence()}%
                                    </p>
                                </div>
                            </div>
                            
                            {/* Confidence Visualization */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-600 mb-2">Classification Confidence</p>
                                    <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                                        <div 
                                            className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                                            style={{ width: `${getDiagnosisConfidence()}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>0%</span>
                                        <span className="font-semibold">{getDiagnosisConfidence()}% confidence</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                                
                                {analysis.diagnosis?.binaryConfidence && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-gray-600 mb-2">Cancer Detection Confidence</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div 
                                                className={`h-2 rounded-full ${
                                                    analysis.diagnosis.binaryConfidence > 70 ? 'bg-green-500' : 
                                                    analysis.diagnosis.binaryConfidence > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${analysis.diagnosis.binaryConfidence}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-right text-sm text-gray-500">
                                            {analysis.diagnosis.binaryConfidence}% sure it's {getIsCancer() ? 'cancer' : 'non-cancer'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* XAI Quick Overview Section */}
                        {hasXAIExplanations() && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-purple-500"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                        <FaBrain className="mr-2 text-purple-600" />
                                        AI Explanation Overview
                                    </h3>
                                    <button
                                        onClick={() => setShowDetailedXAI(true)}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition"
                                    >
                                        <FaStethoscope className="mr-2" />
                                        View Detailed Analysis
                                        <FaArrowRight className="ml-2" />
                                    </button>
                                </div>

                                {/* Quick XAI Summary */}
                                <div className="space-y-4">
                                    {/* Visual Explanation Summary */}
                                    {getExplanations().visualExplanation && (
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                                                <FaInfoCircle className="mr-2" />
                                                AI Analysis Summary
                                            </h4>
                                            <p className="text-blue-700 leading-relaxed">
                                                {getExplanations().visualExplanation.length > 200 
                                                    ? `${getExplanations().visualExplanation.substring(0, 200)}...`
                                                    : getExplanations().visualExplanation
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {/* Safety Information */}
                                    {getExplanations().safetyInformation && (
                                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                                                <FaShieldAlt className="mr-2" />
                                                Safety Priority
                                            </h4>
                                            <p className="text-yellow-700 leading-relaxed">
                                                {getExplanations().safetyInformation}
                                            </p>
                                        </div>
                                    )}

                                    {/* Key Findings Preview */}
                                    {getExplanations().keyFindings && getExplanations().keyFindings.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">Key Detected Features</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {getExplanations().keyFindings.slice(0, 4).map((finding, index) => (
                                                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-medium text-gray-800 text-sm capitalize">
                                                                {finding.finding?.replace(/_/g, ' ') || 'Feature'}
                                                            </span>
                                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                                {Math.round((finding.confidence || 0) * 100)}%
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 text-xs">
                                                            {finding.description?.length > 80 
                                                                ? `${finding.description.substring(0, 80)}...`
                                                                : finding.description
                                                            }
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            {getExplanations().keyFindings.length > 4 && (
                                                <p className="text-center text-gray-500 text-sm mt-3">
                                                    + {getExplanations().keyFindings.length - 4} more features in detailed view
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Confidence Breakdown Preview */}
                                    {getExplanations().confidenceBreakdown && (
                                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                            <h4 className="font-semibold text-green-800 mb-3">Confidence Analysis</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-green-700">Overall Confidence</span>
                                                    <span className="font-bold text-green-800">
                                                        {getExplanations().confidenceBreakdown.modelConfidence?.toFixed(1) || getDiagnosisConfidence().toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-green-600">Feature Consistency</span>
                                                    <span className="text-green-700">
                                                        {((getExplanations().confidenceBreakdown.featureConsistency || 0) * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-green-600">Clinical Correlation</span>
                                                    <span className="text-green-700">
                                                        {((getExplanations().confidenceBreakdown.clinicalCorrelation || 0) * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Call to Action for Detailed View */}
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={() => setShowDetailedXAI(true)}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center mx-auto transition shadow-lg"
                                    >
                                        <FaBrain className="mr-2" />
                                        Explore Complete AI Explanation
                                        <FaArrowRight className="ml-2" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Actions & Recommendations */}
                    <div className="space-y-8">
                        {/* Dynamic Treatment Suggestions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Recommended Actions</h3>
                            
                            {loadingTreatment ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    <span className="text-gray-600">Loading recommendations...</span>
                                </div>
                            ) : treatmentSuggestions ? (
                                <>
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-800">Urgency Level</h4>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(treatmentSuggestions.treatmentSuggestions?.urgency)}`}>
                                                {treatmentSuggestions.treatmentSuggestions?.urgency?.replace('_', ' ') || getUrgency()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-gray-800 mb-3">Recommendations:</h4>
                                        <ul className="space-y-2">
                                            {(treatmentSuggestions.treatmentSuggestions?.recommendations || [
                                                'Consult dermatologist for professional evaluation',
                                                getIsCancer() ? 'Biopsy recommended for confirmation' : 'Regular monitoring advised'
                                            ]).map((rec, index) => (
                                                <li key={index} className="flex items-start text-gray-700">
                                                    <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                                                    <span className="leading-relaxed">{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {(treatmentSuggestions.treatmentSuggestions?.monitoringAdvice?.length > 0 || 
                                      treatmentSuggestions.treatmentSuggestions?.nextSteps?.length > 0) && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-800 mb-2">
                                                {treatmentSuggestions.treatmentSuggestions.monitoringAdvice ? 'Monitoring Advice' : 'Next Steps'}
                                            </h4>
                                            <ul className="space-y-1">
                                                {(treatmentSuggestions.treatmentSuggestions.monitoringAdvice || 
                                                  treatmentSuggestions.treatmentSuggestions.nextSteps || [
                                                    'Schedule appointment with specialist',
                                                    'Document lesion characteristics',
                                                    getIsCancer() ? 'Immediate evaluation needed' : 'Follow up in 3 months'
                                                ]).map((advice, index) => (
                                                    <li key={index} className="flex items-start text-gray-600 text-sm">
                                                        <span className="text-blue-500 mr-2 mt-1">•</span>
                                                        <span>{advice}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <p>Treatment recommendations will be generated based on AI analysis</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Take Action</h4>
                            <div className="space-y-3">
                                <Link
                                    to="/dermatologists"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition"
                                >
                                    <FaUserMd className="mr-2" /> Find Dermatologists
                                </Link>
                                <button className="w-full border border-green-600 text-green-600 hover:bg-green-50 py-3 px-4 rounded-lg font-medium flex items-center justify-center transition">
                                    <FaMapMarkerAlt className="mr-2" /> Nearby Clinics
                                </button>
                                <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium flex items-center justify-center transition">
                                    <FaFilePdf className="mr-2" /> Save Full Report
                                </button>
                            </div>
                            
                            {/* Alternative Diagnoses */}
                            {getAlternativeDiagnoses().length > 0 && (
                                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <h5 className="font-semibold text-yellow-800 mb-2">Alternative Possibilities</h5>
                                    <div className="space-y-2">
                                        {getAlternativeDiagnoses().slice(0, 3).map((alt, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span className="text-yellow-700 text-sm">{alt.disease}</span>
                                                <span className="text-yellow-600 text-sm font-medium">{alt.confidence}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Results;