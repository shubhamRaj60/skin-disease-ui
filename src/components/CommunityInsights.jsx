import React, { useState, useEffect } from 'react';

const CommunityInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityInsights();
  }, []);

  const fetchCommunityInsights = async (period = 'month') => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/community-insights?period=${period}`);
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching community insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">Loading community insights...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Health Insights</h1>
          <p className="text-lg text-gray-600">Anonymous statistics from our community skin health scans</p>
        </div>

        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">📊 Scan Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Scans:</span>
                  <span className="font-semibold">{insights.total_scans}</span>
                </div>
                <div className="flex justify-between">
                  <span>Benign Lesions:</span>
                  <span className="text-green-600 font-semibold">
                    {insights.benign.percentage}% ({insights.benign.count})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Required Attention:</span>
                  <span className="text-red-600 font-semibold">
                    {insights.malignant.percentage}% ({insights.malignant.count})
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">💡 Health Tips</h3>
              <div className="space-y-2">
                {insights.health_tips.map((tip, index) => (
                  <p key={index} className="text-sm text-gray-700">{tip}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Why Community Insights Matter</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">🔍</div>
              <h4 className="font-semibold mb-2">Early Detection</h4>
              <p className="text-sm text-gray-600">Community data helps identify patterns for early intervention</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">👥</div>
              <h4 className="font-semibold mb-2">Public Health</h4>
              <p className="text-sm text-gray-600">Anonymous statistics contribute to skin health awareness</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-semibold mb-2">Trend Analysis</h4>
              <p className="text-sm text-gray-600">Track seasonal variations and regional patterns in skin health</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityInsights;