import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaUserMd, FaStar, FaMapMarkerAlt, FaSearch, FaRegCalendarCheck, FaPhoneAlt, FaEnvelope, FaCrosshairs, FaTimes, FaClinicMedical, FaAward, FaClock, FaDirections } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const doctorIcon = createCustomIcon('red');
const userIcon = createCustomIcon('blue');

// Kolkata Dermatology Database
const KOLKATA_DERMATOLOGY_DATABASE = {
  center: [22.5860, 88.4595], // Newtown, Kolkata
  locations: [
    { id: 1, name: "Newtown, Kolkata", lat: 22.5860, lng: 88.4595 },
    { id: 2, name: "Salt Lake City, Kolkata", lat: 22.5820, lng: 88.4330 },
    { id: 3, name: "Rajarhat, Kolkata", lat: 22.5937, lng: 88.4506 },
    { id: 4, name: "Ultadanga, Kolkata", lat: 22.5739, lng: 88.3845 },
    { id: 5, name: "Park Street, Kolkata", lat: 22.5516, lng: 88.3514 },
    { id: 6, name: "Ballygunge, Kolkata", lat: 22.5274, lng: 88.3571 }
  ],

  specialties: [
    "Skin Cancer Specialist",
    "Acne & Scar Treatment",
    "Cosmetic Dermatology",
    "Pediatric Dermatology",
    "Hair & Scalp Specialist",
    "Laser Treatment Expert"
  ],

  dermatologists: [
    {
      id: 1,
      name: "Dr. Amit Sharma",
      specialty: "Skin Cancer Specialist",
      experience: "15 years",
      rating: 4.8,
      reviews: 234,
      distance: "0.8 km",
      availability: "Available today",
      phone: "+91 98765 43210",
      email: "dramitsharma@kolskinclinic.com",
      bio: "Dr. Amit Sharma is a renowned dermatologist specializing in skin cancer detection and treatment. Trained at AIIMS Delhi, he has extensive experience in dermatoscopy and surgical dermatology.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
      location: "Newtown, Kolkata",
      address: "Plot 345, Action Area I, Newtown, Kolkata - 700156",
      clinic: "Kolkata Skin & Laser Center",
      education: "MBBS, MD - Dermatology, AIIMS Delhi",
      languages: ["English", "Hindi", "Bengali"],
      insurance: ["Cashless Available", "TPA Insurance", "Corporate Health"],
      procedures: ["Skin Cancer Screening", "Biopsy", "MOHS Surgery", "Dermatoscopy"],
      fees: "₹800 - Consultation",
      timing: "Mon-Sat: 10:00 AM - 6:00 PM",
      coordinates: { lat: 22.5870, lng: 88.4600 },
      testimonials: [
        { id: 1, text: "Dr. Sharma detected my skin cancer early. Forever grateful for his expertise.", author: "Priya M.", rating: 5 },
        { id: 2, text: "Very professional and thorough examination. Highly recommended!", author: "Rahul S.", rating: 5 }
      ]
    },
    {
      id: 2,
      name: "Dr. Priyanka Chatterjee",
      specialty: "Acne & Scar Treatment",
      experience: "12 years",
      rating: 4.9,
      reviews: 189,
      distance: "1.2 km",
      availability: "Available tomorrow",
      phone: "+91 98765 43211",
      email: "drpriyanka@dermacarekol.com",
      bio: "Dr. Priyanka Chatterjee specializes in acne treatments and scar revision. She uses advanced laser technologies and has helped thousands of patients achieve clear skin.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      location: "Salt Lake City, Kolkata",
      address: "Sector V, Salt Lake, Kolkata - 700091",
      clinic: "DermaCare Kolkata",
      education: "MBBS, MD - Dermatology, CMC Vellore",
      languages: ["English", "Hindi", "Bengali"],
      insurance: ["All Major Insurances", "Cash Treatment"],
      procedures: ["Laser Acne Treatment", "Chemical Peels", "Microdermabrasion", "PRP Therapy"],
      fees: "₹700 - Consultation",
      timing: "Mon-Sat: 9:00 AM - 5:00 PM",
      coordinates: { lat: 22.5820, lng: 88.4330 },
      testimonials: [
        { id: 3, text: "My acne cleared up completely after 3 months of treatment. Thank you Dr. Priyanka!", author: "Ananya D.", rating: 5 },
        { id: 4, text: "Very patient and explains everything clearly. Wonderful experience.", author: "Sneha R.", rating: 5 }
      ]
    },
    {
      id: 3,
      name: "Dr. Rajiv Banerjee",
      specialty: "Cosmetic Dermatology",
      experience: "18 years",
      rating: 4.7,
      reviews: 312,
      distance: "2.1 km",
      availability: "Available today",
      phone: "+91 98765 43212",
      email: "drrajiv@cosmetidermakol.com",
      bio: "Dr. Rajiv Banerjee is a pioneer in cosmetic dermatology in Eastern India. He has trained internationally and brings the latest aesthetic treatments to Kolkata.",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
      location: "Rajarhat, Kolkata",
      address: "Rajarhat Main Road, Near Axis Mall, Kolkata - 700135",
      clinic: "CosmetiDerma Advanced",
      education: "MBBS, DVD - Dermatology, London UK",
      languages: ["English", "Hindi", "Bengali"],
      insurance: ["Direct Billing", "Insurance Claims"],
      procedures: ["Botox", "Fillers", "Laser Hair Removal", "Skin Tightening"],
      fees: "₹1000 - Consultation",
      timing: "Tue-Sun: 11:00 AM - 7:00 PM",
      coordinates: { lat: 22.5937, lng: 88.4506 },
      testimonials: [
        { id: 5, text: "Best cosmetic treatments in Kolkata. Natural looking results every time.", author: "Moumita S.", rating: 5 },
        { id: 6, text: "Dr. Banerjee is an artist! Completely transformed my skin.", author: "Arindam C.", rating: 4 }
      ]
    }
  ]
};

// Haversine formula to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance.toFixed(1);
};

// Leaflet Map Component
const LeafletMap = ({ dermatologists, selectedDoc, userCoords, onDoctorSelect }) => {
  const center = userCoords || KOLKATA_DERMATOLOGY_DATABASE.center;

  // Component to handle map view changes
  const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border-2 border-blue-500/30">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '400px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        {userCoords && (
          <Marker position={userCoords} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
                <br />
                <small>You are here</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dermatologist Markers */}
        {dermatologists.map((doc) => (
          <Marker
            key={doc.id}
            position={[doc.coordinates.lat, doc.coordinates.lng]}
            icon={doctorIcon}
            eventHandlers={{
              click: () => {
                onDoctorSelect(doc);
              },
            }}
          >
            <Popup>
              <div className="max-w-xs">
                <h4 className="font-bold text-blue-900 text-sm mb-1">{doc.name}</h4>
                <p className="text-gray-600 text-xs mb-2">{doc.specialty}</p>
                <p className="text-gray-700 text-xs mb-2">{doc.clinic}</p>
                <p className="text-green-600 text-xs font-semibold mb-3">{doc.distance} away</p>
                <div className="flex gap-2">
                  <a
                    href={`tel:${doc.phone}`}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    Call
                  </a>
                  <button
                    onClick={() => {
                      const url = `https://www.openstreetmap.org/directions?engine=osrm_car&route=${userCoords ? `${userCoords[0]},${userCoords[1]}` : '22.5860,88.4595'};${doc.coordinates.lat},${doc.coordinates.lng}`;
                      window.open(url, '_blank');
                    }}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                  >
                    Directions
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Change view when doctor is selected */}
        {selectedDoc && (
          <ChangeView 
            center={[selectedDoc.coordinates.lat, selectedDoc.coordinates.lng]} 
            zoom={15} 
          />
        )}
      </MapContainer>
    </div>
  );
};

// Main DermatologistFinder Component
const DermatologistFinder = () => {
  const [location, setLocation] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Calculate distances and sort dermatologists by proximity
  const dermatologistsWithDistance = useMemo(() => {
    if (!userCoords) return KOLKATA_DERMATOLOGY_DATABASE.dermatologists;
    
    return KOLKATA_DERMATOLOGY_DATABASE.dermatologists.map(doc => {
      const distance = calculateDistance(
        userCoords[0], 
        userCoords[1], 
        doc.coordinates.lat, 
        doc.coordinates.lng
      );
      return {
        ...doc,
        distance: `${distance} km`,
        distanceNum: parseFloat(distance)
      };
    }).sort((a, b) => a.distanceNum - b.distanceNum);
  }, [userCoords]);

  const filteredDermatologists = useMemo(() => {
    let filtered = dermatologistsWithDistance;
    
    if (location.trim()) {
      filtered = filtered.filter(doc => 
        doc.location.toLowerCase().includes(location.toLowerCase()) ||
        doc.address.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (selectedSpecialty) {
      filtered = filtered.filter(doc => 
        doc.specialty === selectedSpecialty
      );
    }
    
    return filtered;
  }, [location, selectedSpecialty, dermatologistsWithDistance]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSelectedDoc(null);
    
    // If location matches our database, set coordinates
    const matchedLocation = KOLKATA_DERMATOLOGY_DATABASE.locations.find(
      loc => loc.name.toLowerCase().includes(location.toLowerCase())
    );
    
    if (matchedLocation) {
      setUserCoords([matchedLocation.lat, matchedLocation.lng]);
    } else if (location.trim()) {
      // Default to Newtown coordinates if no match
      setUserCoords(KOLKATA_DERMATOLOGY_DATABASE.center);
    }
    
    setResults(filteredDermatologists);
  };

  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords([latitude, longitude]);
          setLocation("Your Current Location");
          setResults(filteredDermatologists);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to Newtown coordinates
          setUserCoords(KOLKATA_DERMATOLOGY_DATABASE.center);
          setLocation("Newtown, Kolkata");
          setResults(filteredDermatologists);
          setIsLoadingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
    }
  };

  const handleQuickLocation = (cityName) => {
    setLocation(cityName);
    const matchedLocation = KOLKATA_DERMATOLOGY_DATABASE.locations.find(
      loc => loc.name === cityName
    );
    if (matchedLocation) {
      setUserCoords([matchedLocation.lat, matchedLocation.lng]);
    }
    setResults(filteredDermatologists);
  };

  const handleDoctorSelectFromMap = (doctor) => {
    setSelectedDoc(doctor);
  };

  const clearFilters = () => {
    setLocation('');
    setSelectedSpecialty('');
    setResults([]);
    setSelectedDoc(null);
    setUserCoords(null);
  };

  const openDirections = (doc) => {
    const { lat, lng } = doc.coordinates;
    const url = `https://www.openstreetmap.org/directions?engine=osrm_car&route=${userCoords ? `${userCoords[0]},${userCoords[1]}` : '22.5860,88.4595'};${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 min-h-screen text-white relative font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-900/20 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-900/20 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/10 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-300 border border-gray-700/50">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-800/50 text-cyan-300 font-medium mb-6 border border-cyan-500/30 backdrop-blur-sm">
              <FaUserMd className="mr-2" />
              Find Dermatologists
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Find Dermatologists in Kolkata
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Connect with the best skin specialists in Newtown, Kolkata and nearby areas
            </p>
          </div>

          {/* Quick Location Buttons */}
          <div className="mb-10">
            <h4 className="text-sm font-semibold text-gray-400 mb-6 text-center tracking-wide">POPULAR AREAS IN KOLKATA</h4>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {KOLKATA_DERMATOLOGY_DATABASE.locations.slice(0, 6).map(city => (
                <motion.button
                  key={city.id}
                  onClick={() => handleQuickLocation(city.name)}
                  className="bg-blue-800/50 hover:bg-blue-700/50 text-cyan-300 px-6 py-4 rounded-2xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl border border-cyan-500/30 backdrop-blur-sm"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaMapMarkerAlt className="inline mr-3 text-cyan-400" />
                  {city.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center mb-10 gap-6">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="text-cyan-400 text-xl" />
              </div>
              <input
                type="text"
                placeholder="Enter your area in Kolkata (e.g., Newtown, Salt Lake, Park Street...)"
                className="pl-14 w-full bg-gray-700/50 border-2 border-gray-600/50 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-lg text-white placeholder-gray-400 shadow-inner transition-all backdrop-blur-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                list="kolkata-locations"
              />
              <datalist id="kolkata-locations">
                {KOLKATA_DERMATOLOGY_DATABASE.locations.map(loc => (
                  <option key={loc.id} value={loc.name} />
                ))}
              </datalist>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <motion.button
                type="button"
                onClick={handleGetCurrentLocation}
                className="bg-blue-800/50 hover:bg-blue-700/50 text-cyan-300 p-5 rounded-2xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl border border-cyan-500/30 backdrop-blur-sm"
                title="Use my current location"
                disabled={isLoadingLocation}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoadingLocation ? (
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaCrosshairs className="text-xl" />
                )}
              </motion.button>
              <motion.button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-5 rounded-2xl font-semibold flex items-center shadow-xl transition-all duration-200 hover:scale-[1.02] flex-1 md:flex-none justify-center transform hover:shadow-2xl text-lg border border-cyan-500/30"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaSearch className="mr-4 text-lg" /> Search Dermatologists
              </motion.button>
            </div>
          </form>

          {/* Specialty Filter */}
          <div className="mb-10">
            <h4 className="text-sm font-semibold text-gray-400 mb-6 text-center tracking-wide">FILTER BY SPECIALIZATION</h4>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                onClick={() => setSelectedSpecialty('')}
                className={`px-6 py-4 rounded-2xl font-medium transition-all duration-200 ${
                  selectedSpecialty === '' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 shadow-lg border border-gray-600/50'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                All Specialties
              </motion.button>
              {KOLKATA_DERMATOLOGY_DATABASE.specialties.map((specialty, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-6 py-4 rounded-2xl font-medium transition-all duration-200 ${
                    selectedSpecialty === specialty 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 shadow-lg border border-gray-600/50'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {specialty}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          {(location || selectedSpecialty) && (
            <motion.div 
              className="flex flex-col sm:flex-row justify-between items-center mb-10 p-6 bg-blue-900/30 rounded-2xl border border-cyan-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-gray-300 text-center sm:text-left mb-3 sm:mb-0 text-lg">
                🎯 Found <span className="font-bold text-cyan-400 text-xl">{filteredDermatologists.length}</span> dermatologists
                {location && ` near ${location}`}
                {selectedSpecialty && ` specializing in ${selectedSpecialty}`}
                {userCoords && ` • Sorted by distance`}
              </p>
              <motion.button
                onClick={clearFilters}
                className="text-red-400 hover:text-red-300 font-medium bg-gray-700/50 px-5 py-3 rounded-xl border border-red-500/30 hover:bg-red-900/20 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Dermatologists List */}
            <div className="space-y-8 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
              <h4 className="font-bold text-white mb-8 text-2xl sticky top-0 bg-gray-800/80 backdrop-blur-sm z-10 py-6 border-b border-gray-700/50 rounded-2xl px-4">
                {results.length > 0 ? "👨‍⚕️ Available Dermatologists" : "🔍 Search for Dermatologists"}
              </h4>
              
              {results.length > 0 ? (
                results.map(doc => (
                  <motion.div
                    key={doc.id}
                    className={`flex items-start p-8 bg-gray-700/30 backdrop-blur-sm rounded-2xl hover:bg-blue-900/30 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl border-2 ${
                      selectedDoc?.id === doc.id ? 'border-cyan-500 bg-blue-900/30' : 'border-gray-600/30'
                    }`}
                    onClick={() => setSelectedDoc(doc)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img 
                      src={doc.image} 
                      alt={doc.name} 
                      className="w-24 h-24 rounded-2xl object-cover mr-6 border-4 border-cyan-500/50 shadow-lg" 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-white text-2xl">{doc.name}</h4>
                        <span className="bg-green-900/50 text-green-300 font-semibold px-4 py-2 rounded-xl border border-green-500/30">
                          {doc.distance}
                        </span>
                      </div>
                      <p className="text-cyan-300 font-semibold text-lg mb-3">{doc.specialty}</p>
                      <p className="text-gray-300 text-base mb-4 leading-relaxed">{doc.clinic} • {doc.experience}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 mr-3">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < Math.floor(doc.rating) ? "text-yellow-400" : "text-gray-600"}
                                size={16}
                              />
                            ))}
                          </div>
                          <span className="text-gray-300 text-base font-medium">
                            {doc.rating} ({doc.reviews} reviews)
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6 text-base text-gray-300">
                          <span className="flex items-center bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-500/30">
                            <FaMapMarkerAlt className="inline text-cyan-400 mr-2" />
                            {doc.location}
                          </span>
                          <span className="flex items-center bg-green-900/30 px-4 py-2 rounded-xl border border-green-500/30">
                            <FaRegCalendarCheck className="inline text-green-400 mr-2" />
                            {doc.availability}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-gradient-to-br from-gray-800/30 to-blue-900/20 rounded-3xl shadow-inner border-2 border-dashed border-cyan-500/30 backdrop-blur-sm">
                  <div className="w-28 h-28 mx-auto mb-8 bg-gray-700/50 rounded-full flex items-center justify-center animate-bounce-slow shadow-xl border border-cyan-500/30">
                    <FaUserMd className="text-cyan-400 text-5xl" />
                  </div>
                  <h4 className="font-bold text-white text-2xl mb-4">Find Kolkata's Best Dermatologists</h4>
                  <p className="text-gray-300 font-medium text-lg mb-4 leading-relaxed">Enter your location to discover certified skin specialists near you</p>
                  <p className="text-gray-400 text-base">
                    Try searching for: <span className="text-cyan-400 font-medium">"Newtown"</span>, 
                    <span className="text-cyan-400 font-medium"> "Salt Lake"</span>, or 
                    <span className="text-cyan-400 font-medium"> "Park Street"</span>
                  </p>
                </div>
              )}
            </div>

            {/* Map and Doctor Details Section */}
            <div className="space-y-8">
              {/* Leaflet Map */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
                <h4 className="font-bold text-white mb-6 text-2xl flex items-center gap-4">
                  <FaMapMarkerAlt className="text-cyan-400 text-2xl" />
                  Dermatologists Map - Kolkata
                </h4>
                <LeafletMap 
                  dermatologists={filteredDermatologists}
                  selectedDoc={selectedDoc}
                  userCoords={userCoords}
                  onDoctorSelect={handleDoctorSelectFromMap}
                />
                <p className="text-gray-400 text-base mt-4 text-center leading-relaxed">
                  💡 Click on red markers to see doctor details and get directions
                </p>
              </div>

              {/* Selected Dermatologist Profile */}
              {selectedDoc && (
                <motion.div 
                  className="bg-gradient-to-br from-gray-800/50 to-blue-900/30 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-cyan-500/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-700/50">
                    <img 
                      src={selectedDoc.image} 
                      alt={selectedDoc.name} 
                      className="w-24 h-24 rounded-2xl border-4 border-cyan-400 shadow-xl object-cover" 
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-2xl mb-3">{selectedDoc.name}</h4>
                      <p className="text-cyan-300 font-semibold text-lg mb-3">{selectedDoc.specialty}</p>
                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400 mr-4">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < Math.floor(selectedDoc.rating) ? "text-yellow-400" : "text-gray-600"}
                              size={16}
                            />
                          ))}
                        </div>
                        <span className="text-gray-300 font-medium text-base">
                          {selectedDoc.rating} ({selectedDoc.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-base text-gray-300">
                        <span className="flex items-center bg-blue-900/50 px-4 py-2 rounded-xl border border-blue-500/30">
                          <FaMapMarkerAlt className="inline text-cyan-400 mr-2" />
                          {selectedDoc.distance} away
                        </span>
                        <span className="flex items-center bg-green-900/50 px-4 py-2 rounded-xl border border-green-500/30">
                          <FaRegCalendarCheck className="inline text-green-400 mr-2" />
                          {selectedDoc.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div>
                        <strong className="text-cyan-300 text-lg">Clinic:</strong>
                        <p className="text-gray-300 text-base mt-1">{selectedDoc.clinic}</p>
                      </div>
                      <div>
                        <strong className="text-cyan-300 text-lg">Address:</strong>
                        <p className="text-gray-300 text-base mt-1 leading-relaxed">{selectedDoc.address}</p>
                      </div>
                      <div>
                        <strong className="text-cyan-300 text-lg">Timing:</strong>
                        <p className="text-gray-300 text-base mt-1">{selectedDoc.timing}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <strong className="text-cyan-300 text-lg">Fees:</strong>
                        <p className="text-gray-300 text-base mt-1">{selectedDoc.fees}</p>
                      </div>
                      <div>
                        <strong className="text-cyan-300 text-lg">Languages:</strong>
                        <p className="text-gray-300 text-base mt-1">{selectedDoc.languages.join(', ')}</p>
                      </div>
                      <div className="flex gap-3">
                        <a 
                          href={`tel:${selectedDoc.phone}`} 
                          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex-1 justify-center"
                        >
                          <FaPhoneAlt /> Call
                        </a>
                        <button
                          onClick={() => openDirections(selectedDoc)}
                          className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex-1 justify-center"
                        >
                          <FaDirections /> Directions
                        </button>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] shadow-xl text-lg border border-cyan-500/30"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📅 Book Appointment
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedDoc && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              className="bg-gray-800 p-10 rounded-3xl shadow-2xl max-w-md w-full relative border border-cyan-500/30 backdrop-blur-lg"
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-8 right-8 text-gray-400 hover:text-gray-200 transition text-2xl"
                onClick={() => setShowBookingModal(false)}
              >
                <FaTimes />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-white mb-3">
                  Book with {selectedDoc.name}
                </h3>
                <p className="text-cyan-300 text-lg mb-2">{selectedDoc.specialty}</p>
                <p className="text-gray-400 text-base">{selectedDoc.clinic}</p>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-cyan-300 font-semibold mb-3 text-lg">Your Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-gray-400"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan-300 font-semibold mb-3 text-lg">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full p-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-gray-400"
                      placeholder="+91"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan-300 font-semibold mb-3 text-lg">Email</label>
                    <input 
                      type="email" 
                      className="w-full p-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-gray-400"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-cyan-300 font-semibold mb-3 text-lg">Preferred Date</label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white"
                  />
                </div>

                <div>
                  <label className="block text-cyan-300 font-semibold mb-3 text-lg">Medical Concern</label>
                  <textarea 
                    className="w-full p-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-gray-400" 
                    rows="4"
                    placeholder="Briefly describe your skin concern..."
                  ></textarea>
                </div>

                <motion.button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl text-lg border border-cyan-500/30"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirm Appointment Request
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>
        {`
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(31, 41, 55, 0.5);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(6, 182, 212, 0.5);
            border-radius: 10px;
            border: 2px solid rgba(31, 41, 55, 0.5);
        }
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
            animation: bounce-slow 2s infinite;
        }
        `}
      </style>
    </section>
  );
};

export default DermatologistFinder;