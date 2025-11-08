import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaUsers, 
  FaChartLine, 
  FaHeart, 
  FaShieldAlt, 
  FaEye, 
  FaCalendarAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
  FaLightbulb,
  FaGlobeAmericas,
  FaUserShield
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../api'; // Import the centralized API service

const CommunityInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [useMockData, setUseMockData] = useState(false);
  
  // Simple export of currently displayed insights as JSON
  const handleExport = () => {
    if (!insights) return;
    const blob = new Blob([JSON.stringify({ period: selectedPeriod, insights }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `community-insights-${selectedPeriod}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const fetchCommunityInsights = useCallback(async (period = 'month') => {
    try {
      setLoading(true);
      setError(null);
      setUseMockData(false);
      
      console.log('🔄 Fetching community insights...');
      
      // Use the centralized API service instead of local API calls
      const result = await apiService.getCommunityInsights(period);
      
      if (result.success) {
        console.log('✅ Community insights loaded successfully');
        setInsights(result.data);
        
        // Check if we're using mock data
        if (result.data.isMock) {
          setUseMockData(true);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch community insights');
      }
    } catch (error) {
      console.error('❌ Error fetching community insights:', error);
      setError(error.message);
      
      // Fallback to mock data
      const mockData = generateMockCommunityInsights(period);
      setInsights(mockData);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger data load when period changes
  useEffect(() => {
    fetchCommunityInsights(selectedPeriod);
  }, [selectedPeriod, fetchCommunityInsights]);

  // Mock data generator (keep this as fallback)
  const generateMockCommunityInsights = (period = 'month') => {
    const baseData = {
      period: period,
      total_scans: 12547,
      benign: {
        percentage: 87.3,
        count: 10958,
        trend: 'up'
      },
      malignant: {
        percentage: 12.7,
        count: 1589,
        trend: 'down'
      },
      health_tips: [
        "85% of early-detected skin conditions have better outcomes",
        "Regular self-exams can improve detection rates by 40%",
        "Using sunscreen daily reduces skin cancer risk by 50%",
        "Monthly skin checks help track changes over time"
      ],
      top_conditions: [
        { name: "Benign Nevi", percentage: 42.3, trend: "stable" },
        { name: "Actinic Keratosis", percentage: 18.7, trend: "up" },
        { name: "Basal Cell Carcinoma", percentage: 12.1, trend: "stable" },
        { name: "Melanoma", percentage: 6.3, trend: "down" }
      ],
      regional_data: {
        most_active: "North America",
        growth_rate: "15.2%",
        average_accuracy: "94.7%"
      },
      isMock: true
    };

    const periodMultipliers = {
      week: 0.1,
      month: 1,
      quarter: 3,
      year: 12
    };

    const multiplier = periodMultipliers[period] || 1;
    
    return {
      ...baseData,
      total_scans: Math.round(baseData.total_scans * multiplier),
      benign: {
        ...baseData.benign,
        count: Math.round(baseData.benign.count * multiplier)
      },
      malignant: {
        ...baseData.malignant,
        count: Math.round(baseData.malignant.count * multiplier)
      }
    };
  };

  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return { icon: '↗', color: 'text-red-400', bg: 'bg-red-900/30' };
      case 'down': return { icon: '↘', color: 'text-green-400', bg: 'bg-green-900/30' };
      case 'stable': return { icon: '→', color: 'text-blue-400', bg: 'bg-blue-900/30' };
      default: return { icon: '→', color: 'text-gray-400', bg: 'bg-gray-900/30' };
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[400px] space-y-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
              />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">
                  {useMockData ? 'Loading Demo Data' : 'Loading Community Insights'}
                </h3>
                <p className="text-gray-400">
                  {useMockData 
                    ? 'Using demo data for display' 
                    : 'Gathering anonymous health data from our community...'
                  }
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !useMockData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border border-gray-700/50"
          >
            <div className="w-20 h-20 bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <FaExclamationTriangle className="text-red-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Unable to Load Data</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => fetchCommunityInsights(selectedPeriod)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 border border-cyan-500/30"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  const mockData = generateMockCommunityInsights(selectedPeriod);
                  setInsights(mockData);
                  setUseMockData(true);
                  setError(null);
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 border border-pink-500/30"
              >
                Use Demo Data
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 py-12 relative overflow-hidden">
      {/* Demo Data Notice */}
      {useMockData && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6"
        >
          <div className="bg-yellow-900/30 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/30 text-center">
            <div className="flex items-center justify-center space-x-2 text-yellow-300">
              <FaExclamationTriangle className="text-lg" />
              <span className="font-semibold">Demo Mode</span>
            </div>
            <p className="text-yellow-200 text-sm mt-1">
              Showing sample data. Real community insights will appear when connected to the backend.
            </p>
          </div>
        </motion.div>
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-900/20 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-900/20 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/10 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-800/50 text-cyan-300 font-medium mb-6 border border-cyan-500/30 backdrop-blur-sm">
            <FaUsers className="mr-2" />
            Community Health Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Collective Skin Health Intelligence
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {useMockData 
              ? "Demo data showing how community insights will appear"
              : "Anonymous statistics and insights from thousands of skin health scans across our community"
            }
          </p>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-4 mb-12"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-700/50" role="radiogroup" aria-label="Select time period">
            <div className="flex flex-wrap justify-center gap-2">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPeriod(option.value)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedPeriod === option.value
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700/80'
                  }`}
                  role="radio"
                  aria-checked={selectedPeriod === option.value}
                  aria-label={option.label}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export and live status */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl font-semibold transition-all duration-300 bg-gray-800/70 text-gray-200 hover:bg-gray-700/80 border border-gray-600/50"
              aria-label="Export insights as JSON"
              title="Export insights as JSON"
            >
              Export JSON
            </button>
            <span className="text-sm text-gray-300" aria-live="polite">
              {useMockData ? 'Showing demo insights' : 'Insights updated'} • {periodOptions.find(p => p.value === selectedPeriod)?.label}
            </span>
          </div>
        </motion.div>

        {/* Main Insights Grid */}
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
        >
          {/* Total Scans Card */}
          <motion.div
            variants={cardVariants}
            className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Total Scans</h3>
              <div className="w-12 h-12 bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <FaChartLine className="text-blue-400 text-xl" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {insights?.total_scans?.toLocaleString()}
              </div>
              <p className="text-gray-400">Community skin health scans</p>
              <div className="mt-4 flex items-center justify-center text-sm text-cyan-300 bg-cyan-900/20 px-3 py-1 rounded-full border border-cyan-500/30">
                <FaCalendarAlt className="mr-2" />
                {periodOptions.find(p => p.value === selectedPeriod)?.label}
              </div>
            </div>
          </motion.div>

          {/* Benign Cases Card */}
          <motion.div
            variants={cardVariants}
            className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Benign Cases</h3>
              <div className="w-12 h-12 bg-green-900/30 rounded-2xl flex items-center justify-center border border-green-500/30">
                <FaCheckCircle className="text-green-400 text-xl" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-400 mb-2">
                {insights?.benign?.percentage}%
              </div>
              <p className="text-gray-400 mb-4">
                {insights?.benign?.count?.toLocaleString()} cases
              </p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTrendIcon(insights?.benign?.trend).bg} ${getTrendIcon(insights?.benign?.trend).color} border-green-500/30`}>
                <span className="mr-1">{getTrendIcon(insights?.benign?.trend).icon}</span>
                Trend {insights?.benign?.trend}
              </div>
            </div>
          </motion.div>

          {/* Attention Required Card */}
          <motion.div
            variants={cardVariants}
            className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Needs Attention</h3>
              <div className="w-12 h-12 bg-orange-900/30 rounded-2xl flex items-center justify-center border border-orange-500/30">
                <FaExclamationTriangle className="text-orange-400 text-xl" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-400 mb-2">
                {insights?.malignant?.percentage}%
              </div>
              <p className="text-gray-400 mb-4">
                {insights?.malignant?.count?.toLocaleString()} cases
              </p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTrendIcon(insights?.malignant?.trend).bg} ${getTrendIcon(insights?.malignant?.trend).color} border-orange-500/30`}>
                <span className="mr-1">{getTrendIcon(insights?.malignant?.trend).icon}</span>
                Trend {insights?.malignant?.trend}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Rest of your component remains the same... */}
        {/* Detailed Statistics and Health Tips */}
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12"
        >
          {/* Condition Breakdown */}
          <motion.div
            variants={cardVariants}
            className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-8"
          >
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-purple-900/30 rounded-xl flex items-center justify-center mr-4 border border-purple-500/30">
                <FaEye className="text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Condition Breakdown</h3>
            </div>
            <div className="space-y-6">
              {Array.isArray(insights?.top_conditions) && insights.top_conditions.length > 0 ? insights.top_conditions.map((condition, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-200">{condition.name}</span>
                      <span className="font-bold text-white">{condition.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${condition.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-orange-500' :
                          index === 2 ? 'bg-red-500' :
                          'bg-purple-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-400">No condition data available for this period.</div>
              )}
            </div>
          </motion.div>

          {/* Health Tips */}
          <motion.div
            variants={cardVariants}
            className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700/50 p-8"
          >
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-cyan-900/30 rounded-xl flex items-center justify-center mr-4 border border-cyan-500/30">
                <FaLightbulb className="text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Community Health Tips</h3>
            </div>
            <div className="space-y-6">
              {Array.isArray(insights?.health_tips) && insights.health_tips.length > 0 ? insights.health_tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-2xl border border-blue-500/30"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{tip}</p>
                </motion.div>
              )) : (
                <div className="text-center text-gray-400">No health tips available right now.</div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Why Community Insights Matter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl shadow-2xl p-12 text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="text-center mb-12 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Community Insights Matter</h2>
            <p className="text-blue-100 text-xl max-w-3xl mx-auto">
              Together, we're building a comprehensive understanding of skin health patterns and trends
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              {
                icon: FaUserShield,
                title: "Privacy First",
                description: "All data is completely anonymous and aggregated to protect individual privacy"
              },
              {
                icon: FaGlobeAmericas,
                title: "Global Impact",
                description: "Contribute to skin health research and awareness on a global scale"
              },
              {
                icon: FaHeart,
                title: "Collective Health",
                description: "Help identify patterns that can lead to better early detection methods"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
                  <item.icon className="text-3xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-blue-100 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-center mt-12 pt-8 border-t border-blue-400/30 relative z-10"
          >
            <p className="text-blue-100 mb-6">
              Join thousands of users contributing to better skin health understanding
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center space-x-3 mx-auto hover:scale-105 border border-white">
              <span>Start Your Skin Health Journey</span>
              <FaArrowRight className="text-sm" />
            </button>
          </motion.div>
        </motion.div>

        {/* Data Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-12"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 inline-block max-w-2xl">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <FaShieldAlt className="text-green-400 text-xl" />
              <span className="font-semibold text-white">Data Privacy & Security</span>
            </div>
            <p className="text-gray-400 text-sm">
              All community data is completely anonymous and aggregated. We never store personal identifying information 
              with your skin health data. Your privacy and security are our top priority.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityInsights;