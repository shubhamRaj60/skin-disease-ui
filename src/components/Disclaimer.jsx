import React, { useState, useEffect, useRef } from 'react';
import { 
  FaExclamationTriangle, 
  FaStethoscope, 
  FaUserMd, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaTimes, 
  FaAngleDown,
  FaHeartbeat,
  FaLock,
  FaUserShield,
  FaClipboardCheck
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Disclaimer = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetailed, setShowDetailed] = useState(false);
    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const modalRef = useRef(null);

    // Enhanced initialization with better state management
    useEffect(() => {
        const hasAcknowledged = localStorage.getItem('dermaScanDisclaimerAcknowledged');
        const acknowledgementTime = localStorage.getItem('dermaScanDisclaimerTimestamp');
        
        // Show modal if never acknowledged or if it's been more than 30 days
        if (!hasAcknowledged || shouldShowAgain(acknowledgementTime)) {
            setIsVisible(true);
        }
        setIsAcknowledged(!!hasAcknowledged);
    }, []);

    // Helper function to determine if disclaimer should show again
    const shouldShowAgain = (timestamp) => {
        if (!timestamp) return true;
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        return Date.now() - parseInt(timestamp) > thirtyDays;
    };

    const handleAcknowledge = () => {
        setIsVisible(false);
        setIsAcknowledged(true);
        localStorage.setItem('dermaScanDisclaimerAcknowledged', 'true');
        localStorage.setItem('dermaScanDisclaimerTimestamp', Date.now().toString());
    };

    const handleTemporaryClose = () => {
        setIsVisible(false);
        // Don't set localStorage, so it shows again on next visit
    };

    // Enhanced data definitions with better categorization
    const safetyFeatures = [
        { 
            icon: <FaStethoscope className="text-blue-500" />, 
            title: "AI-Assisted Tool Only", 
            description: "This platform provides AI-powered analysis for informational purposes and is not a replacement for professional medical diagnosis.",
            gradient: "from-blue-50 to-blue-100"
        },
        { 
            icon: <FaUserMd className="text-green-500" />, 
            title: "Consult Healthcare Professionals", 
            description: "Always seek advice from qualified dermatologists or healthcare providers for medical concerns and treatment decisions.",
            gradient: "from-green-50 to-green-100"
        },
        { 
            icon: <FaShieldAlt className="text-purple-500" />, 
            title: "Privacy & Data Security", 
            description: "Your data is encrypted and processed securely. We never share personal health information without consent.",
            gradient: "from-purple-50 to-purple-100"
        }
    ];

    const legalSections = [
        { 
            title: "Medical Disclaimer", 
            content: "DermaScan AI is designed for educational and informational purposes only. The analysis provided should not be considered medical advice, diagnosis, or treatment recommendations.",
            icon: FaHeartbeat
        },
        { 
            title: "Limitations of AI", 
            content: "Artificial intelligence models have inherent limitations and may not account for all individual factors, medical history, or rare conditions that a healthcare professional would consider.",
            icon: FaClipboardCheck
        },
        { 
            title: "Emergency Situations", 
            content: "For medical emergencies, sudden changes in skin conditions, or serious symptoms, seek immediate medical attention from qualified healthcare providers.",
            icon: FaExclamationTriangle
        },
        { 
            title: "Data Privacy", 
            content: "We adhere to strict data protection standards. Your images and analysis results are encrypted and stored securely in compliance with healthcare privacy regulations.",
            icon: FaUserShield
        },
        { 
            title: "Accuracy Disclaimer", 
            content: "While we strive for accuracy, the AI analysis may not be 100% precise. Always verify results with healthcare professionals for critical medical decisions.",
            icon: FaLock
        }
    ];

    // Animation variants
    const containerVariants = {
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
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    // Floating button that appears after the user closes the modal
    if (!isVisible && isAcknowledged) {
        return (
            <motion.button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-4 rounded-2xl shadow-2xl transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-amber-300 focus:ring-opacity-50"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                title="Show Medical Disclaimer"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
                <div className="relative">
                    <FaExclamationTriangle className="text-xl" />
                    <motion.div 
                        className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
                <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
                    Safety Information
                    <div className="absolute top-full right-4 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
            </motion.button>
        );
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.section
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 font-sans"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="disclaimer-title"
                >
                    <motion.div
                        ref={modalRef}
                        tabIndex={-1}
                        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-amber-200"
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Enhanced Header */}
                        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
                            
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center space-x-4">
                                    <motion.div 
                                        className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm border border-white border-opacity-30"
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <FaExclamationTriangle className="text-2xl" />
                                    </motion.div>
                                    <div>
                                        <motion.h2 
                                            id="disclaimer-title" 
                                            className="text-3xl font-black mb-2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            Critical Safety Notice
                                        </motion.h2>
                                        <motion.p 
                                            className="text-amber-100 text-lg font-medium"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            Your health and data security are our top priority
                                        </motion.p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={handleTemporaryClose}
                                    className="text-white hover:text-amber-200 transition-all duration-300 p-3 rounded-2xl hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm"
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Close disclaimer"
                                >
                                    <FaTimes className="text-xl" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Main Content Area - Scrollable */}
                        <div className="overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="p-8">
                                {/* Enhanced Safety Features Grid */}
                                <motion.div 
                                    className="grid md:grid-cols-3 gap-6 mb-8"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {safetyFeatures.map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            variants={itemVariants}
                                            className={`bg-gradient-to-br ${feature.gradient} rounded-2xl p-6 border border-opacity-30 transition-all duration-300 group hover:shadow-xl hover:scale-105`}
                                            whileHover={{ y: -5 }}
                                        >
                                            <div className="text-4xl mb-4 flex justify-center">
                                                <div className="p-3 bg-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    {feature.icon}
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-lg text-gray-800 mb-3 text-center">{feature.title}</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed text-center">{feature.description}</p>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Enhanced Main Warning Block */}
                                <motion.div 
                                    className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-2xl p-8 mb-8 shadow-inner relative overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-start space-x-6">
                                            <motion.div 
                                                className="flex-shrink-0 mt-1"
                                                animate={{ rotate: [0, -5, 5, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <div className="bg-amber-500 p-4 rounded-2xl shadow-lg">
                                                    <FaExclamationTriangle className="text-white text-2xl" />
                                                </div>
                                            </motion.div>
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-black text-amber-900 mb-4">
                                                    🚨 IMPORTANT: Not a Diagnostic Tool
                                                </h3>
                                                <p className="text-amber-800 leading-relaxed text-lg font-medium">
                                                    <strong>DermaScan AI provides informational analysis only and is <span className="underline font-black">not a substitute for professional medical advice, diagnosis, or treatment.</span></strong> Always consult a qualified dermatologist for medical concerns.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Enhanced Expandable Legal Disclaimer */}
                                <motion.div 
                                    className="border border-gray-300 rounded-2xl overflow-hidden shadow-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <motion.button
                                        onClick={() => setShowDetailed(!showDetailed)}
                                        className="w-full p-6 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 text-left flex justify-between items-center font-bold text-gray-800 border-b border-gray-300 group"
                                        aria-expanded={showDetailed}
                                        aria-controls="legal-content"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-blue-500 p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                                                <FaClipboardCheck className="text-lg" />
                                            </div>
                                            <span className="text-xl">📋 Complete Legal Disclaimer & Terms</span>
                                        </div>
                                        <motion.span
                                            animate={{ rotate: showDetailed ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-gray-600 group-hover:text-gray-800"
                                        >
                                            <FaAngleDown className="text-xl" />
                                        </motion.span>
                                    </motion.button>

                                    <AnimatePresence>
                                        {showDetailed && (
                                            <motion.div
                                                id="legal-content"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-6 bg-white space-y-6">
                                                    {legalSections.map((section, index) => {
                                                        const IconComponent = section.icon;
                                                        return (
                                                            <motion.div 
                                                                key={index}
                                                                className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300"
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                            >
                                                                <div className="flex-shrink-0 mt-1">
                                                                    <div className="bg-blue-100 p-3 rounded-lg">
                                                                        <IconComponent className="text-blue-600 text-lg" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h5 className="font-extrabold text-gray-900 mb-3 text-lg border-b-2 border-blue-200 pb-2">{section.title}</h5>
                                                                    <p className="text-gray-700 leading-relaxed">{section.content}</p>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        </div>

                        {/* Enhanced Footer Actions */}
                        <div className="border-t border-gray-200 p-8 bg-gradient-to-r from-gray-50 to-gray-100 flex flex-col sm:flex-row items-center justify-between space-y-6 sm:space-y-0">
                            <motion.div 
                                className="flex items-center space-x-3 text-gray-700 font-semibold text-lg"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="bg-green-500 p-3 rounded-2xl text-white shadow-lg">
                                    <FaCheckCircle className="text-xl" />
                                </div>
                                <span>Your safety and privacy are protected</span>
                            </motion.div>

                            <div className="flex space-x-4 w-full sm:w-auto">
                                {/* Temporary Close Button */}
                                <motion.button
                                    onClick={handleTemporaryClose}
                                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 w-full sm:w-auto focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-30"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <span>I Understand</span>
                                </motion.button>

                                {/* Acknowledge & Continue Button */}
                                <motion.button
                                    onClick={handleAcknowledge}
                                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl transition-all duration-300 font-bold shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3 w-full sm:w-auto focus:outline-none focus:ring-4 focus:ring-amber-300 focus:ring-opacity-50"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <FaCheckCircle className="text-xl" />
                                    <span>Acknowledge & Continue</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.section>
            )}
        </AnimatePresence>
    );
};

export default Disclaimer;