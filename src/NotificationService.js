import { 
  FaRocket,
  FaCheckCircle,
  FaSync,
  FaChartLine,
  FaShieldAlt,
  FaUsers,
  FaBell,
  FaExclamationTriangle,
  FaCloudDownloadAlt,
  FaExclamationCircle
} from 'react-icons/fa';

// Notification Service for dynamic notifications
class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
    this.timers = new Map();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notify(notification) {
    const newNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      ...notification
    };

    this.notifications.unshift(newNotification);
    this.listeners.forEach(callback => callback([...this.notifications]));

    if (newNotification.autoClose) {
      const timerId = setTimeout(() => {
        this.clear(newNotification.id);
      }, newNotification.autoClose);
      this.timers.set(newNotification.id, timerId);
    }
  }

  getNotifications() {
    return [...this.notifications];
  }

  markAsRead(id) {
    this.notifications = this.notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    this.listeners.forEach(callback => callback([...this.notifications]));
  }

  clear(id) {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }
    this.notifications = this.notifications.filter(notif => notif.id !== id);
    this.listeners.forEach(callback => callback([...this.notifications]));
  }

  clearAll() {
    this.timers.forEach(timerId => clearTimeout(timerId));
    this.timers.clear();
    this.notifications = [];
    this.listeners.forEach(callback => callback([]));
  }

  // Pre-defined notification types
  systemUpdate(message) {
    this.notify({
      type: 'info',
      title: 'System Update',
      message,
      icon: FaRocket,
      priority: 'medium'
    });
  }

  analysisComplete(disease, confidence) {
    this.notify({
      type: 'success',
      title: 'Analysis Complete',
      message: `Detected ${disease} with ${confidence}% confidence`,
      icon: FaCheckCircle,
      priority: 'high',
      action: { type: 'view_results', path: '/results' }
    });
  }

  modelTrainingStart() {
    this.notify({
      type: 'info',
      title: 'Model Training Started',
      message: 'AI model retraining has begun. This may take 15-30 minutes.',
      icon: FaSync,
      priority: 'high',
      persistent: true
    });
  }

  modelTrainingComplete(improvement) {
    this.notify({
      type: 'success',
      title: 'Model Training Complete',
      message: `Model accuracy improved by ${improvement}%`,
      icon: FaChartLine,
      priority: 'high'
    });
  }

  securityAlert() {
    this.notify({
      type: 'warning',
      title: 'Security Alert',
      message: 'Unusual activity detected in your account',
      icon: FaShieldAlt,
      priority: 'critical'
    });
  }

  communityMilestone(milestone) {
    this.notify({
      type: 'info',
      title: 'Community Milestone',
      message: milestone,
      icon: FaUsers,
      priority: 'low'
    });
  }

  connectionRestored() {
    this.notify({
      type: 'success',
      title: 'Connection Restored',
      message: 'You are back online',
      icon: FaCloudDownloadAlt,
      priority: 'medium',
      autoClose: 3000
    });
  }

  connectionLost() {
    this.notify({
      type: 'warning',
      title: 'Connection Lost',
      message: 'Working in offline mode',
      icon: FaExclamationCircle,
      priority: 'high',
      persistent: true
    });
  }
}

// Create global notification service instance
export const notificationService = new NotificationService();

export default notificationService;