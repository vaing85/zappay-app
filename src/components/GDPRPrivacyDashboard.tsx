import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore,
  Security,
  PrivacyTip,
  Download,
  Delete,
  Edit,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';

interface ConsentSettings {
  marketing: boolean;
  analytics: boolean;
  personalization: boolean;
  thirdPartySharing: boolean;
  dataProcessing: boolean;
  cookies: boolean;
}

interface UserData {
  personalInfo: any;
  transactionHistory: any[];
  auditLogs: any[];
  kycData: any;
}

const GDPRPrivacyDashboard: React.FC = () => {
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    marketing: false,
    analytics: false,
    personalization: false,
    thirdPartySharing: false,
    dataProcessing: false,
    cookies: false
  });

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [dataRequest, setDataRequest] = useState('');

  useEffect(() => {
    loadConsentSettings();
    loadUserData();
  }, []);

  const loadConsentSettings = async () => {
    try {
      // In a real app, this would fetch from the backend
      const savedSettings = localStorage.getItem('gdpr-consent');
      if (savedSettings) {
        setConsentSettings(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error('Error loading consent settings:', err);
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/gdpr/export-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user-id' // Replace with actual user ID
        })
      });

      const result = await response.json();
      if (result.success) {
        setUserData(result.data);
      } else {
        setError('Failed to load user data');
      }
    } catch (err) {
      setError('Network error loading user data');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = (setting: keyof ConsentSettings) => {
    const newSettings = {
      ...consentSettings,
      [setting]: !consentSettings[setting]
    };
    setConsentSettings(newSettings);
    localStorage.setItem('gdpr-consent', JSON.stringify(newSettings));
    setSuccess('Consent settings updated');
  };

  const handleDataExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/gdpr/export-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user-id' // Replace with actual user ID
        })
      });

      const result = await response.json();
      if (result.success) {
        // Create and download the data file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setSuccess('Data export completed');
        setExportDialogOpen(false);
      } else {
        setError('Failed to export data');
      }
    } catch (err) {
      setError('Network error during data export');
    } finally {
      setLoading(false);
    }
  };

  const handleDataDeletion = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/gdpr/delete-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user-id' // Replace with actual user ID
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Data deletion request submitted');
        setDeleteDialogOpen(false);
        // In a real app, you might want to log the user out here
      } else {
        setError('Failed to submit deletion request');
      }
    } catch (err) {
      setError('Network error during deletion request');
    } finally {
      setLoading(false);
    }
  };

  const handleDataRequest = async () => {
    if (!dataRequest.trim()) {
      setError('Please enter your data request');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would send the request to the backend
      setSuccess('Data request submitted successfully');
      setDataRequest('');
    } catch (err) {
      setError('Failed to submit data request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <PrivacyTip sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4">
          Privacy Dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Consent Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            Consent Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage your privacy preferences and data sharing consent
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={consentSettings.marketing}
                  onChange={() => handleConsentChange('marketing')}
                />
              }
              label="Marketing communications"
            />
            <Typography variant="caption" color="text.secondary">
              Receive promotional emails and offers
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={consentSettings.analytics}
                  onChange={() => handleConsentChange('analytics')}
                />
              }
              label="Analytics and usage data"
            />
            <Typography variant="caption" color="text.secondary">
              Help us improve our service by sharing usage data
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={consentSettings.personalization}
                  onChange={() => handleConsentChange('personalization')}
                />
              }
              label="Personalized experience"
            />
            <Typography variant="caption" color="text.secondary">
              Customize your experience based on your preferences
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={consentSettings.thirdPartySharing}
                  onChange={() => handleConsentChange('thirdPartySharing')}
                />
              }
              label="Third-party data sharing"
            />
            <Typography variant="caption" color="text.secondary">
              Share data with trusted partners for service improvement
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={consentSettings.dataProcessing}
                  onChange={() => handleConsentChange('dataProcessing')}
                />
              }
              label="Data processing for service delivery"
            />
            <Typography variant="caption" color="text.secondary">
              Process your data to provide our services
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={consentSettings.cookies}
                  onChange={() => handleConsentChange('cookies')}
                />
              }
              label="Essential cookies"
            />
            <Typography variant="caption" color="text.secondary">
              Required for basic website functionality
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Data Rights
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Under GDPR, you have the following rights regarding your personal data
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Download color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Right to Access"
                secondary="Download a copy of all your personal data"
              />
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => setExportDialogOpen(true)}
                disabled={loading}
              >
                Export Data
              </Button>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemIcon>
                <Edit color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Right to Rectification"
                secondary="Correct inaccurate or incomplete data"
              />
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => {/* Navigate to profile edit */}}
              >
                Edit Data
              </Button>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemIcon>
                <Delete color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Right to Erasure"
                secondary="Request deletion of your personal data"
              />
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                Delete Data
              </Button>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Data Overview */}
      {userData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Data Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Summary of the personal data we have about you
            </Typography>

            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {userData.transactionHistory?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transactions
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {userData.auditLogs?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Activity Logs
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {userData.kycData ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  KYC Verified
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Data Request Form */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Submit Data Request
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Have a specific question about your data? Submit a request here
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            value={dataRequest}
            onChange={(e) => setDataRequest(e.target.value)}
            placeholder="Describe your data request or question..."
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            onClick={handleDataRequest}
            disabled={loading || !dataRequest.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <Info />}
          >
            Submit Request
          </Button>
        </CardContent>
      </Card>

      {/* Data Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Your Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will download a complete copy of all your personal data in JSON format.
            The download will include:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="Personal information" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="Transaction history" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="Activity logs" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="KYC verification data" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleDataExport}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Download />}
          >
            Download Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Deletion Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Your Data</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Warning sx={{ mr: 1 }} />
            This action cannot be undone. All your personal data will be permanently deleted.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            This will delete:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Delete color="error" />
              </ListItemIcon>
              <ListItemText primary="All personal information" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Delete color="error" />
              </ListItemIcon>
              <ListItemText primary="Transaction history" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Delete color="error" />
              </ListItemIcon>
              <ListItemText primary="Account settings and preferences" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Delete color="error" />
              </ListItemIcon>
              <ListItemText primary="KYC verification data" />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Note: Some data may be retained for legal compliance purposes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDataDeletion}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          >
            Delete All Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GDPRPrivacyDashboard;


