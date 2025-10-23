// src/components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaEdit, 
  FaSave,
  FaCog,
  FaChartLine,
  FaSync,
  FaShieldAlt,
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaDatabase,
  FaRobot,
  FaUserMd,
  FaUsers,
  FaClipboardCheck
} from 'react-icons/fa';
import { 
  getModelPerformance, 
  retrainModel, 
  getRetrainingStatus, 
  getRetrainingMetrics,
  forceRetrain 
} from '../api';

const UserProfile = ({ 
  user, 
  retrainingStatus, 
  modelPerformance, 
  onRetrainingStatusChange,
  adminView = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(adminView ? 'admin' : 'profile');
  const [userData, setUserData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '(555) 123-4567',
    location: 'New York, NY',
    bio: 'I\'m passionate about skin health and regularly monitor any changes in my skin condition.',
    specialization: user?.role === 'doctor' ? 'Dermatology' : '',
    experience: user?.role === 'doctor' ? '5 years' : '',
    licenseNumber: user?.role === 'doctor' ? 'MED123456' : ''
  });

  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'doctor') {
      fetchPerformanceMetrics();
    }
  }, [user]);

  const fetchPerformanceMetrics = async () => {
    try {
      const metrics = await getRetrainingMetrics();
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you would save the data to your backend here
    alert('Profile updated successfully!');
  };

  const handleRetrainModel = async () => {
    setLoading(true);
    try {
      await retrainModel();
      alert('Model retraining started! Check the status in the Admin panel.');
    } catch (error) {
      alert('Failed to start retraining: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceRetrain = async () => {
    if (window.confirm('Force retraining even with limited data? This may produce suboptimal results.')) {
      setLoading(true);
      try {
        await forceRetrain();
        alert('Force retraining started!');
      } catch (error) {
        alert('Failed to start force retraining: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', icon: FaShieldAlt },
      doctor: { color: 'bg-blue-100 text-blue-800', icon: FaUserMd },
      user: { color: 'bg-green-100 text-green-800', icon: FaUsers }
    };
    
    const config = roleConfig[role] || roleConfig.user;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <IconComponent className="mr-1" size={12} />
        {role?.toUpperCase()}
      </span>
    );
  };

  const getUrgencyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Admin Panel Component
  const AdminPanel = () => (
    <div className="space-y-6">
      {/* Model Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FaChartLine className="mr-2 text-blue-600" />
          Model Performance Dashboard
        </h3>
        
        {modelPerformance ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {modelPerformance.performance?.accuracy || 0}%
              </div>
              <div className="text-sm text-blue-800">Accuracy</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {modelPerformance.performance?.totalVerifications || 0}
              </div>
              <div className="text-sm text-green-800">Total Verifications</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {modelPerformance.performance?.correctPredictions || 0}
              </div>
              <div className="text-sm text-purple-800">Correct Predictions</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {modelPerformance.performance?.averageConfidence || 0}%
              </div>
              <div className="text-sm text-orange-800">Avg Confidence</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Loading performance data...
          </div>
        )}

        {/* Retraining Status */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <FaSync className="mr-2 text-blue-600" />
            Retraining Status
          </h4>
          
          {retrainingStatus?.is_retraining ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-yellow-800">Retraining in Progress</span>
                <span className="text-yellow-600">{retrainingStatus.progress}%</span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${retrainingStatus.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-yellow-700">{retrainingStatus.current_step}</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600">
                {retrainingStatus?.last_retraining 
                  ? `Last retrained: ${new Date(retrainingStatus.last_retraining).toLocaleDateString()}`
                  : 'No retraining history'
                }
              </p>
              {retrainingStatus?.accuracy_improvement && (
                <p className="text-green-600 font-medium mt-1">
                  Last improvement: +{retrainingStatus.accuracy_improvement}%
                </p>
              )}
            </div>
          )}
        </div>

        {/* Retraining Controls */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">Model Controls</h4>
          <div className="flex space-x-3">
            <button
              onClick={handleRetrainModel}
              disabled={loading || retrainingStatus?.is_retraining}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition"
            >
              {loading ? 'Starting...' : 'Start Retraining'}
            </button>
            <button
              onClick={handleForceRetrain}
              disabled={loading || retrainingStatus?.is_retraining}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition"
            >
              Force Retrain
            </button>
            <button
              onClick={fetchPerformanceMetrics}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition"
            >
              Refresh
            </button>
          </div>
          
          {modelPerformance?.retrainingRecommended && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-2" />
                <span className="text-red-800 font-medium">Retraining Recommended</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Model accuracy is below optimal levels. Consider retraining with recent verified data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Accuracy Trends */}
      {performanceMetrics?.accuracy_trends && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Accuracy Trends</h3>
          <div className="space-y-3">
            {performanceMetrics.accuracy_trends.slice(0, 7).map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{trend.date}</span>
                <div className="flex items-center space-x-4">
                  <span className={`font-semibold ${getUrgencyColor(trend.accuracy)}`}>
                    {trend.accuracy}%
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({trend.verification_count} verifications)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Doctor Dashboard Component
  const DoctorDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FaClipboardCheck className="mr-2 text-blue-600" />
          Verification Dashboard
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-blue-800">Pending Verifications</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">156</div>
            <div className="text-sm text-green-800">Completed Today</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">94%</div>
            <div className="text-sm text-purple-800">Accuracy Rate</div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">Recent Activity</h4>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-green-600" size={14} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Melanoma Diagnosis</p>
                    <p className="text-sm text-gray-600">Verified 2 hours ago</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">Correct</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Performance for Doctors */}
      {performanceMetrics && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Model Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Current Accuracy</span>
              <span className="font-semibold text-green-600">
                {modelPerformance?.performance?.accuracy || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Your Verification Impact</span>
              <span className="font-semibold text-blue-600">+2.3%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Regular User Profile
  const ProfileSection = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
        <div className="flex flex-col md:flex-row items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 md:mb-0 md:mr-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-20 h-20 flex items-center justify-center">
                <FaUser className="text-3xl text-gray-400" />
              </div>
            </div>
            <button 
              className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 shadow-md"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <FaSave /> : <FaEdit />}
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="bg-transparent border-b border-white/50 focus:border-white focus:outline-none"
                />
              ) : userData.name}
            </h1>
            <div className="flex items-center space-x-2">
              {getRoleBadge(user?.role)}
              <p className="text-blue-100">Premium Member</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <FaEnvelope className="text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium">{userData.email}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <FaPhone className="text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium">{userData.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={userData.location}
                      onChange={handleInputChange}
                      className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium">{userData.location}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">About Me</h2>
            {isEditing ? (
              <textarea
                name="bio"
                value={userData.bio}
                onChange={handleInputChange}
                className="w-full h-40 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-600">{userData.bio}</p>
            )}
          </div>
        </div>

        {/* Doctor-specific fields */}
        {user?.role === 'doctor' && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Specialization</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="specialization"
                    value={userData.specialization}
                    onChange={handleInputChange}
                    className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-medium">{userData.specialization}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="experience"
                    value={userData.experience}
                    onChange={handleInputChange}
                    className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-medium">{userData.experience}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">License Number</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="licenseNumber"
                    value={userData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-medium">{userData.licenseNumber}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h2>
          <div className="space-y-3">
            <button className="w-full text-left py-2 px-4 bg-white rounded-lg hover:bg-gray-100 transition">
              Change Password
            </button>
            <button className="w-full text-left py-2 px-4 bg-white rounded-lg hover:bg-gray-100 transition">
              Notification Preferences
            </button>
            <button className="w-full text-left py-2 px-4 bg-white rounded-lg hover:bg-gray-100 transition text-red-600">
              Delete Account
            </button>
          </div>
        </div>
        
        {isEditing && (
          <div className="flex justify-end space-x-3">
            <button 
              className="border border-gray-300 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-50 transition"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Navigation Tabs
  const NavigationTabs = () => {
    if (!user || user.role === 'user') return null;

    const tabs = [
      { id: 'profile', label: 'Profile', icon: FaUser },
      ...(user.role === 'doctor' ? [{ id: 'doctor', label: 'Doctor Dashboard', icon: FaUserMd }] : []),
      ...(user.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: FaCog }] : [])
    ];

    return (
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md font-medium transition ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <IconComponent className="mr-2" size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto my-12 px-4">
      <NavigationTabs />
      
      {activeTab === 'profile' && <ProfileSection />}
      {activeTab === 'admin' && user?.role === 'admin' && <AdminPanel />}
      {activeTab === 'doctor' && user?.role === 'doctor' && <DoctorDashboard />}
    </div>
  );
};

export default UserProfile;