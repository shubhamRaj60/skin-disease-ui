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
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border-2 border-blue-200">
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
    <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen text-gray-800 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-300 border border-blue-100">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4 tracking-tight">
              🩺 Find Dermatologists in Kolkata
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with the best skin specialists in Newtown, Kolkata and nearby areas.
            </p>
          </div>

          {/* Quick Location Buttons */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-600 mb-4 text-center">POPULAR AREAS IN KOLKATA</h4>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {KOLKATA_DERMATOLOGY_DATABASE.locations.slice(0, 6).map(city => (
                <button
                  key={city.id}
                  onClick={() => handleQuickLocation(city.name)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg border border-blue-200"
                >
                  <FaMapMarkerAlt className="inline mr-2" />
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center mb-8 gap-4">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="text-gray-400 text-lg" />
              </div>
              <input
                type="text"
                placeholder="Enter your area in Kolkata (e.g., Newtown, Salt Lake, Park Street...)"
                className="pl-12 w-full bg-gray-50 border-2 border-gray-200 rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-inner transition-all"
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
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-4 rounded-full transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg border border-blue-200"
                title="Use my current location"
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaCrosshairs className="text-lg" />
                )}
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold flex items-center shadow-lg transition-all duration-200 hover:scale-[1.02] flex-1 md:flex-none justify-center transform hover:shadow-xl"
              >
                <FaSearch className="mr-3" /> Search Dermatologists
              </button>
            </div>
          </form>

          {/* Specialty Filter */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-600 mb-4 text-center">FILTER BY SPECIALIZATION</h4>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedSpecialty('')}
                className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSpecialty === '' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
                }`}
              >
                All Specialties
              </button>
              {KOLKATA_DERMATOLOGY_DATABASE.specialties.map((specialty, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedSpecialty === specialty 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          {(location || selectedSpecialty) && (
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <p className="text-gray-700 text-center sm:text-left mb-2 sm:mb-0">
                🎯 Found <span className="font-bold text-blue-600 text-lg">{filteredDermatologists.length}</span> dermatologists
                {location && ` near ${location}`}
                {selectedSpecialty && ` specializing in ${selectedSpecialty}`}
                {userCoords && ` • Sorted by distance`}
              </p>
              <button
                onClick={clearFilters}
                className="text-red-500 hover:text-red-700 text-sm font-medium bg-white px-4 py-2 rounded-full border border-red-200 hover:bg-red-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Dermatologists List */}
            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
              <h4 className="font-bold text-blue-900 mb-6 text-2xl sticky top-0 bg-white z-10 py-4 border-b border-gray-200">
                {results.length > 0 ? "👨‍⚕️ Available Dermatologists" : "🔍 Search for Dermatologists"}
              </h4>
              
              {results.length > 0 ? (
                results.map(doc => (
                  <motion.div
                    key={doc.id}
                    className={`flex items-start p-6 bg-white rounded-2xl hover:bg-blue-50 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl border-2 ${
                      selectedDoc?.id === doc.id ? 'border-blue-500 bg-blue-50' : 'border-white'
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
                      className="w-20 h-20 rounded-2xl object-cover mr-5 border-4 border-blue-200 shadow-md" 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-blue-800 text-xl">{doc.name}</h4>
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {doc.distance}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">{doc.specialty}</p>
                      <p className="text-gray-600 text-sm mb-3">{doc.clinic} • {doc.experience}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex text-yellow-500 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < Math.floor(doc.rating) ? "text-yellow-500" : "text-gray-300"}
                                size={14}
                              />
                            ))}
                          </div>
                          <span className="text-gray-600 text-sm font-medium">
                            {doc.rating} ({doc.reviews} reviews)
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <FaMapMarkerAlt className="inline text-blue-500 mr-1" />
                            {doc.location}
                          </span>
                          <span className="flex items-center">
                            <FaRegCalendarCheck className="inline text-green-500 mr-1" />
                            {doc.availability}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-inner border-2 border-dashed border-blue-200">
                  <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center animate-bounce-slow shadow-lg border border-blue-200">
                    <FaUserMd className="text-blue-500 text-4xl" />
                  </div>
                  <h4 className="font-bold text-blue-800 text-xl mb-3">Find Kolkata's Best Dermatologists</h4>
                  <p className="text-gray-600 font-medium mb-2">Enter your location to discover certified skin specialists near you</p>
                  <p className="text-gray-500 text-sm">
                    Try searching for: <span className="text-blue-600 font-medium">"Newtown"</span>, 
                    <span className="text-blue-600 font-medium"> "Salt Lake"</span>, or 
                    <span className="text-blue-600 font-medium"> "Park Street"</span>
                  </p>
                </div>
              )}
            </div>

            {/* Map and Doctor Details Section */}
            <div className="space-y-6">
              {/* Leaflet Map */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-4 text-xl flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-500" />
                  Dermatologists Map - Kolkata
                </h4>
                <LeafletMap 
                  dermatologists={filteredDermatologists}
                  selectedDoc={selectedDoc}
                  userCoords={userCoords}
                  onDoctorSelect={handleDoctorSelectFromMap}
                />
                <p className="text-gray-600 text-sm mt-3 text-center">
                  💡 Click on red markers to see doctor details and get directions
                </p>
              </div>

              {/* Selected Dermatologist Profile */}
              {selectedDoc && (
                <motion.div 
                  className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
                    <img 
                      src={selectedDoc.image} 
                      alt={selectedDoc.name} 
                      className="w-20 h-20 rounded-2xl border-4 border-blue-400 shadow-lg object-cover" 
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-900 text-xl mb-2">{selectedDoc.name}</h4>
                      <p className="text-gray-700 font-semibold mb-2">{selectedDoc.specialty}</p>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-500 mr-3">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < Math.floor(selectedDoc.rating) ? "text-yellow-500" : "text-gray-300"}
                              size={14}
                            />
                          ))}
                        </div>
                        <span className="text-gray-600 font-medium">
                          {selectedDoc.rating} ({selectedDoc.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                          <FaMapMarkerAlt className="inline text-blue-500 mr-1" />
                          {selectedDoc.distance} away
                        </span>
                        <span className="flex items-center bg-green-100 px-3 py-1 rounded-full">
                          <FaRegCalendarCheck className="inline text-green-500 mr-1" />
                          {selectedDoc.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-3">
                      <div>
                        <strong className="text-gray-700">Clinic:</strong>
                        <p className="text-gray-600 text-sm">{selectedDoc.clinic}</p>
                      </div>
                      <div>
                        <strong className="text-gray-700">Address:</strong>
                        <p className="text-gray-600 text-sm">{selectedDoc.address}</p>
                      </div>
                      <div>
                        <strong className="text-gray-700">Timing:</strong>
                        <p className="text-gray-600 text-sm">{selectedDoc.timing}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <strong className="text-gray-700">Fees:</strong>
                        <p className="text-gray-600 text-sm">{selectedDoc.fees}</p>
                      </div>
                      <div>
                        <strong className="text-gray-700">Languages:</strong>
                        <p className="text-gray-600 text-sm">{selectedDoc.languages.join(', ')}</p>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={`tel:${selectedDoc.phone}`} 
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-all duration-200 shadow-md flex-1 justify-center"
                        >
                          <FaPhoneAlt /> Call
                        </a>
                        <button
                          onClick={() => openDirections(selectedDoc)}
                          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-all duration-200 shadow-md flex-1 justify-center"
                        >
                          <FaDirections /> Directions
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg"
                  >
                    📅 Book Appointment
                  </button>
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
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full relative border border-blue-100"
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition text-xl"
                onClick={() => setShowBookingModal(false)}
              >
                <FaTimes />
              </button>
              
              <div className="text-center mb-2">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">
                  Book with {selectedDoc.name}
                </h3>
                <p className="text-gray-600 mb-1">{selectedDoc.specialty}</p>
                <p className="text-sm text-gray-500">{selectedDoc.clinic}</p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Your Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="+91"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Preferred Date</label>
                  <input 
                    type="date" 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Medical Concern</label>
                  <textarea 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    rows="3"
                    placeholder="Briefly describe your skin concern..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl text-lg"
                >
                  Confirm Appointment Request
                </button>
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
            background: #f1f5f9;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #94a3b8;
            border-radius: 10px;
            border: 2px solid #f1f5f9;
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