import React from 'react';
import { motion } from 'framer-motion';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const Analytics: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto"
    >
      <AnalyticsDashboard />
    </motion.div>
  );
};

export default Analytics;