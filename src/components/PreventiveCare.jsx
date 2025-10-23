import React, { useState, useEffect } from 'react';

const PreventiveCare = () => {
  const [careInfo, setCareInfo] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState('general');

  useEffect(() => {
    fetchPreventiveCare(selectedDisease);
  }, [selectedDisease]);

  const fetchPreventiveCare = async (disease) => {
    try {
      const response = await fetch(`http://localhost:5001/api/preventive-care?disease=${disease}`);
      const data = await response.json();
      setCareInfo(data);
    } catch (error) {
      console.error('Error fetching preventive care:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Skin Health Prevention & Care</h1>
          <p className="text-lg text-gray-600">Learn how to protect your skin and recognize early signs</p>
        </div>

        {/* Disease Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Select Disease Type</h3>
          <div className="flex flex-wrap gap-2">
            {['general', 'Melanoma', 'Basal Cell Carcinoma'].map((disease) => (
              <button
                key={disease}
                onClick={() => setSelectedDisease(disease)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedDisease === disease
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {disease === 'general' ? 'General Prevention' : disease}
              </button>
            ))}
          </div>
        </div>

        {careInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prevention Tips */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-4">Prevention Tips</h3>
              <ul className="space-y-2">
                {careInfo.prevention_tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Factors */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-4">Risk Factors</h3>
              <ul className="space-y-2">
                {careInfo.risk_factors.map((factor, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span className="text-gray-700">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Early Signs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-4">Early Signs</h3>
              <ul className="space-y-2">
                {careInfo.early_signs.map((sign, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span className="text-gray-700">{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Additional Resources */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Monthly Self-Exam Guide</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use full-length and hand mirrors</li>
                <li>• Check all areas including scalp and between toes</li>
                <li>• Look for new moles or changes in existing ones</li>
                <li>• Document findings with photos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">When to See a Doctor</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Any new, changing, or unusual skin growth</li>
                <li>• A sore that doesn't heal within 4 weeks</li>
                <li>• A mole that differs from others (ugly duckling sign)</li>
                <li>• Family history of skin cancer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreventiveCare;