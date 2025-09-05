import React from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthMeterProps {
  password: string;
  policy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password, policy }) => {
  const getPasswordStrength = () => {
    let score = 0;
    const checks = [];

    // Length check
    if (password.length >= policy.minLength) {
      score += 20;
      checks.push({ text: `At least ${policy.minLength} characters`, passed: true });
    } else {
      checks.push({ text: `At least ${policy.minLength} characters`, passed: false });
    }

    // Uppercase check
    if (policy.requireUppercase) {
      if (/[A-Z]/.test(password)) {
        score += 20;
        checks.push({ text: 'Uppercase letter', passed: true });
      } else {
        checks.push({ text: 'Uppercase letter', passed: false });
      }
    }

    // Lowercase check
    if (policy.requireLowercase) {
      if (/[a-z]/.test(password)) {
        score += 20;
        checks.push({ text: 'Lowercase letter', passed: true });
      } else {
        checks.push({ text: 'Lowercase letter', passed: false });
      }
    }

    // Numbers check
    if (policy.requireNumbers) {
      if (/\d/.test(password)) {
        score += 20;
        checks.push({ text: 'Number', passed: true });
      } else {
        checks.push({ text: 'Number', passed: false });
      }
    }

    // Special characters check
    if (policy.requireSpecialChars) {
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score += 20;
        checks.push({ text: 'Special character', passed: true });
      } else {
        checks.push({ text: 'Special character', passed: false });
      }
    }

    return { score, checks };
  };

  const { score, checks } = getPasswordStrength();

  const getStrengthLevel = () => {
    if (score < 40) return { level: 'Weak', color: 'bg-red-500' };
    if (score < 70) return { level: 'Fair', color: 'bg-yellow-500' };
    if (score < 90) return { level: 'Good', color: 'bg-blue-500' };
    return { level: 'Strong', color: 'bg-green-500' };
  };

  const { level, color } = getStrengthLevel();

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password Strength
          </span>
          <span className={`text-sm font-medium ${
            score < 40 ? 'text-red-600 dark:text-red-400' :
            score < 70 ? 'text-yellow-600 dark:text-yellow-400' :
            score < 90 ? 'text-blue-600 dark:text-blue-400' :
            'text-green-600 dark:text-green-400'
          }`}>
            {level}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        {checks.map((check, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2"
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              check.passed 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {check.passed ? (
                <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" />
              )}
            </div>
            <span className={`text-sm ${
              check.passed 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {check.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
