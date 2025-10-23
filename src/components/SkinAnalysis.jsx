// src/components/SkinAnalysis.jsx or your main component
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import { Upload, Analytics, Psychology } from '@mui/icons-material';
import { skinAnalysisAPI } from '../services/api';
import XAIExplanation from './XAIExplanation';
import HeatmapVisualization from './HeatmapVisualization';

const SkinAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Upload Image', 'AI Analysis', 'Explanation & Insights'];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);
    setError('');
    setActiveStep(1);

    try {
      const result = await skinAnalysisAPI.predictSkinDisease(file);
      setAnalysisResult(result);
      setActiveStep(2);
    } catch (err) {
      setError(err.message);
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setActiveStep(0);
    setError('');
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        🩺 Skin Disease Analysis with AI Explanations
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Step 1: Upload */}
      {activeStep === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Upload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Upload Skin Lesion Image
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Upload a clear image of the skin lesion for AI analysis and explanation
            </Typography>
            <Button
              variant="contained"
              component="label"
              size="large"
              sx={{ mt: 2 }}
            >
              Choose Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileUpload}
              />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Loading */}
      {activeStep === 1 && loading && (
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">
              AI is analyzing your image...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Processing image and generating explanations
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {activeStep === 2 && analysisResult && (
        <Box>
          {/* Diagnosis Result */}
          <Card sx={{ mb: 3, bgcolor: analysisResult.diagnosis.isCancer ? 'error.light' : 'success.light' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Diagnosis Result
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" color="primary">
                    {analysisResult.diagnosis.disease}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Primary Diagnosis
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h4" color="primary">
                    {analysisResult.diagnosis.confidence.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confidence Level
                  </Typography>
                </Grid>
              </Grid>
              <Alert 
                severity={analysisResult.diagnosis.isCancer ? "error" : "success"}
                sx={{ mt: 2 }}
              >
                <Typography variant="subtitle1">
                  Cancer Status: {analysisResult.diagnosis.cancerStatus}
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          {/* XAI Explanations */}
          <XAIExplanation 
            explanations={analysisResult.explanations}
            diagnosis={analysisResult.diagnosis}
          />

          {/* Heatmap Visualization */}
          <HeatmapVisualization 
            heatmap={analysisResult.heatmap}
            diagnosis={analysisResult.diagnosis}
          />

          {/* Top Predictions */}
          {analysisResult.top_predictions && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Alternative Diagnoses
                </Typography>
                <Grid container spacing={1}>
                  {analysisResult.top_predictions.map((pred, index) => (
                    <Grid item xs={12} key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {pred.class}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {(pred.confidence * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Reset Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button variant="outlined" onClick={handleReset} size="large">
              Analyze Another Image
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SkinAnalysis;