// src/components/HeatmapVisualization.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const HeatmapVisualization = ({ heatmap, originalImage, diagnosis }) => {
  const canvasRef = useRef(null);
  const [heatmapImage, setHeatmapImage] = useState(null);

  useEffect(() => {
    if (heatmap && canvasRef.current) {
      drawHeatmap(heatmap);
    }
  }, [heatmap]);

  const drawHeatmap = (heatmapData) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create heatmap visualization
    const width = canvas.width;
    const height = canvas.height;
    
    // Create gradient for heatmap
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'blue');
    gradient.addColorStop(0.5, 'green');
    gradient.addColorStop(1, 'red');
    
    // Draw heatmap
    const cellWidth = width / heatmapData[0].length;
    const cellHeight = height / heatmapData.length;
    
    for (let y = 0; y < heatmapData.length; y++) {
      for (let x = 0; x < heatmapData[y].length; x++) {
        const intensity = heatmapData[y][x];
        
        // Convert intensity to color
        ctx.fillStyle = intensity > 0.7 ? 'rgba(255, 0, 0, 0.6)' :
                        intensity > 0.4 ? 'rgba(255, 165, 0, 0.5)' :
                        intensity > 0.2 ? 'rgba(255, 255, 0, 0.4)' :
                        'rgba(0, 255, 0, 0.3)';
        
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
    
    // Convert to image
    setHeatmapImage(canvas.toDataURL());
  };

  if (!heatmap) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            Heatmap Visualization
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Heatmap not available for this analysis.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔍 AI Attention Heatmap
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Red areas show where the AI focused most attention for diagnosis
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            style={{ 
              border: '2px solid #ddd',
              borderRadius: '8px',
              display: 'none' // Hide canvas, we'll use the image
            }}
          />
          
          {heatmapImage && (
            <Box sx={{ textAlign: 'center' }}>
              <img 
                src={heatmapImage} 
                alt="AI Attention Heatmap"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  border: '2px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
                <Typography variant="caption" color="error">
                  🔴 High Attention
                </Typography>
                <Typography variant="caption" color="warning.main">
                  🟡 Medium Attention
                </Typography>
                <Typography variant="caption" color="success.main">
                  🟢 Low Attention
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default HeatmapVisualization;