import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  CloudUpload, 
  CheckCircle, 
  Error, 
  CameraAlt, 
  Description,
  Security,
  VerifiedUser
} from '@mui/icons-material';

interface DocumentUploadProps {
  onVerificationComplete: (result: any) => void;
  onClose: () => void;
}

interface DocumentData {
  type: string;
  frontImage: string | null;
  backImage: string | null;
  selfieImage: string | null;
  documentNumber: string;
}

const KYCDocumentUpload: React.FC<DocumentUploadProps> = ({ onVerificationComplete, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [documents, setDocuments] = useState<DocumentData>({
    type: 'passport',
    frontImage: null,
    backImage: null,
    selfieImage: null,
    documentNumber: ''
  });
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'approved' | 'rejected'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    'Select Document Type',
    'Upload Front Image',
    'Upload Back Image',
    'Take Selfie',
    'Enter Document Number',
    'Verification'
  ];

  const documentTypes = [
    { value: 'passport', label: 'Passport', icon: <Description /> },
    { value: 'drivers_license', label: 'Driver\'s License', icon: <Description /> },
    { value: 'national_id', label: 'National ID', icon: <Description /> }
  ];

  const handleDocumentTypeChange = (type: string) => {
    setDocuments(prev => ({ ...prev, type }));
    setError(null);
  };

  const handleFileUpload = (file: File, imageType: 'frontImage' | 'backImage' | 'selfieImage') => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setDocuments(prev => ({ ...prev, [imageType]: result }));
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageCapture = (imageType: 'frontImage' | 'backImage' | 'selfieImage') => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'frontImage' | 'backImage' | 'selfieImage') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, imageType);
    }
  };

  const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocuments(prev => ({ ...prev, documentNumber: e.target.value }));
  };

  const handlePreviewImage = (image: string, type: string) => {
    setPreviewImage(image);
    setPreviewType(type);
  };

  const handleNext = () => {
    if (activeStep === 0 && !documents.type) {
      setError('Please select a document type');
      return;
    }
    if (activeStep === 1 && !documents.frontImage) {
      setError('Please upload the front image of your document');
      return;
    }
    if (activeStep === 2 && !documents.backImage) {
      setError('Please upload the back image of your document');
      return;
    }
    if (activeStep === 3 && !documents.selfieImage) {
      setError('Please take a selfie for verification');
      return;
    }
    if (activeStep === 4 && !documents.documentNumber) {
      setError('Please enter your document number');
      return;
    }

    setError(null);
    setActiveStep(prev => prev + 1);

    // Start verification on last step
    if (activeStep === 4) {
      handleVerification();
    }
  };

  const handleBack = () => {
    setError(null);
    setActiveStep(prev => prev - 1);
  };

  const handleVerification = async () => {
    setUploading(true);
    setVerificationStatus('verifying');
    setError(null);

    try {
      const response = await fetch('/api/compliance/kyc/verify-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user-id', // Replace with actual user ID
          documentData: {
            documentType: documents.type,
            documentNumber: documents.documentNumber,
            frontImage: documents.frontImage,
            backImage: documents.backImage,
            selfieImage: documents.selfieImage
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setVerificationStatus(result.verification.status === 'approved' ? 'approved' : 'rejected');
        onVerificationComplete(result);
      } else {
        setError(result.message || 'Verification failed');
        setVerificationStatus('rejected');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setVerificationStatus('rejected');
    } finally {
      setUploading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Document Type
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose the type of identity document you want to verify
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {documentTypes.map((doc) => (
                <Card
                  key={doc.value}
                  sx={{
                    cursor: 'pointer',
                    border: documents.type === doc.value ? 2 : 1,
                    borderColor: documents.type === doc.value ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => handleDocumentTypeChange(doc.value)}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {doc.icon}
                    <Typography variant="h6">{doc.label}</Typography>
                    {documents.type === doc.value && <CheckCircle color="primary" />}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Front Image
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Take a clear photo of the front of your {documentTypes.find(d => d.value === documents.type)?.label}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {documents.frontImage ? (
                <Box>
                  <img
                    src={documents.frontImage}
                    alt="Front document"
                    style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 8 }}
                    onClick={() => handlePreviewImage(documents.frontImage!, 'Front Image')}
                  />
                  <Box display="flex" gap={1} mt={1}>
                    <Button
                      variant="outlined"
                      startIcon={<CameraAlt />}
                      onClick={() => handleImageCapture('frontImage')}
                    >
                      Retake
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Different
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    border: 2,
                    borderStyle: 'dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Upload Front Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to upload or drag and drop
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CameraAlt />}
                    sx={{ mt: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageCapture('frontImage');
                    }}
                  >
                    Take Photo
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Back Image
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Take a clear photo of the back of your {documentTypes.find(d => d.value === documents.type)?.label}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {documents.backImage ? (
                <Box>
                  <img
                    src={documents.backImage}
                    alt="Back document"
                    style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 8 }}
                    onClick={() => handlePreviewImage(documents.backImage!, 'Back Image')}
                  />
                  <Box display="flex" gap={1} mt={1}>
                    <Button
                      variant="outlined"
                      startIcon={<CameraAlt />}
                      onClick={() => handleImageCapture('backImage')}
                    >
                      Retake
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Different
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    border: 2,
                    borderStyle: 'dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Upload Back Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to upload or drag and drop
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CameraAlt />}
                    sx={{ mt: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageCapture('backImage');
                    }}
                  >
                    Take Photo
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Take Selfie
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Take a clear selfie for identity verification
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {documents.selfieImage ? (
                <Box>
                  <img
                    src={documents.selfieImage}
                    alt="Selfie"
                    style={{ width: '100%', maxWidth: 300, height: 'auto', borderRadius: 8 }}
                    onClick={() => handlePreviewImage(documents.selfieImage!, 'Selfie')}
                  />
                  <Box display="flex" gap={1} mt={1}>
                    <Button
                      variant="outlined"
                      startIcon={<CameraAlt />}
                      onClick={() => handleImageCapture('selfieImage')}
                    >
                      Retake
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    border: 2,
                    borderStyle: 'dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => handleImageCapture('selfieImage')}
                >
                  <CameraAlt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Take Selfie
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to take a photo with your camera
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Enter Document Number
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the document number from your {documentTypes.find(d => d.value === documents.type)?.label}
            </Typography>
            <Box component="form" noValidate>
              <input
                type="text"
                value={documents.documentNumber}
                onChange={handleDocumentNumberChange}
                placeholder="Enter document number"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </Box>
          </Box>
        );

      case 5:
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Verification in Progress
            </Typography>
            {verificationStatus === 'verifying' && (
              <Box>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Verifying your documents...
                </Typography>
              </Box>
            )}
            {verificationStatus === 'approved' && (
              <Box>
                <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="success.main" gutterBottom>
                  Verification Successful!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your identity has been verified successfully.
                </Typography>
              </Box>
            )}
            {verificationStatus === 'rejected' && (
              <Box>
                <Error sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                <Typography variant="h6" color="error.main" gutterBottom>
                  Verification Failed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please try again with clearer images.
                </Typography>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
          Identity Verification
        </Typography>
        <IconButton onClick={onClose}>
          <Error />
        </IconButton>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={uploading || verificationStatus === 'verifying'}
        >
          {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </Box>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (activeStep === 1) handleFileUpload(file, 'frontImage');
            if (activeStep === 2) handleFileUpload(file, 'backImage');
          }
        }}
      />
      <input
        type="file"
        ref={cameraInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (activeStep === 1) handleCameraChange(e, 'frontImage');
            if (activeStep === 2) handleCameraChange(e, 'backImage');
            if (activeStep === 3) handleCameraChange(e, 'selfieImage');
          }
        }}
      />

      {/* Image preview dialog */}
      <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="md">
        <DialogTitle>{previewType}</DialogTitle>
        <DialogContent>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewImage(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KYCDocumentUpload;


