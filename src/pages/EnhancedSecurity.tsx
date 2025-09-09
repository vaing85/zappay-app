import React from 'react';
import { motion } from 'framer-motion';
import EnhancedSecurityDashboard from '../components/EnhancedSecurityDashboard';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const EnhancedSecurity: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto"
    >
      <EnhancedSecurityDashboard />
    </motion.div>
  );
};

export default EnhancedSecurity;
