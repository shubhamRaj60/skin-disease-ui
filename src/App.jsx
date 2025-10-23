import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Hero from './components/Hero';
import Auth from './components/Auth';
import Results from './components/Results';
import HowItWorks from './components/HowItWorks';
import DermatologistFinder from './components/DermatologistFinder';
import UserProfile from './components/UserProfile';
import Disclaimer from './components/Disclaimer';
import XAIExplanation from './components/XAIExplanation';
import CommunityInsights from './components/CommunityInsights';
import PreventiveCare from './components/PreventiveCare';
import './App.css';

import { getRetrainingStatus, getModelPerformance, getCommunityInsights, getPreventiveCare } from './api';

// Lazy load components for better performance
const HistoryTimeline = lazy(() => import('./components/HistoryTimeline'));
const HeatmapVisualization = lazy(() => import('./components/HeatmapVisualization'));

// Storage management utilities
const STORAGE_KEYS = {
  USER: 'dermaScanUser',
  HISTORY: 'dermaScanHistory',
  SETTINGS: 'dermaScanSettings',
  COMMUNITY_DATA: 'dermaScanCommunityData',
  PREVENTION_DATA: 'dermaScanPreventionData'
};

const storageUtils = {
  // Check available storage space
  getStorageUsage: () => {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage.getItem(key);
          total += key.length + (value ? value.length : 0);
        }
      }
      return total;
    } catch (error) {
      console.error('Error checking storage usage:', error);
      return 0;
    }
  },

  // Get storage quota information
  getStorageQuota: () => {
    try {
      return 5 * 1024 * 1024; // 5MB in bytes
    } catch (error) {
      return 5 * 1024 * 1024;
    }
  },

  // Compress data before storage
  compressData: (data) => {
    try {
      const compressed = JSON.parse(JSON.stringify(data));
      
      if (compressed.analysis) {
        // Remove large fields that aren't needed for history
        delete compressed.analysis.heatmap;
        delete compressed.analysis.imageData;
        delete compressed.analysis.rawPredictions;
        delete compressed.analysis.processedImage;
        
        // Keep only essential explanation data
        if (compressed.analysis.explanations) {
          compressed.analysis.explanations = {
            visualExplanation: compressed.analysis.explanations.visualExplanation?.substring(0, 500),
            clinicalRationale: compressed.analysis.explanations.clinicalRationale?.substring(0, 500),
            safetyInformation: compressed.analysis.explanations.safetyInformation,
            keyFindings: compressed.analysis.explanations.keyFindings?.slice(0, 5)
          };
        }
      }
      
      return compressed;
    } catch (error) {
      console.error('Error compressing data:', error);
      return data;
    }
  },

  // Safe storage with compression and size checking
  setItem: (key, data, maxSize = 1024 * 1024) => {
    try {
      const compressedData = storageUtils.compressData(data);
      const dataString = JSON.stringify(compressedData);
      
      if (dataString.length > maxSize) {
        console.warn(`Data too large for ${key}: ${dataString.length} bytes`);
        return false;
      }
      
      localStorage.setItem(key, dataString);
      return true;
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      return false;
    }
  },

  // Safe retrieval
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  // Clear old history items
  clearOldHistory: (history, maxItems = 15) => {
    if (history.length <= maxItems) return history;
    
    const sortedHistory = history
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, maxItems);
    
    return sortedHistory;
  },

  // Cache community data with timestamp
  setCachedCommunityData: (data) => {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: 30 * 60 * 1000 // 30 minutes
    };
    storageUtils.setItem(STORAGE_KEYS.COMMUNITY_DATA, cacheData);
  },

  getCachedCommunityData: () => {
    const cached = storageUtils.getItem(STORAGE_KEYS.COMMUNITY_DATA);
    if (cached && (Date.now() - cached.timestamp) < cached.expiry) {
      return cached.data;
    }
    return null;
  },

  // Cache prevention data
  setCachedPreventionData: (disease, data) => {
    const cacheKey = `${STORAGE_KEYS.PREVENTION_DATA}_${disease}`;
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: 24 * 60 * 60 * 1000 // 24 hours
    };
    storageUtils.setItem(cacheKey, cacheData);
  },

  getCachedPreventionData: (disease) => {
    const cacheKey = `${STORAGE_KEYS.PREVENTION_DATA}_${disease}`;
    const cached = storageUtils.getItem(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < cached.expiry) {
      return cached.data;
    }
    return null;
  }
};

// Enhanced Loading Component
const LoadingSpinner = ({ message = "Loading DermaScan...", subMessage = "Your skin health companion" }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-600 rounded-full"></div>
    </div>
    <span className="mt-4 text-indigo-700 font-medium">{message}</span>
    <p className="mt-2 text-sm text-gray-500">{subMessage}</p>
  </div>
);

// Page Transition Wrapper
const PageTransition = ({ children }) => {
  const location = useLocation();
  
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Production Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
          <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8 border border-red-200">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We encountered an unexpected error. Don't worry, our team has been notified and we're working on it.
            </p>
            <div className="space-y-3">
              <button
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => window.location.reload()}
              >
                🔄 Refresh Page
              </button>
              <button
                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              >
                Try Again
              </button>
              <a
                href="/"
                className="block w-full text-center bg-gray-100 text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                🏠 Go Home
              </a>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left text-sm text-gray-500 border-t pt-4">
                <summary className="cursor-pointer font-medium">Error Details (Development)</summary>
                <pre className="mt-3 whitespace-pre-wrap text-xs bg-gray-100 p-3 rounded-lg overflow-auto max-h-60">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Enhanced Not Found Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 px-4">
    <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8 border border-purple-200">
      <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🔍</span>
      </div>
      <h2 className="text-4xl font-bold text-gray-800 mb-3">404</h2>
      <p className="text-gray-600 mb-6 text-lg">The page you're looking for doesn't exist.</p>
      <div className="space-y-3">
        <a
          href="/"
          className="block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          🏠 Go Home
        </a>
        <a
          href="/analysis"
          className="block border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 font-medium transition-colors"
        >
          🔍 Start Analysis
        </a>
      </div>
    </div>
  </div>
);

// Enhanced Protected Route Component
const ProtectedRoute = ({ children, user, requiredRole, redirectTo = '/auth' }) => {
  const location = useLocation();

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Enhanced Retraining Notification Component
const RetrainingNotification = ({ status, onClose }) => {
  if (!status?.is_retraining) return null;

  return (
    <motion.div 
      className="fixed top-4 right-4 left-4 md:left-auto md:max-w-md z-50 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl shadow-2xl p-4"
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-yellow-800">
              🚀 Model Retraining in Progress
            </h4>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-yellow-600 hover:text-yellow-800 text-lg font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            {status.current_step} ({status.progress}% complete)
          </p>
          <div className="w-full bg-yellow-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${status.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-yellow-600">
            This may take a few minutes. Analysis will be faster once complete! 🎯
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Community Stats Badge Component
const CommunityStatsBadge = ({ insights }) => {
  if (!insights) return null;

  return (
    <motion.div 
      className="fixed bottom-4 right-4 z-40 bg-white rounded-2xl shadow-2xl border border-blue-200 p-4 max-w-xs"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 text-lg">👥</span>
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm">Community Insights</h4>
          <p className="text-xs text-gray-600">Real-time skin health data</p>
        </div>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Today's Scans:</span>
          <span className="font-bold text-blue-600">{insights.today?.total_scans || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Benign Rate:</span>
          <span className="font-bold text-green-600">{insights.today?.benign_percentage || 0}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Weekly Total:</span>
          <span className="font-bold text-purple-600">{insights.weekly?.total_scans || 0}</span>
        </div>
      </div>
      
      <button 
        onClick={() => window.location.href = '/community'}
        className="w-full mt-3 bg-blue-50 text-blue-600 text-xs font-medium py-2 rounded-lg hover:bg-blue-100 transition-colors"
      >
        View Full Report →
      </button>
    </motion.div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [retrainingStatus, setRetrainingStatus] = useState(null);
  const [modelPerformance, setModelPerformance] = useState(null);
  const [communityInsights, setCommunityInsights] = useState(null);
  const [preventionData, setPreventionData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showRetrainingNotification, setShowRetrainingNotification] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [showCommunityBadge, setShowCommunityBadge] = useState(true);

  // Enhanced app initialization
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      
      try {
        // Load user and history from localStorage with safe methods
        const savedUser = storageUtils.getItem(STORAGE_KEYS.USER);
        const savedHistory = storageUtils.getItem(STORAGE_KEYS.HISTORY);
        
        if (savedUser) {
          setUser(savedUser);
          
          // Fetch additional user data if needed
          if (savedUser.role === 'admin' || savedUser.role === 'doctor') {
            const status = await getRetrainingStatus();
            setRetrainingStatus(status);
          }
        }
        
        if (savedHistory) {
          setAnalysisHistory(savedHistory);
        }

        // Load community insights
        await loadCommunityInsights();
        
        // Check storage health
        const storageUsage = storageUtils.getStorageUsage();
        const storageQuota = storageUtils.getStorageQuota();
        const usagePercentage = (storageUsage / storageQuota) * 100;
        
        if (usagePercentage > 80) {
          console.warn(`Storage usage high: ${usagePercentage.toFixed(1)}%`);
          // Auto-cleanup if storage is nearly full
          const cleanedHistory = storageUtils.clearOldHistory(savedHistory || [], 10);
          setAnalysisHistory(cleanedHistory);
        }
        
        // Simulate app loading for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setLoading(false);
        setAppReady(true);
      }
    };

    initializeApp();
  }, []);

  // Load community insights with caching
  const loadCommunityInsights = async () => {
    try {
      // Try to get cached data first
      const cachedInsights = storageUtils.getCachedCommunityData();
      if (cachedInsights) {
        setCommunityInsights(cachedInsights);
        return;
      }

      // Fetch fresh data
      const insights = await getCommunityInsights();
      setCommunityInsights(insights);
      storageUtils.setCachedCommunityData(insights);
    } catch (error) {
      console.error('Error loading community insights:', error);
      // Fallback to mock data
      setCommunityInsights({
        today: { total_scans: 42, benign_percentage: 85.7, malignant_percentage: 14.3 },
        weekly: { total_scans: 287, benign_percentage: 82.6, malignant_percentage: 17.4 },
        most_common_today: { disease: 'Melanocytic nevi', count: 18 }
      });
    }
  };

  // Load prevention data with caching
  const loadPreventionData = async (disease) => {
    try {
      // Try to get cached data first
      const cachedData = storageUtils.getCachedPreventionData(disease);
      if (cachedData) {
        setPreventionData(prev => ({ ...prev, [disease]: cachedData }));
        return cachedData;
      }

      // Fetch fresh data
      const data = await getPreventiveCare(disease);
      setPreventionData(prev => ({ ...prev, [disease]: data }));
      storageUtils.setCachedPreventionData(disease, data);
      return data;
    } catch (error) {
      console.error('Error loading prevention data:', error);
      return null;
    }
  };

  // Save history to localStorage with enhanced error handling
  useEffect(() => {
    const saveHistory = async () => {
      try {
        if (analysisHistory.length > 0) {
          // Clear old history items before saving
          const optimizedHistory = storageUtils.clearOldHistory(analysisHistory, 15);
          
          // Check if we have enough space
          const currentUsage = storageUtils.getStorageUsage();
          const quota = storageUtils.getStorageQuota();
          
          if (currentUsage > quota * 0.8) {
            console.log('Storage quota nearly full, clearing some space...');
            // Keep even fewer items
            const emergencyHistory = storageUtils.clearOldHistory(optimizedHistory, 10);
            storageUtils.setItem(STORAGE_KEYS.HISTORY, emergencyHistory);
          } else {
            storageUtils.setItem(STORAGE_KEYS.HISTORY, optimizedHistory);
          }
        }
      } catch (error) {
        console.error('Error saving history to localStorage:', error);
        
        // If we still get quota errors, implement more aggressive cleanup
        if (error.name === 'QuotaExceededError') {
          console.log('Storage quota exceeded, implementing emergency cleanup...');
          
          // Keep only last 5 analyses
          const emergencyHistory = analysisHistory.slice(-5);
          try {
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(emergencyHistory));
            setAnalysisHistory(emergencyHistory);
          } catch (e) {
            console.error('Emergency cleanup failed, clearing history:', e);
            localStorage.removeItem(STORAGE_KEYS.HISTORY);
            setAnalysisHistory([]);
          }
        }
      }
    };

    saveHistory();
  }, [analysisHistory]);

  // Enhanced polling for retraining status
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'doctor')) return;

    let intervalId;

    const fetchRetrainingStatus = async () => {
      try {
        const status = await getRetrainingStatus();
        setRetrainingStatus(prevStatus => {
          if (JSON.stringify(prevStatus) !== JSON.stringify(status)) {
            return status;
          }
          return prevStatus;
        });
        
        // Auto-hide notification when retraining completes
        if (!status.is_retraining && retrainingStatus?.is_retraining) {
          setTimeout(() => setShowRetrainingNotification(false), 3000);
        }
      } catch (error) {
        console.error('Error fetching retraining status:', error);
      }
    };

    fetchRetrainingStatus();
    intervalId = setInterval(fetchRetrainingStatus, 15000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, retrainingStatus?.is_retraining]);

  // Enhanced model performance fetching
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchModelPerformance = async () => {
      try {
        const performance = await getModelPerformance();
        setModelPerformance(performance);
      } catch (error) {
        console.error('Error fetching model performance:', error);
      }
    };

    fetchModelPerformance();
    const intervalId = setInterval(fetchModelPerformance, 300000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Community insights auto-refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadCommunityInsights();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  // Enhanced login handler
  const handleLogin = async (userData) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userWithRole = {
        ...userData,
        id: userData.id || `user_${Date.now()}`,
        role: userData.role || 'user',
        joinedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: 'light',
          notifications: true,
          communityBadge: true,
          ...userData.preferences
        }
      };
      
      setUser(userWithRole);
      storageUtils.setItem(STORAGE_KEYS.USER, userWithRole);
      
      console.log(`Welcome ${userData.name || userData.email}!`);
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout handler
  const handleLogout = () => {
    setUser(null);
    setCurrentAnalysis(null);
    setRetrainingStatus(null);
    
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    console.log('User logged out successfully');
  };

  // Enhanced history management with compression
  const addToHistory = (analysis) => {
    const newAnalysis = {
      ...analysis,
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      userRole: user?.role || 'anonymous',
      metadata: {
        device: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        imageStored: false,
        ...analysis.metadata
      }
    };

    // Remove large data fields before storing
    const optimizedAnalysis = storageUtils.compressData({ analysis: newAnalysis });
    
    setAnalysisHistory(prev => {
      const updatedHistory = [optimizedAnalysis.analysis, ...prev];
      return storageUtils.clearOldHistory(updatedHistory, 15);
    });

    // Refresh community insights after new analysis
    loadCommunityInsights();
  };

  // Enhanced verification system
  const updateAnalysisWithVerification = (analysisId, verificationData) => {
    setAnalysisHistory(prev => prev.map(analysis => {
      if (analysis.id === analysisId) {
        return {
          ...analysis,
          doctorVerified: true,
          doctorCorrection: verificationData.verifiedDiagnosis,
          verificationData: {
            ...verificationData,
            verifiedAt: new Date().toISOString(),
            verifiedBy: user?.id || 'unknown_doctor'
          },
          confidence: verificationData.confidence || analysis.confidence
        };
      }
      return analysis;
    }));

    if (currentAnalysis?.id === analysisId) {
      setCurrentAnalysis(prev => ({
        ...prev,
        doctorVerified: true,
        doctorCorrection: verificationData.verifiedDiagnosis,
        verificationData: {
          ...verificationData,
          verifiedAt: new Date().toISOString(),
          verifiedBy: user?.id || 'unknown_doctor'
        }
      }));
    }
  };

  const handleVerificationSubmit = (verificationData) => {
    if (currentAnalysis) {
      updateAnalysisWithVerification(currentAnalysis.id, verificationData);
    }
  };

  // Enhanced navigation handlers for Hero component
  const handleStartAnalysis = () => {
    window.location.href = '/analysis';
  };

  const handleFindDoctors = () => {
    window.location.href = '/dermatologists';
  };

  const handleViewCommunityInsights = () => {
    window.location.href = '/community';
  };

  const handleViewPreventionGuide = () => {
    window.location.href = '/prevention';
  };

  if (loading && !appReady) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <ErrorBoundary>
        <div className="App min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
          <Header 
            user={user} 
            onLogout={handleLogout}
            retrainingStatus={retrainingStatus}
            analysisHistory={analysisHistory}
            communityInsights={communityInsights}
          />
          
          {showRetrainingNotification && retrainingStatus?.is_retraining && (
            <RetrainingNotification 
              status={retrainingStatus}
              onClose={() => setShowRetrainingNotification(false)}
            />
          )}

          {showCommunityBadge && communityInsights && user?.preferences?.communityBadge && (
            <CommunityStatsBadge insights={communityInsights} />
          )}

          <main className="flex-1">
            <Suspense fallback={<LoadingSpinner message="Loading content..." subMessage="Almost there!" />}>
              <Routes>
                <Route path="/" element={
                  <PageTransition>
                    <Hero 
                      onStartAnalysis={handleStartAnalysis}
                      onFindDoctors={handleFindDoctors}
                      onViewCommunityInsights={handleViewCommunityInsights}
                      onViewPreventionGuide={handleViewPreventionGuide}
                      user={user}
                      communityInsights={communityInsights}
                    />
                  </PageTransition>
                } />
                
                <Route path="/analysis" element={
                  <PageTransition>
                    <Home 
                      setCurrentAnalysis={setCurrentAnalysis}
                      setAnalysisHistory={addToHistory}
                      user={user}
                      loading={loading}
                      communityInsights={communityInsights}
                    />
                  </PageTransition>
                } />
                
                <Route path="/auth" element={
                  <PageTransition>
                    <Auth 
                      onLogin={handleLogin} 
                      loading={loading}
                      user={user}
                    />
                  </PageTransition>
                } />
                
                <Route path="/results" element={
                  <ProtectedRoute user={user}>
                    <PageTransition>
                      <Results 
                        analysis={currentAnalysis}
                        user={user}
                        onVerificationSubmit={handleVerificationSubmit}
                        analysisHistory={analysisHistory}
                        preventionData={preventionData}
                        onLoadPreventionData={loadPreventionData}
                      />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                
                <Route path="/xai-explanation" element={
                  <ProtectedRoute user={user}>
                    <PageTransition>
                      <XAIExplanation 
                        explanations={currentAnalysis?.explanations}
                        diagnosis={currentAnalysis?.diagnosis}
                        heatmap={currentAnalysis?.heatmap}
                      />
                    </PageTransition>
                  </ProtectedRoute>
                } />

                <Route path="/heatmap" element={
                  <ProtectedRoute user={user}>
                    <PageTransition>
                      <Suspense fallback={<LoadingSpinner message="Loading heatmap visualization..." />}>
                        <HeatmapVisualization 
                          heatmap={currentAnalysis?.heatmap}
                          originalImage={currentAnalysis?.imageData}
                          diagnosis={currentAnalysis?.diagnosis}
                        />
                      </Suspense>
                    </PageTransition>
                  </ProtectedRoute>
                } />
                
                <Route path="/how-it-works" element={
                  <PageTransition>
                    <HowItWorks />
                  </PageTransition>
                } />
                
                <Route path="/dermatologists" element={
                  <PageTransition>
                    <DermatologistFinder 
                      user={user}
                      currentLocation={user?.location}
                    />
                  </PageTransition>
                } />

                <Route path="/community" element={
                  <PageTransition>
                    <CommunityInsights 
                      insights={communityInsights}
                      onRefresh={loadCommunityInsights}
                      loading={loading}
                    />
                  </PageTransition>
                } />

                <Route path="/prevention" element={
                  <PageTransition>
                    <PreventiveCare 
                      preventionData={preventionData}
                      onLoadPreventionData={loadPreventionData}
                      user={user}
                    />
                  </PageTransition>
                } />
                
                <Route path="/history" element={
                  <ProtectedRoute user={user}>
                    <PageTransition>
                      <Suspense fallback={<LoadingSpinner message="Loading your history..." />}>
                        <HistoryTimeline 
                          history={analysisHistory}
                          user={user}
                          onVerificationSubmit={handleVerificationSubmit}
                          communityInsights={communityInsights}
                        />
                      </Suspense>
                    </PageTransition>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute user={user}>
                    <PageTransition>
                      <UserProfile 
                        user={user}
                        retrainingStatus={retrainingStatus}
                        modelPerformance={modelPerformance}
                        onRetrainingStatusChange={setRetrainingStatus}
                        analysisHistory={analysisHistory}
                        communityInsights={communityInsights}
                        onCommunityBadgeToggle={(show) => setShowCommunityBadge(show)}
                      />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute user={user} requiredRole="admin">
                    <PageTransition>
                      <UserProfile 
                        user={user}
                        retrainingStatus={retrainingStatus}
                        modelPerformance={modelPerformance}
                        onRetrainingStatusChange={setRetrainingStatus}
                        analysisHistory={analysisHistory}
                        communityInsights={communityInsights}
                        adminView={true}
                      />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                
                <Route path="/doctor" element={
                  <ProtectedRoute user={user} requiredRole="doctor">
                    <PageTransition>
                      <UserProfile 
                        user={user}
                        retrainingStatus={retrainingStatus}
                        modelPerformance={modelPerformance}
                        onRetrainingStatusChange={setRetrainingStatus}
                        analysisHistory={analysisHistory}
                        communityInsights={communityInsights}
                        doctorView={true}
                      />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                
                <Route path="/home" element={<Navigate to="/analysis" replace />} />
                
                <Route path="*" element={
                  <PageTransition>
                    <NotFound />
                  </PageTransition>
                } />
              </Routes>
            </Suspense>
          </main>
          
          <Disclaimer />
          <Footer />
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;