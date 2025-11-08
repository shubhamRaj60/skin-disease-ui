import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Import icons from Font Awesome 5 (fa)
import { 
  FaUser, 
  FaLock, 
  FaGoogle, 
  FaFacebook, 
  FaEye, 
  FaEyeSlash, 
  FaUserMd,
  FaShieldAlt,
  FaUserCircle,
  FaStethoscope,
  FaIdCard,
  FaHospital,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowRight,
  FaStar,
  FaBrain,
  FaChartLine
} from 'react-icons/fa';

// Import icons from Font Awesome 6 (fa6)
import { 
  FaShield
} from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = ({ onLogin, loading }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'user',
    licenseNumber: '',
    specialization: '',
    hospital: '',
    experience: '',
    phone: '',
    acceptTerms: false,
    // Admin-only input (separate from password)
    adminCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();
  
  // Read admin code from env (fallback for dev/demo)
  const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || 'Admin2024';

  // Features carousel data
  const FEATURES = [
    {
      icon: FaBrain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning for accurate skin condition detection",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FaShield,
      title: "HIPAA Compliant",
      description: "Your health data is 100% secure and private",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: FaUserMd,
      title: "Expert Verified",
      description: "Medical professionals validate AI diagnoses",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: FaChartLine,
      title: "Continuous Learning",
      description: "Our model improves with every diagnosis",
      color: "from-orange-500 to-red-500"
    }
  ];

  // Role configurations
  const ROLE_CONFIG = {
    user: {
      label: 'Patient',
      icon: FaUserCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Access AI skin analysis and track your health history'
    },
    doctor: {
      label: 'Medical Professional',
      icon: FaUserMd,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      gradient: 'from-green-500 to-green-600',
      description: 'Verify AI diagnoses and contribute to model improvement',
      requiresVerification: true
    },
    admin: {
      label: 'Administrator',
      icon: FaShieldAlt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      gradient: 'from-purple-500 to-purple-600',
      description: 'Manage system performance and model retraining',
      requiresInvite: true
    }
  };

  const SPECIALIZATIONS = [
    'Dermatology',
    'General Practice',
    'Oncology',
    'Plastic Surgery',
    'Pediatrics',
    'Other'
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [FEATURES.length]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Include uppercase, lowercase letters and numbers';
    }
    
    if (!isLogin) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.role) newErrors.role = 'Please select a role';
      if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept Terms & Privacy Policy';
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (formData.role === 'doctor') {
        if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
        if (!formData.specialization) newErrors.specialization = 'Specialization is required';
        if (!formData.hospital) newErrors.hospital = 'Hospital/Clinic name is required';
        if (!formData.experience) newErrors.experience = 'Years of experience is required';
      }

      // Replace old admin validation that used password with proper adminCode check
      if (!isLogin && formData.role === 'admin') {
        if (!formData.adminCode) {
          newErrors.adminCode = 'Admin authorization code is required';
        } else if (formData.adminCode.trim() !== ADMIN_CODE) {
          newErrors.adminCode = 'Invalid admin authorization code';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Password strength evaluation for sign up
  const passwordStrength = useMemo(() => {
    const pwd = formData.password || '';
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const clamped = Math.min(score, 4);
    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['from-rose-500 to-rose-600','from-orange-500 to-amber-600','from-yellow-500 to-lime-500','from-blue-500 to-cyan-600','from-emerald-500 to-green-600'];
    return { score: clamped, label: labels[clamped], gradient: colors[clamped] };
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const userData = {
        id: `user_${Date.now()}`,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        role: formData.role,
        isNewUser: !isLogin,
        joinDate: new Date().toISOString(),
        ...(formData.role === 'doctor' && {
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization,
          hospital: formData.hospital,
          experience: parseInt(formData.experience || '0', 10),
          phone: formData.phone,
          verified: false
        }),
        ...(formData.role === 'admin' && {
          // Do not store/share the code; just mark the session as authorized
          permissions: ['model_management', 'user_management', 'analytics'],
          adminAuthorized: true
        })
      };

      await onLogin(userData);
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ submit: error.message || 'Authentication failed. Please try again.' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      ...(prev.role === 'doctor' && role !== 'doctor' && {
        licenseNumber: '',
        specialization: '',
        hospital: '',
        experience: '',
        phone: ''
      })
    }));
  };

  const handleSocialLogin = (provider) => {
    const demoUser = {
      id: `social_${Date.now()}`,
      email: `user@${provider}.com`,
      firstName: 'Social',
      lastName: 'User',
      name: 'Social User',
      role: 'user',
      isNewUser: true,
      joinDate: new Date().toISOString(),
      socialLogin: true
    };
    
    onLogin(demoUser);
    navigate('/');
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: 'user',
      licenseNumber: '',
      specialization: '',
      hospital: '',
      experience: '',
      phone: '',
      acceptTerms: false,
      // Admin-only input (separate from password)
      adminCode: ''
    });
    setErrors({});
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const RoleCard = ({ role, config }) => {
    const IconComponent = config.icon;
    const isSelected = formData.role === role;
    
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
          isSelected 
            ? `${config.bgColor} ${config.borderColor} shadow-lg ring-2 ring-opacity-20 ring-${config.color.split('-')[1]}-500` 
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleRoleSelect(role)}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${config.bgColor} ${isSelected ? 'shadow-md' : ''}`}>
            <IconComponent className={`text-2xl ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{config.label}</h3>
            <p className="text-sm text-gray-600 mt-1">{config.description}</p>
          </div>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex-shrink-0"
            >
              <FaCheckCircle className="text-green-500 text-xl" />
            </motion.div>
          )}
        </div>
        
        {config.requiresVerification && (
          <div className="mt-3 flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
            <FaExclamationTriangle className="mr-1 flex-shrink-0" />
            <span>Requires verification</span>
          </div>
        )}
        
        {config.requiresInvite && (
          <div className="mt-3 flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
            <FaShieldAlt className="mr-1 flex-shrink-0" />
            <span>Invitation required</span>
          </div>
        )}
      </motion.div>
    );
  };

  // Get current feature for cleaner code
  const currentFeature = FEATURES[activeFeature];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Enhanced Branding */}
          <div className="hidden lg:flex flex-col justify-center p-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* Logo */}
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FaUserMd className="text-white text-2xl" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <FaStar className="text-white text-xs" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    DermaScan<span className="text-blue-600">AI</span>
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">Medical-Grade Skin Intelligence</p>
                </div>
              </div>

              {/* Features Carousel */}
              <div className="relative h-48 mb-8 rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-white/20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="h-full flex flex-col justify-center"
                  >
                    <div 
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentFeature.color} flex items-center justify-center shadow-lg mb-4`}
                    >
                      <currentFeature.icon className="text-white text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {currentFeature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {currentFeature.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
                
                {/* Feature Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {FEATURES.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === activeFeature ? 'bg-blue-600 w-6' : 'bg-gray-300'
                      }`}
                      aria-label={`View feature ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">98%</div>
                  <div className="text-xs text-gray-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">10K+</div>
                  <div className="text-xs text-gray-600">Analyses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">500+</div>
                  <div className="text-xs text-gray-600">Doctors</div>
                </div>
              </div>

              {/* Demo Credentials */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-500" />
                  Quick Demo Access
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                    <span className="font-medium">Administrator</span>
                    <code className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">admin2024</code>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                    <span className="font-medium">Medical Professional</span>
                    <span className="text-green-600 text-xs">Select Doctor Role</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                    <span className="font-medium">Patient</span>
                    <span className="text-gray-500 text-xs">Regular Sign-up</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side - Enhanced Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4"
              >
                {isLogin ? (
                  <FaLock className="text-white text-xl" />
                ) : (
                  <FaUser className="text-white text-xl" />
                )}
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800">
                {isLogin ? 'Welcome Back' : 'Join DermaScanAI'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isLogin 
                  ? 'Sign in to continue your health journey' 
                  : 'Start your journey to better skin health'
                }
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Select Your Role
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRoleInfo(!showRoleInfo)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      aria-label="Role information"
                    >
                      <FaInfoCircle className="text-lg" />
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showRoleInfo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                      >
                        <p className="text-sm text-blue-800">
                          Choose your role to customize your experience and access appropriate features.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                      <RoleCard key={role} role={role} config={config} />
                    ))}
                  </div>
                  {errors.role && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm mt-2 flex items-center"
                    >
                      <FaExclamationTriangle className="mr-1" />
                      {errors.role}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Name Fields */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                        errors.firstName 
                          ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-2">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                        errors.lastName 
                          ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-2">{errors.lastName}</p>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete={isLogin ? 'email' : 'username'}
                    inputMode="email"
                    className={`pl-11 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-sm mt-2">{errors.email}</p>
                )}
              </div>

              {/* Doctor-Specific Fields */}
              {!isLogin && formData.role === 'doctor' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <FaStethoscope className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">Professional Information</h3>
                      <p className="text-sm text-green-600">Verify your medical credentials</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Medical License
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaIdCard className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="licenseNumber"
                          name="licenseNumber"
                          className={`pl-11 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                            errors.licenseNumber 
                              ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                              : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                          }`}
                          placeholder="MED123456"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.licenseNumber && (
                        <p className="text-red-500 text-sm mt-2">{errors.licenseNumber}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <select
                        id="specialization"
                        name="specialization"
                        className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.specialization 
                            ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                            : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                        }`}
                        value={formData.specialization}
                        onChange={handleChange}
                      >
                        <option value="">Select Specialization</option>
                        {SPECIALIZATIONS.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                      {errors.specialization && (
                        <p className="text-red-500 text-sm mt-2">{errors.specialization}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital/Clinic
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaHospital className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="hospital"
                          name="hospital"
                          className={`pl-11 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                            errors.hospital 
                              ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                              : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                          }`}
                          placeholder="General Hospital"
                          value={formData.hospital}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.hospital && (
                        <p className="text-red-500 text-sm mt-2">{errors.hospital}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        id="experience"
                        name="experience"
                        className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                          errors.experience 
                            ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                            : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                        }`}
                        placeholder="5"
                        min="0"
                        max="50"
                        value={formData.experience}
                        onChange={handleChange}
                      />
                      {errors.experience && (
                        <p className="text-red-500 text-sm mt-2">{errors.experience}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>
              )}
              
              {/* Password Fields */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className={`pl-11 pr-11 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                      errors.password 
                        ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : (!isLogin ? 'password-help' : undefined)}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-red-500 text-sm mt-2">{errors.password}</p>
                )}
                {!isLogin && (
                  <>
                    <p id="password-help" className="text-xs text-gray-500 mt-2">
                      Must be 8+ characters with uppercase, lowercase, and numbers
                    </p>
                    {/* Password strength meter */}
                    <div className="mt-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${passwordStrength.gradient}`}
                          style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-xs text-gray-600 mt-1 inline-block">
                        Strength: {passwordStrength.label}
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      autoComplete="new-password"
                      className={`pl-11 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirm-password-error" className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Terms & Privacy for Sign Up */}
              {!isLogin && (
                <div className="flex items-start gap-3">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleChange({ target: { name: 'acceptTerms', value: e.target.checked } })}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-invalid={Boolean(errors.acceptTerms)}
                    aria-describedby={errors.acceptTerms ? 'terms-error' : undefined}
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  </label>
                </div>
              )}
              {!isLogin && errors.acceptTerms && (
                <p id="terms-error" className="text-red-500 text-sm -mt-2">{errors.acceptTerms}</p>
              )}

              {/* Admin Code Field */}
              {!isLogin && formData.role === 'admin' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FaShieldAlt className="text-purple-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-800">Admin Authorization</h3>
                      <p className="text-sm text-purple-600">Special access required</p>
                    </div>
                  </div>
                  <label htmlFor="adminCode" className="block text-sm font-medium text-purple-700 mb-2">
                    Authorization Code
                  </label>
                  <input
                    type="password"
                    id="adminCode"
                    name="adminCode"
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                      errors.adminCode 
                        ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                        : 'border-purple-300 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                    placeholder="Enter admin code"
                    value={formData.adminCode}
                    onChange={handleChange}
                    autoComplete="one-time-code"
                  />
                  {errors.adminCode && (
                    <p className="text-red-500 text-sm mt-2">{errors.adminCode}</p>
                  )}
                  <p className="text-xs text-purple-600 mt-2">
                    For demo, use: <code className="bg-purple-100 text-purple-700 px-2 py-1 rounded">{ADMIN_CODE}</code>
                  </p>
                </motion.div>
              )}
              
              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>
              )}
              
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <p className="text-red-600 text-sm flex items-center" role="alert" aria-live="assertive">
                    <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                    {errors.submit}
                  </p>
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <FaArrowRight className="ml-2" />
                  </>
                )}
              </motion.button>
            </form>
            
            {/* Social Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSocialLogin('google')}
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all font-medium shadow-sm hover:shadow"
                  type="button"
                >
                  <FaGoogle className="text-red-500 mr-3 text-lg" />
                  Google
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all font-medium shadow-sm hover:shadow"
                  type="button"
                >
                  <FaFacebook className="text-blue-600 mr-3 text-lg" />
                  Facebook
                </motion.button>
              </div>
            </div>
            
            {/* Toggle Auth Mode */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={toggleMode}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  type="button"
                >
                  {isLogin ? 'Sign up now' : 'Sign in here'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;