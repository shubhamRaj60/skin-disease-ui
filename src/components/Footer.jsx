import React, { useState } from 'react';
import { 
  FaHeartbeat, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram,
  FaShieldAlt,
  FaStethoscope,
  FaUserMd,
  FaArrowRight,
  FaRocket,
  FaAward
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const diseases = [
    "Melanoma", "Psoriasis", "Eczema", "Acne", "Rosacea", 
    "Basal Cell Carcinoma", "Actinic Keratosis", "Tinea"
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      // Simulate API call
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.footer 
      className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 text-white pt-20 pb-12 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-blue-500 rounded-full opacity-5 blur-xl"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-amber-500 rounded-full opacity-5 blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand Section */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center mb-6">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaHeartbeat className="text-white text-xl" />
              </motion.div>
              <div className="ml-4">
                <h3 className="text-2xl font-black">DermaScan<span className="text-blue-400">AI</span></h3>
                <p className="text-blue-300 text-sm font-medium mt-1">Advanced Skin Intelligence</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-lg">
              Revolutionary AI technology for accurate skin health assessment and personalized treatment insights.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: FaFacebookF, color: "hover:text-blue-400" },
                { icon: FaTwitter, color: "hover:text-sky-400" },
                { icon: FaLinkedinIn, color: "hover:text-blue-500" },
                { icon: FaInstagram, color: "hover:text-pink-400" }
              ].map((SocialIcon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className={`text-gray-400 ${SocialIcon.color} transition-all duration-300 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 hover:scale-110`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SocialIcon.icon className="text-lg" />
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-black mb-8 flex items-center">
              <FaRocket className="text-amber-500 mr-3" />
              Quick Links
            </h4>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'AI Analysis', path: '/analysis' },
                { name: 'How It Works', path: '/how-it-works' },
                { name: 'Skin Diseases', path: '/diseases' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact', path: '/contact' }
              ].map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <a 
                    href={link.path} 
                    className="text-gray-400 hover:text-white transition-all duration-300 flex items-center group font-medium"
                  >
                    <FaArrowRight className="text-amber-500 mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0" />
                    <span>{link.name}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          {/* Diseases We Detect */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-black mb-8 flex items-center">
              <FaStethoscope className="text-green-500 mr-3" />
              Diseases We Detect
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {diseases.map((disease, index) => (
                <motion.a 
                  key={index} 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-all duration-300 text-sm p-3 rounded-xl bg-gray-800 hover:bg-gray-700 hover:shadow-lg group"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                    {disease}
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          {/* Contact & Newsletter */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-black mb-8 flex items-center">
              <FaUserMd className="text-purple-500 mr-3" />
              Contact Us
            </h4>
            <ul className="space-y-4 text-gray-400 mb-8">
              {[
                { icon: FaMapMarkerAlt, text: "123 Medical Drive, Health City, HC 54321" },
                { icon: FaPhoneAlt, text: "(555) 123-4567" },
                { icon: FaEnvelope, text: "support@dermascanai.com" }
              ].map((item, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start group"
                  whileHover={{ x: 5 }}
                >
                  <item.icon className="mt-1 mr-4 text-amber-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:text-white transition-colors duration-300">{item.text}</span>
                </motion.li>
              ))}
            </ul>
            
            <div className="mt-8">
              <h4 className="text-xl font-black mb-6 flex items-center">
                <FaAward className="text-blue-500 mr-3" />
                Stay Updated
              </h4>
              {isSubscribed ? (
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl text-center shadow-xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <FaCheckCircle className="text-white text-2xl mx-auto mb-2" />
                  <p className="text-white font-semibold">Thank you for subscribing!</p>
                  <p className="text-green-100 text-sm">Welcome to our health community</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <motion.input 
                    type="email" 
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 border-gray-700 bg-gray-800 rounded-2xl p-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500 focus:ring-opacity-20 transition-all duration-300 text-white placeholder-gray-500"
                    required
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3 group"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Subscribe to Updates</span>
                    <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Section */}
        <motion.div 
          className="border-t border-gray-800 pt-8 text-center"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-gray-500 text-sm">
              <motion.p whileHover={{ scale: 1.05 }}>
                © {new Date().getFullYear()} DermaScan AI. All rights reserved.
              </motion.p>
              <div className="flex space-x-4">
                <motion.a href="#" className="hover:text-amber-400 transition-colors duration-300" whileHover={{ scale: 1.1 }}>
                  Privacy Policy
                </motion.a>
                <motion.a href="#" className="hover:text-amber-400 transition-colors duration-300" whileHover={{ scale: 1.1 }}>
                  Terms of Service
                </motion.a>
              </div>
            </div>
            
            <motion.div 
              className="flex items-center space-x-3 bg-gray-800 px-4 py-2 rounded-2xl"
              whileHover={{ scale: 1.05 }}
            >
              <FaShieldAlt className="text-green-500" />
              <span className="text-gray-400 text-sm font-medium">
                HIPAA Compliant • 100% Secure
              </span>
            </motion.div>
          </div>
          
          <motion.p 
            className="text-gray-600 text-sm mt-6 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <strong className="text-amber-400">Important:</strong> This application is for informational purposes only and not a substitute for professional medical advice. 
            Always consult qualified healthcare providers for medical diagnosis and treatment.
          </motion.p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;