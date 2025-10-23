import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaInfoCircle
} from 'react-icons/fa';
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
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const navigate = useNavigate();

  // Role configurations
  const ROLE_CONFIG = {
    user: {
      label: 'Patient',
      icon: FaUserCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Access AI skin analysis and track your health history'
    },
    doctor: {
      label: 'Medical Professional',
      icon: FaUserMd,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Verify AI diagnoses and contribute to model improvement',
      requiresVerification: true
    },
    admin: {
      label: 'Administrator',
      icon: FaShieldAlt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
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

  const validateForm = () => {
    const newErrors = {};
    
    // Common validations
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }
    
    if (!isLogin) {
      // Registration validations
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.role) newErrors.role = 'Please select a role';
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Doctor-specific validations
      if (formData.role === 'doctor') {
        if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
        if (!formData.specialization) newErrors.specialization = 'Specialization is required';
        if (!formData.hospital) newErrors.hospital = 'Hospital/Clinic name is required';
        if (!formData.experience) newErrors.experience = 'Years of experience is required';
      }

      // Admin invite code (demo purposes)
      if (formData.role === 'admin' && formData.password !== 'admin2024') {
        newErrors.adminCode = 'Admin registration requires special authorization';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const userData = {
        id: `user_${Date.now()}`,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        role: formData.role,
        isNewUser: !isLogin,
        joinDate: new Date().toISOString(),
        ...(formData.role === 'doctor' && {
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization,
          hospital: formData.hospital,
          experience: formData.experience,
          phone: formData.phone,
          verified: false // Doctors need verification
        }),
        ...(formData.role === 'admin' && {
          permissions: ['model_management', 'user_management', 'analytics']
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
    
    // Clear error when user starts typing
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
      // Reset doctor-specific fields when changing from doctor role
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
    // In a real app, this would integrate with OAuth
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
      phone: ''
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
          isSelected 
            ? `${config.bgColor} border-${config.color.split('-')[1]}-500 shadow-md` 
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleRoleSelect(role)}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <IconComponent className={`text-xl ${config.color}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{config.label}</h3>
            <p className="text-sm text-gray-600 mt-1">{config.description}</p>
          </div>
          {isSelected && (
            <FaCheckCircle className="text-green-500 text-xl" />
          )}
        </div>
        
        {config.requiresVerification && (
          <div className="mt-2 flex items-center text-xs text-orange-600">
            <FaExclamationTriangle className="mr-1" />
            Requires verification
          </div>
        )}
        
        {config.requiresInvite && (
          <div className="mt-2 flex items-center text-xs text-purple-600">
            <FaShieldAlt className="mr-1" />
            Invitation required
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col justify-center p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center lg:text-left"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg">
                <FaUserMd className="text-white text-3xl" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                DermaScan<span className="text-blue-600">AI</span>
              </h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Medical-Grade Skin Analysis Platform
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>AI-Powered Dermatological Analysis</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>Doctor Verification System</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>Secure & HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>Continuous Model Improvement</span>
                </div>
              </div>

              {/* Demo Credentials */}
              <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-500" />
                  Demo Access
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Admin:</strong> Use any email + password "admin2024"</p>
                  <p><strong>Doctor:</strong> Select Medical Professional role</p>
                  <p><strong>Patient:</strong> Regular sign-up</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {isLogin ? 'Welcome Back' : 'Join Our Medical Platform'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isLogin 
                  ? 'Sign in to access your medical dashboard' 
                  : 'Create your account to get started'
                }
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection - Only for Registration */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Your Role
                    <button
                      type="button"
                      onClick={() => setShowRoleInfo(!showRoleInfo)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <FaInfoCircle className="inline" />
                    </button>
                  </label>
                  
                  <AnimatePresence>
                    {showRoleInfo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
                      >
                        <p className="text-sm text-blue-800">
                          <strong>Patient:</strong> Access AI analysis and track your health history.<br/>
                          <strong>Medical Professional:</strong> Verify diagnoses and contribute to AI training.<br/>
                          <strong>Administrator:</strong> Manage system performance and models.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                      <RoleCard key={role} role={role} config={config} />
                    ))}
                  </div>
                  {errors.role && <p className="text-red-500 text-sm mt-2">{errors.role}</p>}
                </div>
              )}

              {/* Name Fields - Only for Registration */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                        errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                        errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>
              )}
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`pl-10 w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Doctor-Specific Fields */}
              {!isLogin && formData.role === 'doctor' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 bg-green-50 rounded-xl p-4 border border-green-200"
                >
                  <h3 className="font-semibold text-green-800 flex items-center">
                    <FaStethoscope className="mr-2" />
                    Professional Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Medical License Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaIdCard className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="licenseNumber"
                          name="licenseNumber"
                          className={`pl-10 w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                            errors.licenseNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                          }`}
                          placeholder="MED123456"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization
                      </label>
                      <select
                        id="specialization"
                        name="specialization"
                        className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                          errors.specialization ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                        }`}
                        value={formData.specialization}
                        onChange={handleChange}
                      >
                        <option value="">Select Specialization</option>
                        {SPECIALIZATIONS.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                      {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
                        Hospital/Clinic
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaHospital className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="hospital"
                          name="hospital"
                          className={`pl-10 w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                            errors.hospital ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                          }`}
                          placeholder="General Hospital"
                          value={formData.hospital}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.hospital && <p className="text-red-500 text-sm mt-1">{errors.hospital}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="experience"
                        name="experience"
                        className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                          errors.experience ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                        }`}
                        placeholder="5"
                        min="0"
                        max="50"
                        value={formData.experience}
                        onChange={handleChange}
                      />
                      {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                        errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>
              )}
              
              {/* Password Fields */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`pl-10 pr-10 w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                )}
              </div>
              
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`pl-10 w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                        errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              {/* Admin Code Field */}
              {!isLogin && formData.role === 'admin' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label htmlFor="adminCode" className="block text-sm font-medium text-purple-700 mb-1">
                    Admin Authorization Code
                  </label>
                  <input
                    type="password"
                    id="adminCode"
                    name="password" // Using password field for demo
                    className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                      errors.adminCode ? 'border-red-500 focus:ring-red-500' : 'border-purple-300 focus:ring-purple-500'
                    }`}
                    placeholder="Enter admin code"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.adminCode && <p className="text-red-500 text-sm mt-1">{errors.adminCode}</p>}
                  <p className="text-xs text-purple-600 mt-1">
                    For demo: use <code className="bg-purple-100 px-1 rounded">admin2024</code>
                  </p>
                </div>
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
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Forgot password?
                    </a>
                  </div>
                </div>
              )}
              
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleSocialLogin('google')}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  <FaGoogle className="text-red-500 mr-2" /> Google
                </button>
                <button 
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  <FaFacebook className="text-blue-600 mr-2" /> Facebook
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={toggleMode}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
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