import React, { useState, useEffect, useRef } from 'react';
import { FaExclamationTriangle, FaStethoscope, FaUserMd, FaShieldAlt, FaCheckCircle, FaTimes, FaAngleDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Disclaimer = () => {
    // State to control modal visibility
    const [isVisible, setIsVisible] = useState(false);
    const [showDetailed, setShowDetailed] = useState(false);
    const modalRef = useRef(null);

    // 1. Initial Check: Determine if the modal should show on first load
    useEffect(() => {
        const hasAcknowledged = localStorage.getItem('dermaScanDisclaimerAcknowledged');
        // Show the modal if the user has NOT acknowledged it yet
        if (!hasAcknowledged) {
            setIsVisible(true);
        }
    }, []);

    // 2. Accessibility: Trap focus when modal is visible
    useEffect(() => {
        if (isVisible && modalRef.current) {
            // Optional: Set focus to the main container or the "Acknowledge" button
            modalRef.current.focus(); 
            // In a real app, use a dedicated focus-trap library here
        }
    }, [isVisible]);

    const handleAcknowledge = () => {
        setIsVisible(false);
        localStorage.setItem('dermaScanDisclaimerAcknowledged', 'true');
    };

    // --- Data Definitions (Optimized for readability) ---

    const disclaimerPoints = [
        { icon: <FaStethoscope className="text-blue-600" />, title: "AI-Assisted Tool Only", description: "This platform provides AI-powered analysis for informational purposes and is not a replacement for professional medical diagnosis." },
        { icon: <FaUserMd className="text-green-600" />, title: "Consult Healthcare Professionals", description: "Always seek advice from qualified dermatologists or healthcare providers for medical concerns and treatment decisions." },
        { icon: <FaShieldAlt className="text-purple-600" />, title: "Privacy & Data Security", description: "Your data is encrypted and processed securely. We never share personal health information without consent." }
    ];

    const legalSections = [
        { title: "Medical Disclaimer", content: "DermaScan AI is designed for educational and informational purposes only. The analysis provided should not be considered medical advice, diagnosis, or treatment recommendations." },
        { title: "Limitations of AI", content: "Artificial intelligence models have inherent limitations and may not account for all individual factors, medical history, or rare conditions that a healthcare professional would consider." },
        { title: "Emergency Situations", content: "For medical emergencies, sudden changes in skin conditions, or serious symptoms, seek immediate medical attention from qualified healthcare providers." },
        { title: "Accuracy Disclaimer", content: "While we strive for accuracy, the AI analysis may not be 100% precise. Always verify results with healthcare professionals for critical medical decisions." }
    ];

    // --- Render Logic ---

    // Floating button that appears after the user closes the modal
    if (!isVisible && localStorage.getItem('dermaScanDisclaimerAcknowledged')) {
        return (
            <motion.button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 z-50 bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Show Medical Disclaimer"
            >
                <FaExclamationTriangle className="text-xl" />
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
                    // Add role="dialog" and aria-modal="true" for accessibility
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="disclaimer-title"
                >
                    <motion.div
                        ref={modalRef}
                        tabIndex="-1" // Make the container focusable
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-amber-300"
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 250, damping: 25 }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white border-b-4 border-amber-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                                        <FaExclamationTriangle className="text-2xl" />
                                    </div>
                                    <div>
                                        <h2 id="disclaimer-title" className="text-2xl font-extrabold">
                                            Critical Safety Notice
                                        </h2>
                                        <p className="text-amber-100 text-sm mt-1">
                                            Your health and data security are paramount.
                                        </p>
                                    </div>
                                </div>
                                {/* Close button for non-acknowledgement exit */}
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="text-white hover:text-amber-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white"
                                    aria-label="Close disclaimer"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area - Scrollable */}
                        <div className="overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="p-8">
                                {/* Quick Points */}
                                <div className="grid md:grid-cols-3 gap-6 mb-8">
                                    {disclaimerPoints.map((point, index) => (
                                        <motion.div
                                            key={index}
                                            className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-center transition-shadow duration-300"
                                            whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <div className="text-4xl mb-3 flex justify-center">
                                                {point.icon}
                                            </div>
                                            <h4 className="font-bold text-lg text-gray-800 mb-2">{point.title}</h4>
                                            <p className="text-gray-600 text-sm leading-snug">{point.description}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Main Warning Block (Enhanced Visibility) */}
                                <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6 mb-8 shadow-inner">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 mt-1">
                                            <FaExclamationTriangle className="text-amber-600 text-3xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-extrabold text-amber-900 mb-2">
                                                STOP: Not a Diagnostic Tool
                                            </h3>
                                            <p className="text-amber-800 leading-relaxed text-base">
                                                <strong>DermaScan AI provides informational analysis only and is <span className="underline font-bold">not a substitute for professional medical advice, diagnosis, or treatment.</span></strong> Always consult a qualified dermatologist.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Detailed Disclaimer */}
                                <div className="border border-gray-300 rounded-xl">
                                    <button
                                        onClick={() => setShowDetailed(!showDetailed)}
                                        className="w-full p-4 bg-gray-100 hover:bg-gray-200 transition-colors text-left flex justify-between items-center font-bold text-gray-800 border-b border-gray-300"
                                        aria-expanded={showDetailed}
                                        aria-controls="legal-content"
                                    >
                                        <span>📋 View Complete Legal Disclaimer</span>
                                        <motion.span
                                            animate={{ rotate: showDetailed ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <FaAngleDown className="text-lg" />
                                        </motion.span>
                                    </button>

                                    <AnimatePresence>
                                        {showDetailed && (
                                            <motion.div
                                                id="legal-content"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-6 bg-white space-y-5">
                                                    {legalSections.map((section, index) => (
                                                        <div key={index}>
                                                            <h5 className="font-extrabold text-gray-900 mb-2 border-b-2 border-blue-100 pb-1">{section.title}</h5>
                                                            <p className="text-gray-700 text-sm leading-relaxed">{section.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-gray-200 p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-2 text-gray-700 font-medium text-sm">
                                <FaCheckCircle className="text-blue-500 text-lg" />
                                <span>Your safety and privacy are protected.</span>
                            </div>

                            <div className="flex space-x-3 w-full sm:w-auto">
                                {/* Button 1: I Understand (Dismisses only) */}
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold w-1/2 sm:w-auto focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    I Understand
                                </button>

                                {/* Button 2: Don't Show Again (Sets localStorage) */}
                                <motion.button
                                    onClick={handleAcknowledge}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 w-1/2 sm:w-auto"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FaCheckCircle className="text-lg" />
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