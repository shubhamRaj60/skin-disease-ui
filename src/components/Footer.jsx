// src/components/Footer.jsx
import React from 'react';
import { FaHeartbeat, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const diseases = [
    "Melanoma", "Psoriasis", "Eczema", "Acne", "Rosacea", 
    "Basal Cell Carcinoma", "Actinic Keratosis", "Tinea"
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <FaHeartbeat className="text-white text-xl" />
              </div>
              <div className="ml-3">
                <h3 className="text-xl font-bold">DermaScan<span className="text-blue-400">AI</span></h3>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Advanced AI technology for skin health assessment and treatment recommendations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaFacebookF />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaLinkedinIn />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaInstagram />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Home</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition">How It Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Skin Diseases</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Diseases We Detect</h4>
            <div className="grid grid-cols-2 gap-2">
              {diseases.map((disease, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  {disease}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3" />
                <span>123 Medical Drive, Health City, HC 54321</span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="mr-3" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3" />
                <span>support@dermascanai.com</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 border border-gray-700 bg-gray-800 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg font-medium">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} DermaScan AI. All rights reserved. | Privacy Policy | Terms of Service</p>
          <p className="mt-2">This application is for informational purposes only and not a substitute for professional medical advice.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;