import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHeartbeat, 
  FaUserMd, 
  FaSignInAlt, 
  FaBars, 
  FaSignOutAlt, 
  FaCog,
  FaChartLine,
  FaBell,
  FaShieldAlt,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaUserCircle,
  FaHistory,
  FaStethoscope,
  FaHome,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaUsers,
  FaRobot,
  FaDatabase,
  FaCloudDownloadAlt,
  FaExclamationCircle,
  FaStar,
  FaCalendarAlt,
  FaRocket,
  FaClinicMedical,
  FaChevronDown,
  FaSearch,
  FaUserFriends,
  FaCrown,
  FaBrain,
  FaFlask
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../NotificationService';

const Header = ({ 
  user, 
  onLogout, 
  retrainingStatus, 
  analysisHistory = [],
  communityInsights,
  currentAnalysis 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const wasOfflineRef = useRef(!navigator.onLine);
  const lastAnalysisNotificationRef = useRef(null);

  // Enhanced scroll effect with better performance
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  // Throttle function for performance
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // Enhanced navigation structure with categories
  const navigationStructure = {
    main: [
      { name: 'Home', path: '/', icon: FaHome, description: 'Dashboard overview', badge: null },
      { name: 'AI Analysis', path: '/analysis', icon: FaBrain, description: 'Skin analysis', badge: 'AI' },
    ],
    information: [
      { name: 'How It Works', path: '/how-it-works', icon: FaInfoCircle, description: 'Learn about AI' },
      { name: 'Community', path: '/community', icon: FaUsers, description: 'Health insights' },
    ],
    professional: [
      { name: 'Find Doctors', path: '/dermatologists', icon: FaMapMarkerAlt, description: 'Nearby specialists' },
    ]
  };

  // Enhanced role-based navigation
  const getRoleNavItems = () => {
    if (!user) return [];

    const roleItems = [
      { name: 'History', path: '/history', icon: FaHistory, description: 'Past analyses', category: 'personal' }
    ];

    if (user.role === 'doctor') {
      roleItems.push(
        { name: 'Doctor Portal', path: '/doctor', icon: FaStethoscope, description: 'Medical dashboard', category: 'professional', badge: 'PRO' }
      );
    }

    if (user.role === 'admin') {
      roleItems.push(
        { name: 'Admin Panel', path: '/admin', icon: FaCog, description: 'System management', category: 'admin', badge: 'ADMIN' },
        { name: 'Analytics', path: '/analytics', icon: FaChartLine, description: 'Performance metrics', category: 'admin' }
      );
    }

    if (user.role === 'user') {
      roleItems.push(
        { name: 'My Profile', path: '/profile', icon: FaUserCircle, description: 'Account settings', category: 'personal' }
      );
    }

    return roleItems;
  };

  // Combine all navigation items with categories
  const getAllNavItems = () => {
    const roleItems = getRoleNavItems();
    return {
      main: navigationStructure.main,
      information: navigationStructure.information,
      professional: navigationStructure.professional,
      personal: roleItems.filter(item => item.category === 'personal'),
      admin: roleItems.filter(item => item.category === 'admin'),
    };
  };

  const navItems = getAllNavItems();

  // Enhanced network status with notifications
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOfflineRef.current) {
        notificationService.connectionRestored();
        wasOfflineRef.current = false;
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (!wasOfflineRef.current) {
        notificationService.connectionLost();
        wasOfflineRef.current = true;
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to notification service
  useEffect(() => {
    const handleUpdate = (items) => {
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.read).length);
    };

    const unsubscribe = notificationService.subscribe(handleUpdate);
    const existing = notificationService.getNotifications();
    handleUpdate(existing);

    if (existing.length === 0) {
      notificationService.systemUpdate('Welcome to DermaScan AI. Get started with your first skin analysis.');
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Push analysis completion notifications
  useEffect(() => {
    if (!currentAnalysis) return;

    const disease = currentAnalysis.diagnosis?.disease || 'skin condition';
    const rawConfidence = currentAnalysis.diagnosis?.confidence ?? currentAnalysis.confidence ?? 0;
    const confidencePercent = rawConfidence > 1 ? rawConfidence : rawConfidence * 100;
    const fingerprint = `${disease}-${confidencePercent.toFixed(2)}`;

    if (lastAnalysisNotificationRef.current === fingerprint) {
      return;
    }

    lastAnalysisNotificationRef.current = fingerprint;
    notificationService.analysisComplete(disease, confidencePercent.toFixed(1));
  }, [currentAnalysis]);

  // Enhanced click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced logout handler
  const handleLogout = () => {
    onLogout();
    navigate('/');
    setMobileMenuOpen(false);
    setNotificationOpen(false);
    setUserMenuOpen(false);
  };

  // Enhanced notification handlers
  const handleNotificationClick = (notification) => {
    notificationService.markAsRead(notification.id);

    if (notification.action) {
      switch (notification.action.type) {
        case 'view_results':
          navigate('/results');
          break;
        case 'navigate':
          navigate(notification.action.path);
          break;
        default:
          break;
      }
    }
    
    setNotificationOpen(false);
  };

  const clearNotification = (id, e) => {
    e.stopPropagation();
    notificationService.clear(id);
  };

  const clearAllNotifications = () => {
    notificationService.clearAll();
    setNotificationOpen(false);
  };

  const markAllAsRead = () => {
    notificationService.getNotifications().forEach((notif) => {
      if (!notif.read) {
        notificationService.markAsRead(notif.id);
      }
    });
  };

  // Enhanced notification styling
  const getNotificationIcon = (notification) => {
    const IconComponent = notification.icon || FaBell;
    const iconConfig = {
      success: { color: 'text-emerald-500', bg: 'bg-emerald-100' },
      warning: { color: 'text-amber-500', bg: 'bg-amber-100' },
      error: { color: 'text-rose-500', bg: 'bg-rose-100' },
      critical: { color: 'text-rose-600', bg: 'bg-rose-100' },
      info: { color: 'text-sky-500', bg: 'bg-sky-100' }
    };

    const config = iconConfig[notification.type] || iconConfig.info;
    
    return (
      <div className={`p-2 rounded-xl ${config.bg}`}>
        <IconComponent className={`text-lg ${config.color}`} />
      </div>
    );
  };

  const getNotificationColor = (notification) => {
    const colorConfig = {
      success: 'border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/90 to-white/90',
      warning: 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/90 to-white/90',
      error: 'border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50/90 to-white/90',
      critical: 'border-l-4 border-l-rose-600 bg-gradient-to-r from-rose-100/90 to-white/90',
      info: 'border-l-4 border-l-sky-500 bg-gradient-to-r from-sky-50/90 to-white/90'
    };

    return colorConfig[notification.type] || colorConfig.info;
  };

  const getPriorityBadge = (priority) => {
    const badgeConfig = {
      critical: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', label: 'Critical' },
      high: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', label: 'High' },
      medium: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', label: 'Medium' },
      low: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', label: 'Low' }
    };

    const config = badgeConfig[priority] || badgeConfig.medium;
    
    return (
      <span className={`${config.bg} ${config.text} ${config.border} text-xs px-2 py-1 rounded-full font-semibold border`}>
        {config.label}
      </span>
    );
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

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
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.header 
      className={`bg-white/95 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'shadow-xl h-16' 
          : 'shadow-lg h-20'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      <div className="max-w-8xl mx-auto px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          isScrolled ? 'h-16' : 'h-20'
        }`}>
          
          {/* Enhanced Logo Section */}
          <motion.div 
            className="flex items-center group flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/" className="flex items-center space-x-4">
              <div className="relative">
                <motion.div 
                  className={`rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 shadow-2xl flex items-center justify-center border border-blue-400/30 ${
                    isScrolled ? 'w-10 h-10' : 'w-12 h-12'
                  }`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <FaBrain className="text-white text-lg" />
                </motion.div>
                {isOnline && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                )}
              </div>
              <div className={`transition-all duration-300 ${isScrolled ? 'scale-95' : 'scale-100'}`}>
                <motion.h1 
                  className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent tracking-tight"
                  whileHover={{ scale: 1.02 }}
                >
                  DermaScan<span className="text-blue-500">AI</span>
                </motion.h1>
                <motion.p 
                  className="text-xs text-slate-500 mt-1 font-medium hidden lg:block tracking-wide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Advanced Skin Health Intelligence
                </motion.p>
              </div>
            </Link>
          </motion.div>

          {/* Enhanced Desktop Navigation - Better Spacing and Layout */}
          <nav className="hidden xl:flex items-center space-x-2">
            <motion.div 
              className="flex items-center space-x-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Main Navigation Items */}
              {Object.entries(navItems).map(([, items]) => (
                items.length > 0 && items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <motion.div
                      key={item.name}
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Link
                        to={item.path}
                        className={`relative px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 group ${
                          isActive 
                            ? 'text-blue-700 bg-blue-50 border border-blue-200 shadow-lg' 
                            : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50/80 hover:shadow-md'
                        }`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <IconComponent className={`text-base ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-500'}`} />
                        </motion.div>
                        <span className="text-sm font-medium">{item.name}</span>
                        
                        {/* Badge for special items */}
                        {item.badge && (
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                            item.badge === 'AI' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm' :
                            item.badge === 'PRO' ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-sm' :
                            item.badge === 'ADMIN' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}

                        {/* Enhanced Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl backdrop-blur-sm z-50 pointer-events-none">
                          {item.description}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute inset-0 border-2 border-blue-300 rounded-xl shadow-inner"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })
              ))}
            </motion.div>
          </nav>

          {/* Enhanced Right Section - Better Desktop Layout */}
          <div className="flex items-center space-x-4">
            {/* Online Status Indicator - Desktop Optimized */}
            <motion.div 
              className="hidden 2xl:flex items-center space-x-3 px-4 py-2 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, borderColor: "rgb(203,213,225)" }}
            >
              <motion.div 
                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}
                animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
                transition={isOnline ? { duration: 2, repeat: Infinity } : {}}
              />
              <span className="text-slate-600 text-sm font-medium">
                {isOnline ? 'System Online' : 'Offline Mode'}
              </span>
            </motion.div>

            {/* Retraining Status Indicator - Desktop Optimized */}
            {(user?.role === 'admin' || user?.role === 'doctor') && retrainingStatus?.is_retraining && (
              <motion.div 
                className="hidden lg:flex items-center space-x-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-2 backdrop-blur-sm shadow-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <FaSync className="text-amber-600 text-sm" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-amber-700 text-sm font-semibold">
                    Model Training
                  </span>
                  <span className="text-amber-600 text-xs">
                    {retrainingStatus.progress || 0}% Complete
                  </span>
                </div>
              </motion.div>
            )}

            {/* Enhanced Notifications Bell - Desktop Optimized */}
            {user && (
              <div className="relative" ref={notificationRef}>
                <motion.button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-3 text-slate-600 hover:text-blue-600 rounded-xl transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md bg-white/80 hover:bg-white group"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={notificationOpen ? 'Close notifications' : 'Open notifications'}
                  title={notificationOpen ? 'Close notifications' : 'Open notifications'}
                >
                  <motion.div
                    animate={unreadCount > 0 ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <FaBell className="text-xl group-hover:scale-110 transition-transform duration-200" />
                  </motion.div>
                  {unreadCount > 0 && (
                    <motion.span 
                      className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg border-2 border-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      whileHover={{ scale: 1.2 }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </motion.button>

                {/* Enhanced Notifications Dropdown - Desktop Optimized */}
                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 z-50 overflow-hidden"
                      style={{
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)'
                      }}
                    >
                      {/* Header */}
                      <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white/80">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
                            <p className="text-sm text-slate-500">
                              {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {unreadCount > 0 && (
                              <motion.button
                                onClick={markAllAsRead}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-sm border border-transparent hover:border-blue-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Mark all read
                              </motion.button>
                            )}
                            {notifications.length > 0 && (
                              <motion.button
                                onClick={clearAllNotifications}
                                className="text-slate-500 hover:text-slate-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-slate-100 transition-all duration-200 shadow-sm border border-transparent hover:border-slate-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Clear all
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          <motion.div 
                            className="p-2"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                          >
                            {notifications.map((notification) => (
                              <motion.div
                                key={notification.id}
                                variants={itemVariants}
                                className={`p-4 rounded-xl mb-2 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${getNotificationColor(notification)} ${
                                  notification.read ? 'opacity-75' : 'opacity-100'
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                                whileHover={{ y: -2 }}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    {getNotificationIcon(notification)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-semibold text-slate-800 text-sm">
                                        {notification.title}
                                      </p>
                                      {notification.priority && getPriorityBadge(notification.priority)}
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-slate-400 text-xs">
                                        {formatTime(notification.timestamp)}
                                      </p>
                                      {!notification.read && (
                                        <motion.div 
                                          className="w-2 h-2 bg-blue-500 rounded-full shadow-sm"
                                          animate={{ scale: [1, 1.2, 1] }}
                                          transition={{ duration: 2, repeat: Infinity }}
                                        />
                                      )}
                                    </div>
                                  </div>
                                  <motion.button
                                    onClick={(e) => clearNotification(notification.id, e)}
                                    className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all duration-200"
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <FaTimes size={14} />
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        ) : (
                          <motion.div 
                            className="p-8 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <motion.div 
                              className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-slate-200"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <FaBell className="text-slate-400 text-2xl" />
                            </motion.div>
                            <p className="text-slate-500 text-sm font-medium">No notifications</p>
                            <p className="text-slate-400 text-xs mt-1">We'll notify you when something arrives</p>
                          </motion.div>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="p-4 border-t border-slate-200/60 bg-gradient-to-r from-slate-50 to-white/80 rounded-b-2xl">
                          <motion.button
                            onClick={clearAllNotifications}
                            className="w-full text-center text-slate-500 hover:text-slate-700 text-sm font-medium py-2 rounded-lg hover:bg-slate-200 transition-all duration-200 shadow-sm border border-transparent hover:border-slate-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Clear all notifications
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Enhanced User Menu - Desktop Optimized */}
            {user && (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-4 p-2 rounded-xl hover:bg-slate-50 transition-all duration-300 group border border-transparent hover:border-slate-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label={userMenuOpen ? 'Close user menu' : 'Open user menu'}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-semibold text-slate-800">{user.name || 'User'}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <FaChevronDown className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </div>
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white/80">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{user.name || 'User'}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                            <p className="text-xs text-slate-400 capitalize mt-1">{user.role}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FaUserCircle className="text-slate-500 group-hover:text-blue-500" />
                          <span className="group-hover:text-blue-600">My Profile</span>
                        </Link>
                        <Link
                          to="/history"
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FaHistory className="text-slate-500 group-hover:text-blue-500" />
                          <span className="group-hover:text-blue-600">Analysis History</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-rose-50 text-rose-600 w-full transition-all duration-200 group mt-2"
                        >
                          <FaSignOutAlt className="group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Enhanced Auth Buttons - Desktop Optimized */}
            {!user && (
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  to="/auth?tab=login"
                  className="text-slate-600 hover:text-blue-600 font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/auth?tab=register"
                    className="bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center space-x-2 border border-blue-500 hover:border-blue-600 hover:shadow-xl"
                  >
                    <FaSignInAlt className="text-sm" />
                    <span>Get Started</span>
                  </Link>
                </motion.div>
              </motion.div>
            )}

            {/* Mobile Menu Button - Hidden on Desktop */}
            <motion.button
              className="xl:hidden text-slate-600 hover:text-blue-600 transition-all duration-300 p-3 hover:bg-slate-100 rounded-xl border border-transparent hover:border-slate-200 shadow-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <motion.div
                animate={mobileMenuOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FaBars className="text-xl" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;