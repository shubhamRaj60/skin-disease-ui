import axios from 'axios';

// Configuration
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:5001';
const DEFAULT_TIMEOUT = 45000;

// Enhanced axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    config.metadata = {
      startTime: performance.now(),
      requestId,
      retryCount: config.retryCount || 0
    };

    console.debug(`🌐 API Request [${requestId}]`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      retry: config.retryCount || 0
    });

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with enhanced retry logic
const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 3000]; // 1s, 3s

api.interceptors.response.use(
  (response) => {
    const { startTime, requestId } = response.config.metadata;
    const duration = (performance.now() - startTime).toFixed(2);

    console.debug(`✅ API Response [${requestId}]`, {
      status: response.status,
      duration: `${duration}ms`
    });

    return response;
  },
  async (error) => {
    const { config, response } = error;
    
    if (!config) {
      console.error('🚨 No config in error:', error);
      return Promise.reject(error);
    }

    const { startTime, requestId, retryCount = 0 } = config.metadata;
    const duration = (performance.now() - startTime).toFixed(2);

    console.error(`❌ API Error [${requestId}]`, {
      status: response?.status,
      duration: `${duration}ms`,
      retryCount,
      error: error.message
    });

    // Retry logic
    const shouldRetry = 
      (!response || (response.status >= 500 && response.status < 600)) &&
      retryCount < MAX_RETRIES;

    if (shouldRetry) {
      const nextRetryCount = retryCount + 1;
      const retryDelay = RETRY_DELAYS[nextRetryCount - 1] || 5000;

      console.log(`🔄 Retrying request (${nextRetryCount}/${MAX_RETRIES}) in ${retryDelay}ms...`);

      await new Promise(resolve => setTimeout(resolve, retryDelay));

      return api({
        ...config,
        retryCount: nextRetryCount,
        metadata: {
          ...config.metadata,
          retryCount: nextRetryCount
        }
      });
    }

    // Enhanced error formatting
    const enhancedError = {
      message: error.message,
      status: response?.status,
      data: response?.data,
      code: error.code,
      timestamp: new Date().toISOString(),
      requestId
    };

    return Promise.reject(enhancedError);
  }
);

// Cache management with namespace support
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
    return `${url}:${JSON.stringify(sortedParams)}`;
  }

  set(key, data, namespace = 'default') {
    const namespacedKey = `${namespace}:${key}`;
    this.cache.set(namespacedKey, {
      data,
      timestamp: Date.now()
    });
  }

  get(key, namespace = 'default') {
    const namespacedKey = `${namespace}:${key}`;
    const cached = this.cache.get(namespacedKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    
    this.cache.delete(namespacedKey);
    return null;
  }

  clear(namespace = null) {
    if (namespace) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${namespace}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

const apiCache = new ApiCache();

// ADD THE MISSING PREVENTIVE CARE FUNCTION
export const getPreventiveCare = async (skinType = 'normal', concerns = []) => {
  const cacheKey = apiCache.generateKey('/api/preventive-care', { skinType, concerns });
  const cached = apiCache.get(cacheKey, 'preventive');
  if (cached) return cached;

  try {
    const response = await api.get('/api/preventive-care', {
      params: { skin_type: skinType, concerns: concerns.join(',') }
    });
    apiCache.set(cacheKey, response.data, 'preventive');
    return response.data;
  } catch (error) {
    console.warn('Using mock preventive care data');
    return generateMockPreventiveCare(skinType, concerns);
  }
};

// ADD OTHER POTENTIAL MISSING FUNCTIONS BASED ON YOUR COMPONENTS
export const getHeatmapData = async (period = 'week') => {
  try {
    const response = await api.get('/api/heatmap-data', {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.warn('Using mock heatmap data');
    return generateMockHeatmapData(period);
  }
};

export const getHistoryTimeline = async (userId) => {
  try {
    const response = await api.get('/api/history-timeline', {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.warn('Using mock history timeline data');
    return generateMockHistoryTimeline();
  }
};

export const getXAIExplanation = async (predictionId) => {
  try {
    const response = await api.get('/api/xai-explanation', {
      params: { prediction_id: predictionId }
    });
    return response.data;
  } catch (error) {
    console.warn('Using mock XAI explanation data');
    return generateMockXAIExplanation();
  }
};

// Previous API functions from earlier...
export const getRetrainingStatus = async () => {
  try {
    const response = await api.get('/api/retraining-status');
    return response.data;
  } catch (error) {
    console.warn('Using mock retraining status data');
    return generateMockRetrainingStatus();
  }
};

export const getRetrainingMetrics = async () => {
  try {
    const response = await api.get('/api/retraining-metrics');
    return response.data;
  } catch (error) {
    console.warn('Using mock retraining metrics data');
    return generateMockRetrainingMetrics();
  }
};

export const forceRetrain = async () => {
  try {
    const response = await api.post('/api/force-retrain');
    apiCache.clear('model');
    return response.data;
  } catch (error) {
    console.error('Force retrain failed:', error);
    throw error;
  }
};

// Core API Functions
export const predictImage = async (formData, onProgress = null) => {
  const response = await api.post('/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000,
    onUploadProgress: onProgress ? (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      onProgress(percentCompleted);
    } : undefined,
  });
  return response.data;
};

export const verifyDiagnosis = async (verificationData) => {
  try {
    const response = await api.post('/api/verify-diagnosis', verificationData);
    return response.data;
  } catch (error) {
    console.error('Error verifying diagnosis:', error);
    throw error;
  }
};

export const healthCheck = async () => {
  const cacheKey = apiCache.generateKey('/health');
  const cached = apiCache.get(cacheKey, 'health');
  if (cached) return cached;

  try {
    const response = await api.get('/health');
    apiCache.set(cacheKey, response.data, 'health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Model Management APIs
export const getModelPerformance = async () => {
  const cacheKey = apiCache.generateKey('/api/model-performance');
  const cached = apiCache.get(cacheKey, 'model');
  if (cached) return cached;

  try {
    const response = await api.get('/api/model-performance');
    apiCache.set(cacheKey, response.data, 'model');
    return response.data;
  } catch (error) {
    console.warn('Using mock model performance data');
    return generateMockModelPerformance();
  }
};

export const retrainModel = async () => {
  try {
    const response = await api.post('/api/retrain-model');
    apiCache.clear('model');
    return response.data;
  } catch (error) {
    console.error('Retrain model failed:', error);
    throw error;
  }
};

// Dermatologist and Treatment APIs
export const getDermatologists = async (lat, lng, radius = 10) => {
  const cacheKey = apiCache.generateKey('/api/dermatologists', { lat, lng, radius });
  const cached = apiCache.get(cacheKey, 'doctors');
  if (cached) return cached;

  try {
    const response = await api.get('/api/dermatologists', {
      params: { lat, lng, radius }
    });
    apiCache.set(cacheKey, response.data, 'doctors');
    return response.data;
  } catch (error) {
    console.warn('Using mock dermatologists data');
    return generateMockDermatologists();
  }
};

export const suggestTreatment = async (treatmentData) => {
  const response = await api.post('/suggest_treatment', treatmentData);
  return response.data;
};

// Community Insights APIs with improved fallbacks
export const getCommunityInsights = async (period = 'month') => {
  const cacheKey = apiCache.generateKey('/api/community-insights', { period });
  const cached = apiCache.get(cacheKey, 'community');
  if (cached) return cached;

  try {
    const response = await api.get('/api/community-insights', {
      params: { period }
    });
    apiCache.set(cacheKey, response.data, 'community');
    return response.data;
  } catch (error) {
    console.warn('Using mock community insights data');
    return generateMockCommunityInsights(period);
  }
};

// NEW MOCK DATA GENERATORS FOR PREVENTIVE CARE AND OTHER COMPONENTS
const generateMockPreventiveCare = (skinType, concerns) => ({
  skin_type: skinType,
  concerns: concerns,
  daily_routine: {
    morning: [
      { step: 'Cleanse', product: 'Gentle cleanser', description: 'Use lukewarm water to wash your face' },
      { step: 'Moisturize', product: 'SPF 30+ moisturizer', description: 'Apply evenly to face and neck' },
      { step: 'Protect', product: 'Sunscreen', description: 'Reapply every 2 hours when outdoors' }
    ],
    evening: [
      { step: 'Cleanse', product: 'Gentle cleanser', description: 'Remove makeup and impurities' },
      { step: 'Treat', product: 'Antioxidant serum', description: 'Apply to target specific concerns' },
      { step: 'Moisturize', product: 'Night cream', description: 'Hydrate while you sleep' }
    ]
  },
  weekly_care: [
    { activity: 'Exfoliation', frequency: '1-2 times weekly', description: 'Gentle chemical exfoliant' },
    { activity: 'Mask treatment', frequency: 'Once weekly', description: 'Hydrating or clarifying mask' },
    { activity: 'Professional check', frequency: 'Monthly self-examination', description: 'Check for new or changing moles' }
  ],
  lifestyle_tips: [
    'Stay hydrated by drinking 8 glasses of water daily',
    'Eat antioxidant-rich foods like berries and leafy greens',
    'Avoid peak sun hours (10 AM - 4 PM)',
    'Wear protective clothing and wide-brimmed hats outdoors',
    'Avoid smoking and limit alcohol consumption'
  ],
  risk_factors: [
    { factor: 'Sun exposure', risk_level: 'high', mitigation: 'Daily sunscreen use' },
    { factor: 'Family history', risk_level: 'medium', mitigation: 'Regular professional screenings' },
    { factor: 'Skin type', risk_level: 'low', mitigation: 'Consistent skincare routine' }
  ],
  isMock: true
});

const generateMockHeatmapData = (period) => ({
  period: period,
  data: [
    { date: '2024-01-01', count: 12, intensity: 0.8 },
    { date: '2024-01-02', count: 8, intensity: 0.6 },
    { date: '2024-01-03', count: 15, intensity: 0.9 },
    { date: '2024-01-04', count: 5, intensity: 0.4 },
    { date: '2024-01-05', count: 18, intensity: 1.0 },
    { date: '2024-01-06', count: 10, intensity: 0.7 },
    { date: '2024-01-07', count: 7, intensity: 0.5 }
  ],
  summary: {
    total_scans: 75,
    average_daily: 10.7,
    peak_day: '2024-01-05',
    trend: 'increasing'
  },
  isMock: true
});

const generateMockHistoryTimeline = () => ({
  scans: [
    {
      id: 1,
      date: '2024-01-07',
      diagnosis: 'Melanocytic Nevus',
      confidence: 0.92,
      image_url: '/mock/images/scan1.jpg',
      verified: true,
      doctor_feedback: 'Benign mole, no concerns'
    },
    {
      id: 2,
      date: '2024-01-05',
      diagnosis: 'Actinic Keratosis',
      confidence: 0.87,
      image_url: '/mock/images/scan2.jpg',
      verified: false,
      doctor_feedback: null
    },
    {
      id: 3,
      date: '2024-01-01',
      diagnosis: 'Seborrheic Keratosis',
      confidence: 0.95,
      image_url: '/mock/images/scan3.jpg',
      verified: true,
      doctor_feedback: 'Common benign growth'
    }
  ],
  total_scans: 3,
  isMock: true
});

const generateMockXAIExplanation = () => ({
  prediction_id: 'pred_12345',
  features: [
    { name: 'Asymmetry', score: 0.8, importance: 0.3 },
    { name: 'Border Irregularity', score: 0.6, importance: 0.25 },
    { name: 'Color Variation', score: 0.9, importance: 0.35 },
    { name: 'Diameter', score: 0.4, importance: 0.1 }
  ],
  heatmap_regions: [
    { x: 120, y: 80, radius: 15, intensity: 0.9 },
    { x: 150, y: 110, radius: 10, intensity: 0.7 },
    { x: 90, y: 95, radius: 8, intensity: 0.6 }
  ],
  confidence_factors: [
    'High color variation detected',
    'Moderate border irregularity',
    'Low asymmetry score'
  ],
  isMock: true
});

// Previous mock generators...
const generateMockRetrainingStatus = () => ({
  is_retraining: false,
  progress: 0,
  current_step: '',
  last_retraining: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  accuracy_improvement: 2.3,
  estimated_completion: null
});

const generateMockRetrainingMetrics = () => ({
  accuracy_trends: [
    { date: '2024-01-01', accuracy: 92.5, verification_count: 156 },
    { date: '2024-01-02', accuracy: 91.8, verification_count: 142 },
    { date: '2024-01-03', accuracy: 93.2, verification_count: 168 },
    { date: '2024-01-04', accuracy: 92.1, verification_count: 151 },
    { date: '2024-01-05', accuracy: 91.5, verification_count: 139 },
    { date: '2024-01-06', accuracy: 92.8, verification_count: 162 },
    { date: '2024-01-07', accuracy: 93.1, verification_count: 175 }
  ],
  performance_metrics: {
    precision: 0.89,
    recall: 0.91,
    f1_score: 0.90,
    confusion_matrix: {
      true_positive: 145,
      true_negative: 823,
      false_positive: 23,
      false_negative: 15
    }
  },
  retraining_history: [
    { date: '2024-01-01', accuracy_before: 89.2, accuracy_after: 91.5, duration_minutes: 45 },
    { date: '2023-12-25', accuracy_before: 88.7, accuracy_after: 89.2, duration_minutes: 38 }
  ]
});

const generateMockModelPerformance = () => ({
  performance: {
    accuracy: 92.5,
    totalVerifications: 1560,
    correctPredictions: 1442,
    averageConfidence: 87.3,
    lastUpdated: new Date().toISOString()
  },
  retrainingRecommended: false,
  modelInfo: {
    name: 'Skin Disease Classifier v2.1',
    version: '2.1.0',
    trainingDate: '2024-01-01',
    classes: ['melanoma', 'nevus', 'basal_cell_carcinoma', 'actinic_keratosis', 'benign_keratosis', 'dermatofibroma', 'vascular_lesion']
  }
});

const generateMockDermatologists = () => ({
  doctors: [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Dermatology',
      distance: 2.5,
      rating: 4.8,
      address: '123 Medical Center, New York, NY',
      phone: '(555) 123-4567',
      available: true
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'Dermatologic Surgery',
      distance: 3.8,
      rating: 4.9,
      address: '456 Skin Care Ave, New York, NY',
      phone: '(555) 987-6543',
      available: false
    }
  ],
  total: 2
});

// Enhanced API Service with better error handling
export const apiService = {
  // Preventive Care
  async getPreventiveCareTips(skinType = 'normal', concerns = []) {
    try {
      const data = await getPreventiveCare(skinType, concerns);
      return {
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get preventive care tips',
        details: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Heatmap Data
  async getScanHeatmap(period = 'week') {
    try {
      const data = await getHeatmapData(period);
      return {
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get heatmap data',
        details: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // History Timeline
  async getUserHistory(userId) {
    try {
      const data = await getHistoryTimeline(userId);
      return {
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get user history',
        details: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // XAI Explanations
  async getExplanation(predictionId) {
    try {
      const data = await getXAIExplanation(predictionId);
      return {
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get explanation',
        details: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Previous API Service methods...
  async analyzeSkinImage(imageFile, onProgress = null) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      console.log('🖼️ Starting skin analysis...');
      const result = await predictImage(formData, onProgress);
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: `analysis_${Date.now()}`
      };
    } catch (error) {
      console.error('❌ Skin analysis failed:', error);
      
      return {
        success: false,
        error: error.data?.error || error.message || 'Analysis failed',
        details: error.data?.details || 'Please try again with a clearer image',
        status: error.status,
        timestamp: new Date().toISOString()
      };
    }
  },

  // ... include all other previous apiService methods here
  // (getRetrainingStatus, getRetrainingMetrics, startRetraining, etc.)
};

// Export utility functions
export const apiUtils = {
  generateRequestId: () => `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
  
  isNetworkError(error) {
    return !error.response && (error.code === 'ECONNABORTED' || error.message === 'Network Error');
  },
  
  shouldRetry(error) {
    if (!error.response) return true;
    const status = error.response.status;
    return status >= 500 && status < 600;
  },
  
  formatError(error) {
    if (typeof error === 'string') return error;
    return error.message || 'An unexpected error occurred';
  },

  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPEG, PNG, or WebP images.';
    }

    if (file.size > maxSize) {
      return 'File size too large. Please upload images smaller than 10MB.';
    }

    return null;
  }
};

export default apiService;