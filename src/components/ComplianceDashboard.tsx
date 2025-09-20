import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  Security,
  Warning,
  CheckCircle,
  Error,
  TrendingUp,
  People,
  AttachMoney,
  Assessment,
  Download,
  Refresh,
  FilterList,
  Search
} from '@mui/icons-material';

interface ComplianceMetrics {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  suspiciousActivities: number;
  totalTransactions: number;
  totalVolume: number;
  complianceScore: number;
  ctrFilingCount: number;
  sarFilingCount: number;
}

interface SuspiciousActivity {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  riskScore: number;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  description: string;
}

interface ComplianceReport {
  id: string;
  type: string;
  period: {
    start: string;
    end: string;
  };
  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
  generatedBy: string;
}

const ComplianceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<SuspiciousActivity | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      // Load metrics
      const metricsResponse = await fetch('/api/compliance/metrics');
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

      // Load suspicious activities
      const activitiesResponse = await fetch('/api/compliance/suspicious-activities');
      const activitiesData = await activitiesResponse.json();
      setSuspiciousActivities(activitiesData);

      // Load reports
      const reportsResponse = await fetch('/api/compliance/reports');
      const reportsData = await reportsResponse.json();
      setReports(reportsData);
    } catch (err) {
      setError('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType: string, startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          reportType
        })
      });

      const result = await response.json();
      if (result.success) {
        setReports(prev => [...prev, result.report]);
        setReportDialogOpen(false);
      } else {
        setError('Failed to generate report');
      }
    } catch (err) {
      setError('Network error generating report');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewActivity = async (activityId: string, action: string) => {
    try {
      const response = await fetch(`/api/compliance/suspicious-activities/${activityId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        setSuspiciousActivities(prev =>
          prev.map(activity =>
            activity.id === activityId
              ? { ...activity, status: action as any }
              : activity
          )
        );
      }
    } catch (err) {
      setError('Failed to update activity status');
    }
  };

  const filteredActivities = suspiciousActivities.filter(activity => {
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      activity.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'error';
    if (riskScore >= 60) return 'warning';
    if (riskScore >= 40) return 'info';
    return 'success';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  if (loading && !metrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          <Security sx={{ mr: 2, verticalAlign: 'middle' }} />
          Compliance Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadComplianceData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={() => setReportDialogOpen(true)}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <People color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{metrics.totalUsers}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1 sm:col-span-2 md:col-span-3">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CheckCircle color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{metrics.verifiedUsers}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Verified Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1 sm:col-span-2 md:col-span-3">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Warning color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{metrics.suspiciousActivities}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Suspicious Activities
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1 sm:col-span-2 md:col-span-3">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{metrics.complianceScore}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Compliance Score
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label="Suspicious Activities" />
          <Tab label="Compliance Reports" />
          <Tab label="KYC Status" />
          <Tab label="Transaction Monitoring" />
        </Tabs>
      </Box>

      {/* Suspicious Activities Tab */}
      {selectedTab === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Suspicious Activities</Typography>
              <Box display="flex" gap={2}>
                <TextField
                  size="small"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="reviewed">Reviewed</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.userId}</TableCell>
                      <TableCell>{activity.type}</TableCell>
                      <TableCell>
                        {activity.currency} {activity.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={activity.riskScore}
                          color={getRiskColor(activity.riskScore)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={activity.status}
                          color={getStatusColor(activity.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => setSelectedActivity(activity)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Compliance Reports Tab */}
      {selectedTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Compliance Reports
            </Typography>
            <List>
              {reports.map((report) => (
                <ListItem key={report.id}>
                  <ListItemIcon>
                    <Assessment />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${report.type} Report`}
                    secondary={`${report.period.start} to ${report.period.end} - ${report.status}`}
                  />
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => {/* Download report */}}
                  >
                    Download
                  </Button>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Activity Review Dialog */}
      <Dialog open={!!selectedActivity} onClose={() => setSelectedActivity(null)} maxWidth="md" fullWidth>
        <DialogTitle>Review Suspicious Activity</DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Activity Details
              </Typography>
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-6">
                  <Typography variant="body2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1">
                    {selectedActivity.userId}
                  </Typography>
                </div>
                <div className="col-span-6">
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {selectedActivity.type}
                  </Typography>
                </div>
                <div className="col-span-6">
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="body1">
                    {selectedActivity.currency} {selectedActivity.amount.toLocaleString()}
                  </Typography>
                </div>
                <div className="col-span-6">
                  <Typography variant="body2" color="text.secondary">
                    Risk Score
                  </Typography>
                  <Chip
                    label={selectedActivity.riskScore}
                    color={getRiskColor(selectedActivity.riskScore)}
                  />
                </div>
                <div className="col-span-12">
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedActivity.description}
                  </Typography>
                </div>
              </div>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedActivity(null)}>Cancel</Button>
          <Button
            color="warning"
            onClick={() => {
              if (selectedActivity) {
                handleReviewActivity(selectedActivity.id, 'reviewed');
                setSelectedActivity(null);
              }
            }}
          >
            Mark as Reviewed
          </Button>
          <Button
            color="success"
            onClick={() => {
              if (selectedActivity) {
                handleReviewActivity(selectedActivity.id, 'resolved');
                setSelectedActivity(null);
              }
            }}
          >
            Resolve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Generation Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Compliance Report</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value="comprehensive"
                label="Report Type"
              >
                <MenuItem value="comprehensive">Comprehensive Report</MenuItem>
                <MenuItem value="suspicious_activity">Suspicious Activity Report</MenuItem>
                <MenuItem value="kyc_status">KYC Status Report</MenuItem>
                <MenuItem value="transaction_summary">Transaction Summary</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Generate report with current form values
              handleGenerateReport('comprehensive', '2025-01-01', '2025-12-31');
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Generate Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceDashboard;


