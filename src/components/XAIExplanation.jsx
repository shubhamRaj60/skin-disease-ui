// src/components/XAIExplanation.jsx
import React, { useState, useMemo, useEffect } from 'react';
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
  Container,
  Fade,
  Zoom,
  Stack,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Warning,
  Description,
  Security,
  Psychology,
  Visibility,
  Analytics,
  Image,
  GridOn,
  Whatshot,
  LocalHospital,
  Healing,
  Biotech,
  Science,
  MedicalServices,
  Coronavirus,
  TrendingUp,
  Balance,
  PrecisionManufacturing
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import './XAIExplanation.css';

// Enhanced medical-themed color palette with better symmetry
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    tertiary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    info: {
      main: '#06b6d4',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 4,
        },
      },
    },
  },
});

// Helper function to normalize confidence scores
const normalizeConfidence = (score) => {
  if (typeof score !== 'number') return 0;
  
  if (score > 1) {
    return Math.min(score / 100, 1);
  }
  
  return Math.min(Math.max(score, 0), 1);
};

// Symmetrical card component for consistent styling
const SymmetricalCard = ({ children, gradient, borderColor, hover = true, ...props }) => (
  <Card 
    sx={{
      borderRadius: 3,
      background: gradient || 'linear-gradient(145deg, #1e293b 0%, #334155 100%)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      border: borderColor ? `1px solid ${borderColor}` : '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      transition: hover ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
      '&:hover': hover ? {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
      } : {},
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Card>
);

// Symmetrical section header component
const SectionHeader = ({ icon: Icon, title, subtitle, color = 'primary' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
    <Icon sx={{ 
      fontSize: 32, 
      color: `${color}.main`, 
      mr: 2,
      borderRadius: 2,
      p: 0.5,
      bgcolor: `rgba(var(--mui-palette-${color}-mainChannel) / 0.1)`
    }} />
    <Box>
      <Typography variant="h5" color={`${color}.main`} fontWeight="bold">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const XAIExplanation = ({ explanations, diagnosis }) => {
  const [activeTab, setActiveTab] = useState(null);

  const dynamicExplanations = useMemo(
    () => explanations?.dynamic || {},
    [explanations]
  );

  const confidenceData = useMemo(
    () => dynamicExplanations.confidenceBreakdown || {},
    [dynamicExplanations]
  );

  const keyFindings = useMemo(
    () => dynamicExplanations.keyFindings || [],
    [dynamicExplanations]
  );
  
  const xaiData = useMemo(
    () => explanations?.xai_explanations || {},
    [explanations]
  );
  const { 
    superimposed_image, 
    grad_cam_heatmap, 
    top_features = [],
    explanation_text,
    confidence_scores = {}
  } = xaiData;

  const availableTabs = useMemo(() => {
    const tabs = [];

    if (superimposed_image) {
      tabs.push({ value: 'overlay', label: 'Heatmap Overlay', icon: Image });
    }

    if (grad_cam_heatmap) {
      tabs.push({ value: 'heatmap', label: 'Raw Heatmap', icon: GridOn });
    }

    return tabs;
  }, [superimposed_image, grad_cam_heatmap]);

  useEffect(() => {
    if (availableTabs.length === 0) {
      if (activeTab !== null) {
        setActiveTab(null);
      }
      return;
    }

    if (!availableTabs.some((tab) => tab.value === activeTab)) {
      setActiveTab(availableTabs[0].value);
    }
  }, [availableTabs, activeTab]);

  const tabValue = useMemo(() => {
    const matchingTab = availableTabs.find((tab) => tab.value === activeTab);
    return matchingTab ? matchingTab.value : availableTabs[0]?.value ?? false;
  }, [availableTabs, activeTab]);

  const tabsReady = useMemo(
    () => Boolean(tabValue && availableTabs.some((tab) => tab.value === tabValue)),
    [tabValue, availableTabs]
  );

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug('XAIExplanation Tabs state', {
        availableTabs,
        activeTab,
        tabValue,
        tabsReady,
        hasOverlay: Boolean(superimposed_image),
        hasHeatmap: Boolean(grad_cam_heatmap)
      });
    }
  }, [availableTabs, activeTab, tabValue, tabsReady, superimposed_image, grad_cam_heatmap]);

  const normalizedConfidence = useMemo(() => {
    const modelConfidence = confidenceData.modelConfidence || diagnosis?.confidence || 0;
    return normalizeConfidence(modelConfidence);
  }, [confidenceData.modelConfidence, diagnosis?.confidence]);

  const normalizedConfidenceScores = useMemo(() => {
    const scores = {};
    Object.entries(confidence_scores).forEach(([key, value]) => {
      scores[key] = normalizeConfidence(value);
    });
    return scores;
  }, [confidence_scores]);

  const normalizedKeyFindings = useMemo(() => {
    return keyFindings.map(finding => ({
      ...finding,
      confidence: normalizeConfidence(finding.confidence)
    }));
  }, [keyFindings]);

  if (!diagnosis || !diagnosis.disease) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Alert severity="info" sx={{ maxWidth: 500, borderRadius: 3 }}>
          <Typography variant="body1">
            Analysis data is not available. Please run a new analysis.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const formatFeatureName = (feature) => {
    return feature
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getTopConditions = () => {
    if (top_features.length > 0) {
      return top_features;
    }
    
    const scores = Object.entries(normalizedConfidenceScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name, score]) => ({
        name,
        score: (score * 100).toFixed(1)
      }));
    
    return scores.length > 0 ? scores : [
      {
        name: diagnosis.disease,
        score: (normalizedConfidence * 100).toFixed(1)
      }
    ];
  };

  const confidenceBreakdownItems = [
    { 
      label: 'Core Model Confidence', 
      value: normalizedConfidence * 100,
      description: 'Primary AI model prediction confidence',
      icon: PrecisionManufacturing,
      color: 'primary'
    },
    { 
      label: 'Feature Consistency', 
      value: normalizeConfidence(confidenceData.featureConsistency) * 100,
      description: 'Consistency of detected medical features',
      icon: Balance,
      color: 'secondary'
    },
    { 
      label: 'Clinical Correlation', 
      value: normalizeConfidence(confidenceData.clinicalCorrelation) * 100,
      description: 'Alignment with clinical patterns',
      icon: TrendingUp,
      color: 'tertiary'
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`,
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
          py: 4
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4} sx={{ mt: 3, mb: 5 }}>

            {/* Enhanced Symmetrical Header */}
            <Fade in timeout={800}>
              <SymmetricalCard
                gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                hover={false}
              >
                <CardContent sx={{ p: 4, position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                    <Science sx={{ fontSize: 120 }} />
                  </Box>
                  <Grid container alignItems="center" spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        <LocalHospital sx={{ fontSize: 48, mr: 3 }} />
                        <Box>
                          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom color="white">
                            AI Medical Analysis Report
                          </Typography>
                          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }} color="white">
                            Comprehensive AI-powered diagnosis with visual explanations for {diagnosis.disease}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                      <Chip 
                        label={diagnosis.isCancer ? "HIGH PRIORITY" : "ROUTINE CHECK"} 
                        sx={{ 
                          backgroundColor: diagnosis.isCancer ? '#ef4444' : '#10b981',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          px: 3,
                          py: 1,
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </SymmetricalCard>
            </Fade>

            {/* AI Visualization Section - Improved Symmetry */}
            {availableTabs.length > 0 && tabsReady ? (
              <SymmetricalCard>
                <CardContent sx={{ p: 4 }}>
                    <SectionHeader
                      icon={Whatshot}
                      title="AI Attention Visualization"
                      subtitle="See exactly where the AI is focusing on your skin image"
                    />

                    {/* Enhanced Symmetrical Tabs */}
                    <Paper 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        overflow: 'hidden'
                      }}
                    >
                      <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                          '& .MuiTab-root': { 
                            fontWeight: 'bold',
                            py: 2,
                            fontSize: '1rem',
                            textTransform: 'none',
                            minHeight: '64px',
                            color: 'text.secondary'
                          },
                          '& .Mui-selected': { 
                            color: 'primary.main',
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)'
                          }
                        }}
                      >
                        {availableTabs.map((tab) => (
                          <Tab
                            key={tab.value}
                            value={tab.value}
                            icon={<tab.icon sx={{ fontSize: 24, mb: 0.5 }} />}
                            label={tab.label}
                            iconPosition="top"
                          />
                        ))}
                      </Tabs>
                    </Paper>

                    {/* Symmetrical Visualization Display */}
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                      {tabValue === 'overlay' && superimposed_image && (
                        <Fade in timeout={500}>
                          <Box>
                            <img 
                              src={superimposed_image} 
                              alt="Grad-CAM Heatmap Overlay"
                              style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '16px',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                                border: '3px solid #334155',
                                maxHeight: '450px'
                              }}
                            />
                            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                              <a href={superimposed_image} target="_blank" rel="noopener noreferrer" aria-label="Open overlay in new tab">
                                <Chip label="Open Full Size" color="primary" variant="outlined" clickable />
                              </a>
                              <a href={superimposed_image} download="xai_overlay.png" aria-label="Download overlay image">
                                <Chip label="Download" color="secondary" variant="outlined" clickable />
                              </a>
                            </Stack>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                              🎯 Heatmap overlay shows medically relevant areas the AI focused on for diagnosis
                            </Typography>
                          </Box>
                        </Fade>
                      )}
                      
                      {tabValue === 'heatmap' && grad_cam_heatmap && (
                        <Fade in timeout={500}>
                          <Box>
                            <img 
                              src={grad_cam_heatmap} 
                              alt="Raw Grad-CAM Heatmap"
                              style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '16px',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                                border: '3px solid #334155',
                                maxHeight: '450px'
                              }}
                            />
                            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                              <a href={grad_cam_heatmap} target="_blank" rel="noopener noreferrer" aria-label="Open heatmap in new tab">
                                <Chip label="Open Full Size" color="primary" variant="outlined" clickable />
                              </a>
                              <a href={grad_cam_heatmap} download="xai_heatmap.png" aria-label="Download heatmap image">
                                <Chip label="Download" color="secondary" variant="outlined" clickable />
                              </a>
                            </Stack>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                              🔥 Raw heatmap showing AI attention intensity across the lesion
                            </Typography>
                          </Box>
                        </Fade>
                      )}
                    </Box>

                    {/* Symmetrical Heatmap Interpretation Guide */}
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mt: 3, 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                        border: '1px solid #3b82f6'
                      }}
                      icon={<Biotech sx={{ fontSize: 24 }} />}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        🔬 How to Interpret the Medical Heatmap
                      </Typography>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ width: 20, height: 20, backgroundColor: '#ef4444', borderRadius: '50%', mr: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
                            <Typography variant="body2" fontWeight="bold">
                              Red Areas: High AI Attention
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                            Most influential regions for diagnosis
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ width: 20, height: 20, backgroundColor: '#f59e0b', borderRadius: '50%', mr: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
                            <Typography variant="body2" fontWeight="bold">
                              Yellow Areas: Moderate Attention
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                            Supporting features for diagnosis
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ width: 20, height: 20, backgroundColor: '#3b82f6', borderRadius: '50%', mr: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
                            <Typography variant="body2" fontWeight="bold">
                              Blue Areas: Low Attention
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                            Less influential regions
                          </Typography>
                        </Grid>
                      </Grid>
                    </Alert>
                  </CardContent>
              </SymmetricalCard>
            ) : availableTabs.length === 0 ? (
              <Fade in timeout={800}>
                <Alert 
                  severity="warning" 
                  sx={{ 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
                    border: '1px solid #f59e0b'
                  }}
                  icon={<Healing sx={{ fontSize: 24 }} />}
                >
                  <Typography variant="body1" fontWeight="medium">
                    🔍 Heatmap visualization is being processed. 
                    The AI explanation below is based on comprehensive analysis of visual patterns and medical features.
                  </Typography>
                </Alert>
              </Fade>
            ) : null}

            {/* Enhanced Symmetrical Analysis Grid */}
            <Grid container spacing={3}>
              {/* Visual Analysis */}
              <Grid item xs={12} md={6}>
                <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
                  <SymmetricalCard
                    gradient="linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                    borderColor="rgba(59, 130, 246, 0.3)"
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ p: 3, height: '100%' }}>
                      <SectionHeader
                        icon={Visibility}
                        title="Visual Pattern Analysis"
                        color="primary"
                      />
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {explanation_text || dynamicExplanations.visualExplanation || 
                          "The AI has analyzed complex visual patterns in the skin lesion, including texture, color distribution, border characteristics, and structural features to arrive at this medical diagnosis."}
                      </Typography>
                    </CardContent>
                  </SymmetricalCard>
                </Fade>
              </Grid>

              {/* Clinical Rationale */}
              <Grid item xs={12} md={6}>
                <Fade in timeout={800} style={{ transitionDelay: '400ms' }}>
                  <SymmetricalCard
                    gradient="linear-gradient(135deg, #1e293b 0%, #064e3b 100%)"
                    borderColor="rgba(16, 185, 129, 0.3)"
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ p: 3, height: '100%' }}>
                      <SectionHeader
                        icon={Description}
                        title="Clinical Assessment"
                        color="secondary"
                      />
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {dynamicExplanations.clinicalRationale || 
                          "This diagnosis aligns with established dermatological patterns and clinical guidelines. The AI has compared the lesion characteristics against thousands of validated medical cases."}
                      </Typography>
                    </CardContent>
                  </SymmetricalCard>
                </Fade>
              </Grid>
            </Grid>

            {/* Enhanced Safety Alert with Better Symmetry */}
            <Fade in timeout={800} style={{ transitionDelay: '600ms' }}>
              <Alert 
                severity={diagnosis.isCancer ? "error" : "warning"}
                icon={<Warning sx={{ fontSize: 28 }} />}
                sx={{ 
                  borderRadius: 3,
                  background: diagnosis.isCancer 
                    ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
                    : 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
                  border: diagnosis.isCancer ? '1px solid #ef4444' : '1px solid #f59e0b',
                  py: 2
                }}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} md={9}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'inherit', mb: 1 }}>
                      {diagnosis.isCancer ? "🚨 URGENT MEDICAL ATTENTION REQUIRED" : "⚠️ MEDICAL MONITORING ADVISED"}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'inherit', lineHeight: 1.6 }}>
                      {dynamicExplanations.safetyInformation || 
                        (diagnosis.isCancer 
                          ? "This analysis indicates characteristics consistent with potentially serious skin conditions. Immediate consultation with a dermatologist is strongly recommended."
                          : "Regular monitoring and professional medical evaluation are advised to detect any changes over time.")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ textAlign: { md: 'right' } }}>
                    <Chip 
                      label={diagnosis.isCancer ? "HIGH PRIORITY" : "ROUTINE CHECK"} 
                      color={diagnosis.isCancer ? "error" : "warning"}
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        px: 2,
                        py: 1,
                      }}
                    />
                  </Grid>
                </Grid>
              </Alert>
            </Fade>

            {/* Confidence Breakdown - Improved Symmetry */}
            {getTopConditions().length > 0 && (
              <Fade in timeout={1000} style={{ transitionDelay: '800ms' }}>
                <SymmetricalCard>
                  <CardContent sx={{ p: 4 }}>
                    <SectionHeader
                      icon={Analytics}
                      title="Confidence Breakdown by Condition"
                      subtitle="AI confidence scores for different potential diagnoses"
                    />
                    
                    <Stack spacing={2}>
                      {getTopConditions().map((condition, index) => {
                        const confidencePercent = typeof condition === 'object' 
                          ? parseFloat(condition.score) 
                          : parseFloat(condition.split(': ')[1]) * 100;
                        
                        const displayName = typeof condition === 'object' 
                          ? condition.name 
                          : condition.split(': ')[0];
                        
                        return (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
                            <Typography variant="body1" sx={{ minWidth: 250, fontWeight: 'medium', fontSize: '1.1rem' }}>
                              {displayName}
                            </Typography>
                            <Box sx={{ flex: 1, mx: 3 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(confidencePercent, 100)}
                                sx={{ 
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: confidencePercent > 70 ? '#10b981' : 
                                                    confidencePercent > 40 ? '#f59e0b' : '#3b82f6',
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 80, textAlign: 'right' }}>
                              {Math.min(confidencePercent, 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                      The AI evaluated multiple conditions based on visual characteristics and patterns.
                    </Typography>
                  </CardContent>
                </SymmetricalCard>
              </Fade>
            )}

            {/* Enhanced Key Findings with Better Symmetry */}
            <Fade in timeout={1000} style={{ transitionDelay: '1000ms' }}>
              <SymmetricalCard>
                <CardContent sx={{ p: 0 }}>
                  <Accordion 
                    sx={{ 
                      background: 'transparent',
                      boxShadow: 'none',
                      '&:before': { display: 'none' }
                    }}
                  >
                    <AccordionSummary 
                      expandIcon={<ExpandMore sx={{ fontSize: 32, color: 'white' }} />}
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        p: 3,
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <MedicalServices sx={{ mr: 2, fontSize: 28 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            Detected Medical Features
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Detailed analysis of identified medical characteristics
                          </Typography>
                        </Box>
                        {normalizedKeyFindings.length > 0 && (
                          <Chip 
                            label={`${normalizedKeyFindings.length} features`} 
                            sx={{ 
                              backgroundColor: 'rgba(255,255,255,0.2)', 
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3 }}>
                      {normalizedKeyFindings.length > 0 ? (
                        <Grid container spacing={2}>
                          {normalizedKeyFindings.map((finding, index) => (
                            <Grid item xs={12} md={6} lg={4} key={index}>
                              <SymmetricalCard 
                                sx={{ height: '100%' }}
                                gradient="linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                              >
                                <CardContent sx={{ p: 2.5, height: '100%' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ fontSize: '1rem' }}>
                                      {formatFeatureName(finding.finding)}
                                    </Typography>
                                    <Chip 
                                      label={`${(finding.confidence * 100).toFixed(0)}%`}
                                      color={finding.confidence > 0.7 ? "success" : finding.confidence > 0.4 ? "warning" : "info"}
                                      size="small"
                                      sx={{ fontWeight: 'bold', minWidth: 60 }}
                                    />
                                  </Box>
                                  
                                  <Typography variant="body2" color="text.secondary" sx={{ 
                                    fontStyle: 'italic',
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    p: 1.5,
                                    borderRadius: 1,
                                    mb: 2,
                                    borderLeft: '3px solid',
                                    borderColor: finding.confidence > 0.7 ? 'success.main' : finding.confidence > 0.4 ? 'warning.main' : 'info.main',
                                    fontSize: '0.875rem'
                                  }}>
                                    <strong>Significance:</strong> {finding.significance}
                                  </Typography>

                                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.875rem', mb: 2 }}>
                                    {finding.description}
                                  </Typography>
                                  
                                  <Box sx={{ mt: 'auto' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                      <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                        Confidence
                                      </Typography>
                                      <Typography variant="caption" fontWeight="bold" color="text.primary">
                                        {(finding.confidence * 100).toFixed(1)}%
                                      </Typography>
                                    </Box>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={finding.confidence * 100}
                                      sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                      }}
                                    />
                                  </Box>
                                </CardContent>
                              </SymmetricalCard>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Coronavirus color="disabled" sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Specific Medical Features Detected
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            The diagnosis is based on overall pattern analysis.
                          </Typography>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </SymmetricalCard>
            </Fade>

            {/* Enhanced Overall Confidence with Perfect Symmetry */}
            <Fade in timeout={1000} style={{ transitionDelay: '1200ms' }}>
              <SymmetricalCard
                gradient="linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)"
                hover={false}
              >
                <CardContent sx={{ p: 4 }}>
                  <SectionHeader
                    icon={Security}
                    title="Overall Diagnostic Confidence"
                    color="info"
                  />
                  
                  <Grid container spacing={4} alignItems="center">
                    {/* Overall Confidence */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h2" fontWeight="bold" sx={{ color: 'white', fontSize: '4rem', mb: 1 }}>
                          {(normalizedConfidence * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white', opacity: 0.9, fontWeight: 400 }}>
                          Overall Confidence
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, mt: 1 }}>
                          Based on comprehensive AI analysis
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* Confidence Breakdown */}
                    <Grid item xs={12} md={8}>
                      <Stack spacing={3}>
                        {confidenceBreakdownItems.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <Box key={item.label}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <IconComponent sx={{ 
                                  mr: 2, 
                                  color: 'white',
                                  opacity: 0.9,
                                  fontSize: 20
                                }} />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 'medium' }}>
                                    {item.label}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                                    {item.description}
                                  </Typography>
                                </Box>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: 'white', minWidth: 60, textAlign: 'right' }}>
                                  {item.value.toFixed(1)}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(item.value, 100)}
                                sx={{ 
                                  bgcolor: 'rgba(255,255,255,0.2)',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: 'white'
                                  }
                                }}
                              />
                            </Box>
                          );
                        })}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </SymmetricalCard>
            </Fade>

            {/* Final Disclaimer */}
            <Fade in timeout={1000} style={{ transitionDelay: '1400ms' }}>
              <Alert 
                severity="info" 
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'info.main', 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
                }}
              >
                <Typography variant="body2">
                  <strong>Medical Disclaimer:</strong> This AI explanation is for informational purposes only. 
                  It should not be used as a substitute for professional medical advice, diagnosis, or treatment. 
                  Always consult with qualified healthcare providers for medical concerns.
                </Typography>
              </Alert>
            </Fade>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default XAIExplanation;