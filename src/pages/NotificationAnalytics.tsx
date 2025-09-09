import React from 'react';
import { motion } from 'framer-motion';
import NotificationAnalyticsDashboard from '../components/NotificationAnalyticsDashboard';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const NotificationAnalytics: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto"
    >
      <NotificationAnalyticsDashboard />
    </motion.div>
  );
};

export default NotificationAnalytics;
