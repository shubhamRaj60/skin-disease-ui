// src/components/XAIExplanation.jsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Grid,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  ExpandMore,
  Warning,
  Info,
  Description,
  Security,
  Psychology,
  Visibility,
  Analytics,
  Image,
  GridOn, // Changed from HeatMap to GridOn
  Whatshot, // Alternative heatmap icon
  Palette // Another alternative
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './XAIExplanation.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const XAIExplanation = ({ explanations, diagnosis }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Use optional chaining for robust data access
  const dynamicExplanations = explanations?.dynamic || {};
  const confidenceData = dynamicExplanations.confidenceBreakdown || {};
  const keyFindings = dynamicExplanations.keyFindings || [];
  
  // Extract XAI visualization data from explanations
  const xaiData = explanations?.xai_explanations || {};
  const { 
    superimposed_image, 
    grad_cam_heatmap, 
    top_features = [],
    explanation_text
  } = xaiData;

  // Debug: Log the data to see what's available
  console.log('XAI Data:', xaiData);
  console.log('Dynamic Explanations:', dynamicExplanations);
  console.log('Diagnosis:', diagnosis);

  // Determine the primary confidence score
  const primaryConfidence = confidenceData.modelConfidence || diagnosis?.confidence || 0;

  if (!diagnosis || !diagnosis.disease) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body1">
          Analysis data is not available. Please run a new analysis.
        </Typography>
      </Alert>
    );
  }

  // Helper function for title formatting
  const formatFeatureName = (feature) => {
    return feature
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ mt: 3, mb: 5 }}>
        {/* --- Section Header --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, borderBottom: '2px solid', borderColor: 'divider', pb: 1 }}>
          <Psychology color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h4" component="h2" color="text.primary" fontWeight="bold">
            AI Explanation & Clinical Insights
          </Typography>
        </Box>

        {/* --- AI Visualization Section --- */}
        {(superimposed_image || grad_cam_heatmap) ? (
          <Card sx={{ mb: 3, borderRadius: '12px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Whatshot color="primary" sx={{ mr: 1 }} /> 
                <Typography variant="h6" color="primary" fontWeight="medium">
                  AI Attention Visualization
                </Typography>
              </Box>

              {/* Visualization Tabs */}
              <Paper sx={{ mb: 2, borderRadius: '8px' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': { fontWeight: 'bold' },
                    '& .Mui-selected': { color: 'primary.main' }
                  }}
                >
                  <Tab 
                    icon={<Image />} 
                    label="Heatmap Overlay" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<GridOn />}  
                    label="Raw Heatmap" 
                    iconPosition="start"
                  />
                </Tabs>
              </Paper>

              {/* Visualization Display */}
              <Box sx={{ textAlign: 'center', p: 2 }}>
                {activeTab === 0 && superimposed_image && (
                  <Box>
                    <img 
                      src={superimposed_image} 
                      alt="Grad-CAM Heatmap Overlay"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '2px solid #e0e0e0',
                        maxHeight: '400px'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      🔍 Heatmap overlay shows areas where the AI focused for diagnosis
                    </Typography>
                  </Box>
                )}
                
                {activeTab === 1 && grad_cam_heatmap && (
                  <Box>
                    <img 
                      src={grad_cam_heatmap} 
                      alt="Raw Grad-CAM Heatmap"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '2px solid #e0e0e0',
                        maxHeight: '400px'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      🔥 Raw heatmap showing AI attention intensity
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Heatmap Interpretation Guide */}
              <Alert severity="info" sx={{ mt: 2, borderRadius: '8px' }}>
                <Typography variant="body2" fontWeight="bold">
                  How to interpret the heatmap:
                </Typography>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  <Typography variant="body2" component="li">
                    <strong>🔴 Red areas:</strong> High AI attention - most influential regions
                  </Typography>
                  <Typography variant="body2" component="li">
                    <strong>🟡 Yellow areas:</strong> Moderate attention
                  </Typography>
                  <Typography variant="body2" component="li">
                    <strong>🔵 Blue areas:</strong> Low attention - less influential
                  </Typography>
                </Box>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
            <Typography variant="body2">
              🔍 Heatmap visualization is not available for this analysis. 
              The AI explanation is based on the model's confidence scores and detected features.
            </Typography>
          </Alert>
        )}

        {/* --- Visuals and Rationale Grid --- */}
        <Grid container spacing={3}>
          {/* Visual Analysis */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'primary.main', borderRadius: '12px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Visibility color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary" fontWeight="medium">
                    Visual Analysis
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {explanation_text || dynamicExplanations.visualExplanation || 
                    "The AI analyzed visual patterns in the skin lesion to make this diagnosis."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Clinical Rationale */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'secondary.main', borderRadius: '12px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Description color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="secondary" fontWeight="medium">
                    Clinical Rationale
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {dynamicExplanations.clinicalRationale || 
                    "This diagnosis is based on established medical patterns for skin conditions."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Safety Information Alert */}
          <Grid item xs={12}>
            <Alert 
              severity={diagnosis.isCancer ? "error" : "warning"}
              icon={<Warning />}
              sx={{ 
                alignItems: 'center', 
                borderRadius: '12px'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'inherit' }}>
                    🚨 Critical Safety Warning
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'inherit', lineHeight: 1.5 }}>
                    {dynamicExplanations.safetyInformation || 
                      (diagnosis.isCancer 
                        ? "URGENT: This condition requires immediate professional medical evaluation. Please consult a dermatologist as soon as possible."
                        : "Regular monitoring is recommended. Consult a healthcare professional for any changes.")}
                  </Typography>
                </Box>
                <Chip 
                  label={diagnosis.isCancer ? "HIGH PRIORITY" : "MONITOR"} 
                  color={diagnosis.isCancer ? "error" : "warning"}
                  sx={{ ml: 2, fontWeight: 'bold' }}
                />
              </Box>
            </Alert>
          </Grid>
        </Grid>

        {/* --- Confidence Breakdown --- */}
        {top_features.length > 0 && (
          <Card sx={{ mt: 3, borderRadius: '12px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Analytics color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary" fontWeight="medium">
                  Confidence Breakdown by Condition
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {top_features.map((feature, index) => {
                  const [className, confidenceValue] = feature.includes(':') 
                    ? feature.split(': ') 
                    : [feature, '0'];
                  const confidencePercent = parseFloat(confidenceValue);
                  
                  return (
                    <Grid item xs={12} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: 200, fontWeight: 'medium' }}>
                          {className}
                        </Typography>
                        <Box sx={{ flex: 1, mx: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={confidencePercent}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: 'grey.300',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: confidencePercent > 70 ? '#4caf50' : 
                                                confidencePercent > 40 ? '#ff9800' : '#2196f3'
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body1" fontWeight="bold" sx={{ minWidth: 60 }}>
                          {confidencePercent.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* --- Key Findings Accordion --- */}
        <Accordion sx={{ mt: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px !important' }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Analytics color="action" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Detected Medical Features
                {keyFindings.length > 0 && (
                  <Chip 
                    label={`${keyFindings.length} features found`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ ml: 1, fontWeight: 'bold' }}
                  />
                )}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
            {keyFindings.length > 0 ? (
              <Grid container spacing={3}>
                {keyFindings.map((finding, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card elevation={2} sx={{ height: '100%', borderRadius: '8px' }}>
                      <CardContent>
                        {/* Feature Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                            {formatFeatureName(finding.finding)}
                          </Typography>
                          <Chip 
                            label={`${(finding.confidence * 100).toFixed(0)}%`}
                            color={finding.confidence > 0.7 ? "success" : finding.confidence > 0.4 ? "warning" : "info"}
                            size="small"
                          />
                        </Box>
                        
                        {/* Significance */}
                        <Typography variant="body2" sx={{ 
                          fontStyle: 'italic',
                          bgcolor: 'action.hover',
                          p: 1,
                          borderRadius: 1,
                          mb: 1
                        }}>
                          <strong>Significance:</strong> {finding.significance}
                        </Typography>

                        {/* Description */}
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {finding.description}
                        </Typography>
                        
                        {/* Confidence Bar */}
                        <Box sx={{ mt: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Confidence Level
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={finding.confidence * 100}
                            sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.300' }}
                          />
                          <Typography variant="caption" fontWeight="bold" align="right" display="block" sx={{ mt: 0.5 }}>
                              {(finding.confidence * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Info color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  No specific medical features were strongly correlated with this diagnosis.
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        {/* --- Overall Confidence Card --- */}
        <Card sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
          mt: 3,
          borderRadius: '12px'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Security sx={{ mr: 1, color: 'white' }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Overall Confidence Score
              </Typography>
            </Box>
            
            <Grid container spacing={3} alignItems="center">
              {/* Overall Confidence (Centerpiece) */}
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 1, borderRight: { sm: '1px solid rgba(255,255,255,0.3)' } }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                    {primaryConfidence.toFixed(1)}%
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', opacity: 0.9 }}>
                    Overall Result Confidence
                  </Typography>
                </Box>
              </Grid>
              
              {/* Breakdown Bars */}
              <Grid item xs={12} sm={8}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                      { label: 'Core Model Confidence', value: confidenceData.modelConfidence || diagnosis?.confidence || 0 },
                      { label: 'Feature Consistency', value: confidenceData.featureConsistency || 0 },
                      { label: 'Clinical Correlation', value: confidenceData.clinicalCorrelation || 0 }
                  ].map((item) => (
                      <Box key={item.label}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                                  {item.label}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
                                  {(item.value).toFixed(1)}%
                              </Typography>
                          </Box>
                          <LinearProgress 
                              variant="determinate" 
                              value={item.value * 100} 
                              sx={{ height: 6, borderRadius: 3, bgcolor: 'primary.light' }}
                          />
                      </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Final Disclaimer */}
        <Alert severity="info" sx={{ mt: 3, border: '1px solid', borderColor: 'info.main', borderRadius: '12px' }}>
          <Typography variant="body2">
            <strong>Final Disclaimer:</strong> This AI explanation is for informational purposes only. 
            It should not be used as a substitute for professional medical advice, diagnosis, or treatment. 
            Always consult with qualified healthcare providers for medical concerns.
          </Typography>
        </Alert>
      </Box>
    </ThemeProvider>
  );
};

export default XAIExplanation;