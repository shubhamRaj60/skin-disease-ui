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
  FaRocket
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
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef(null);

  // Base navigation items for all users
  const baseNavItems = [
    { name: 'Home', path: '/', icon: FaHome, description: 'Dashboard overview' },
    { name: 'Analysis', path: '/analysis', icon: FaHeartbeat, description: 'Skin analysis' },
    { name: 'How It Works', path: '/how-it-works', icon: FaInfoCircle, description: 'Learn about AI' },
    { name: 'Find Doctors', path: '/dermatologists', icon: FaMapMarkerAlt, description: 'Nearby specialists' },
    { name: 'Community', path: '/community', icon: FaUsers, description: 'Health insights' },
    { name: 'Prevention', path: '/prevention', icon: FaShieldAlt, description: 'Skin care tips' },
  ];

  // Role-based navigation items
  const getRoleNavItems = () => {
    if (!user) return [];

    const roleItems = [
      { name: 'History', path: '/history', icon: FaHistory, description: 'Past analyses' }
    ];

    if (user.role === 'doctor') {
      roleItems.push(
        { name: 'Doctor Portal', path: '/doctor', icon: FaStethoscope, description: 'Medical dashboard' }
      );
    }

    if (user.role === 'admin') {
      roleItems.push(
        { name: 'Admin Panel', path: '/admin', icon: FaCog, description: 'System management' },
        { name: 'Analytics', path: '/profile', icon: FaChartLine, description: 'Performance metrics' }
      );
    }

    if (user.role === 'user') {
      roleItems.push(
        { name: 'Profile', path: '/profile', icon: FaUserCircle, description: 'Account settings' }
      );
    }

    return roleItems;
  };

  const allNavItems = [...baseNavItems, ...getRoleNavItems()];

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      notificationService.notify({
        type: 'success',
        title: 'Connection Restored',
        message: 'You are back online',
        icon: FaCloudDownloadAlt,
        priority: 'medium',
        autoClose: 3000
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      notificationService.notify({
        type: 'warning',
        title: 'Connection Lost',
        message: 'Working in offline mode',
        icon: FaExclamationCircle,
        priority: 'high',
        persistent: true
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Notification subscription
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    });

    return unsubscribe;
  }, []);

  // Dynamic notification generation based on app state
  useEffect(() => {
    // Analysis completion notification
    if (currentAnalysis && !currentAnalysis.notificationSent) {
      notificationService.analysisComplete(
        currentAnalysis.diagnosis?.disease,
        currentAnalysis.diagnosis?.confidence?.toFixed(1)
      );
      currentAnalysis.notificationSent = true;
    }

    // Retraining status notifications
    if (retrainingStatus) {
      if (retrainingStatus.is_retraining && !retrainingStatus.notificationSent) {
        notificationService.modelTrainingStart();
        retrainingStatus.notificationSent = true;
      }

      if (!retrainingStatus.is_retraining && retrainingStatus.last_retraining && retrainingStatus.accuracy_improvement) {
        notificationService.modelTrainingComplete(retrainingStatus.accuracy_improvement);
      }
    }

    // Community milestone notifications
    if (communityInsights) {
      const totalScans = communityInsights.weekly?.total_scans;
      if (totalScans && totalScans % 1000 === 0) {
        notificationService.communityMilestone(
          `Amazing! Our community has completed ${totalScans.toLocaleString()} skin analyses!`
        );
      }
    }

    // Security notifications for admins
    if (user?.role === 'admin' && analysisHistory.length > 0) {
      const recentAnalyses = analysisHistory.filter(
        analysis => new Date(analysis.timestamp) > new Date(Date.now() - 5 * 60 * 1000)
      );
      
      if (recentAnalyses.length > 10) {
        notificationService.securityAlert();
      }
    }
  }, [currentAnalysis, retrainingStatus, communityInsights, user, analysisHistory]);

  const handleLogout = () => {
    notificationService.notify({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been successfully signed out',
      icon: FaSignOutAlt,
      priority: 'low',
      autoClose: 3000
    });

    onLogout();
    navigate('/');
    setMobileMenuOpen(false);
    setNotificationOpen(false);
  };

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
  };

  const markAllAsRead = () => {
    notifications.forEach(notif => {
      if (!notif.read) {
        notificationService.markAsRead(notif.id);
      }
    });
  };

  const getNotificationIcon = (notification) => {
    const IconComponent = notification.icon || FaBell;
    switch (notification.type) {
      case 'success':
        return <IconComponent className="text-green-500 text-lg" />;
      case 'warning':
        return <IconComponent className="text-yellow-500 text-lg" />;
      case 'error':
        return <IconComponent className="text-red-500 text-lg" />;
      case 'critical':
        return <IconComponent className="text-red-600 text-lg animate-pulse" />;
      default:
        return <IconComponent className="text-blue-500 text-lg" />;
    }
  };

  const getNotificationColor = (notification) => {
    switch (notification.type) {
      case 'success':
        return 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white';
      case 'warning':
        return 'border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white';
      case 'error':
        return 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white';
      case 'critical':
        return 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-100 to-white animate-pulse';
      default:
        return 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Critical</span>;
      case 'high':
        return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">High</span>;
      case 'medium':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Medium</span>;
      case 'low':
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Low</span>;
      default:
        return null;
    }
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

  // Auto-close non-persistent notifications after delay
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.persistent && notification.autoClose) {
        const timer = setTimeout(() => {
          notificationService.clear(notification.id);
        }, notification.autoClose);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications]);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 shadow-2xl sticky top-0 z-50 transition-all duration-300 border-b border-blue-400/30 backdrop-blur-sm bg-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <motion.div 
            className="flex items-center group flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/" className="flex items-center">
              <div className="relative">
                <motion.div 
                  className="w-12 h-12 rounded-2xl bg-white shadow-2xl flex items-center justify-center border-2 border-blue-200"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <FaHeartbeat className="text-blue-600 text-xl" />
                </motion.div>
                {isOnline && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                )}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-2xl">
                  DermaScan<span className="text-green-300">AI</span>
                </h1>
                <p className="text-xs text-white/90 mt-1 font-semibold hidden sm:block tracking-wide">
                  Advanced Skin Health Intelligence
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {allNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link
                    to={item.path}
                    className={`relative px-4 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 group ${
                      isActive 
                        ? 'text-white bg-white/25 shadow-lg shadow-blue-500/25' 
                        : 'text-white/90 hover:text-white hover:bg-white/15 hover:shadow-md'
                    }`}
                  >
                    <IconComponent className="text-sm" />
                    <span className="text-sm">{item.name}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {item.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 border-2 border-white/40 rounded-xl shadow-inner"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Right Section - Status, Notifications & User */}
          <div className="flex items-center space-x-4">
            {/* Online Status Indicator */}
            <motion.div 
              className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-white/80 text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </motion.div>

            {/* Retraining Status Indicator for Admins/Doctors */}
            {(user?.role === 'admin' || user?.role === 'doctor') && retrainingStatus?.is_retraining && (
              <motion.div 
                className="hidden md:flex items-center space-x-2 bg-yellow-500/30 border border-yellow-400/40 rounded-full px-4 py-2 backdrop-blur-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <FaSync className="text-yellow-200 text-sm" />
                </motion.div>
                <span className="text-yellow-200 text-sm font-semibold">
                  Training {retrainingStatus.progress}%
                </span>
              </motion.div>
            )}

            {/* Notifications Bell */}
            {user && (
              <div className="relative" ref={notificationRef}>
                <motion.button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaBell className="text-lg" />
                  {unreadCount > 0 && (
                    <motion.span 
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200/80 z-50 backdrop-blur-sm bg-white/95"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">Notifications</h3>
                            <p className="text-sm text-gray-500">
                              {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition"
                              >
                                Mark all read
                              </button>
                            )}
                            {notifications.length > 0 && (
                              <button
                                onClick={clearAllNotifications}
                                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition"
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          <div className="p-2">
                            {notifications.map((notification) => (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={`p-4 rounded-xl mb-2 cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${getNotificationColor(notification)} ${
                                  notification.read ? 'opacity-75' : 'opacity-100'
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 mt-1">
                                    {getNotificationIcon(notification)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-semibold text-gray-800 text-sm">
                                        {notification.title}
                                      </p>
                                      {notification.priority && getPriorityBadge(notification.priority)}
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-gray-400 text-xs">
                                        {formatTime(notification.timestamp)}
                                      </p>
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => clearNotification(notification.id, e)}
                                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                                  >
                                    <FaTimes size={14} />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <motion.div 
                            className="p-8 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FaBell className="text-gray-300 text-2xl" />
                            </div>
                            <p className="text-gray-500 text-sm font-medium">No notifications</p>
                            <p className="text-gray-400 text-xs mt-1">We'll notify you when something arrives</p>
                          </motion.div>
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                          <button
                            onClick={clearAllNotifications}
                            className="w-full text-center text-gray-500 hover:text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-200 transition"
                          >
                            Clear all notifications
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User Role Badge */}
            {user && (
              <motion.div 
                className="hidden md:flex items-center space-x-2 bg-white/15 rounded-xl px-4 py-2 border border-white/25 backdrop-blur-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {user.role === 'admin' && <FaShieldAlt className="text-white text-sm" />}
                {user.role === 'doctor' && <FaUserMd className="text-white text-sm" />}
                {user.role === 'user' && <FaUserCircle className="text-white text-sm" />}
                <span className="text-white text-sm font-semibold capitalize">
                  {user.role}
                </span>
              </motion.div>
            )}

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/profile"
                      className="hidden md:flex items-center text-white hover:text-green-300 transition-all font-semibold bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl border border-white/25 backdrop-blur-sm"
                    >
                      <FaUserCircle className="mr-2" /> 
                      {user.name || 'Profile'}
                    </Link>
                  </motion.div>
                  <motion.button
                    onClick={handleLogout}
                    className="bg-white hover:bg-green-50 text-blue-700 px-4 py-2 rounded-xl font-semibold shadow-lg transition-all flex items-center border border-green-200 hover:border-green-300 hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaSignOutAlt className="mr-2" /> 
                    <span className="hidden sm:inline">Logout</span>
                  </motion.button>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/auth"
                    className="bg-white hover:bg-green-50 text-blue-700 px-4 py-2 rounded-xl font-semibold shadow-lg transition-all flex items-center border border-green-200 hover:border-green-300 hover:shadow-xl"
                  >
                    <FaSignInAlt className="mr-2" /> 
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                </motion.div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                className="lg:hidden text-white hover:text-green-300 transition p-3 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaBars className="text-xl" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/98 backdrop-blur-md border-t border-blue-200 shadow-2xl overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {/* User Info in Mobile Menu */}
              {user && (
                <motion.div 
                  className="px-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mb-3 border border-blue-100 shadow-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                      {user.role === 'admin' && <FaShieldAlt className="text-blue-600 text-lg" />}
                      {user.role === 'doctor' && <FaUserMd className="text-blue-600 text-lg" />}
                      {user.role === 'user' && <FaUserCircle className="text-blue-600 text-lg" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-blue-900 truncate text-sm">
                        {user.name || 'User'}
                      </p>
                      <p className="text-blue-700 text-xs capitalize font-medium">
                        {user.role} • {user.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-blue-600 text-xs">
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mobile Navigation Items */}
              {allNavItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-4 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <IconComponent className={`text-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                      <div className="flex-1">
                        <span>{item.name}</span>
                        <p className="text-xs text-gray-500 font-normal mt-1">
                          {item.description}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Mobile Notifications Preview */}
              {user && notifications.length > 0 && (
                <motion.div 
                  className="px-4 py-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaBell className="text-yellow-600" />
                      <span className="font-bold text-yellow-800 text-sm">Recent Notifications</span>
                      <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                        {unreadCount}
                      </span>
                    </div>
                    {notifications.slice(0, 2).map((notification) => (
                      <div key={notification.id} className="text-sm text-yellow-700 mb-2 last:mb-0 flex items-center space-x-2">
                        <div className="w-1 h-1 bg-yellow-500 rounded-full flex-shrink-0"></div>
                        <span className="truncate">{notification.title}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Mobile Auth Actions */}
              <motion.div 
                className="border-t border-gray-200 pt-4 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50 transition-all"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-blue-600 hover:bg-blue-50 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaSignInAlt />
                    <span>Sign In</span>
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;