import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 ZapPay Mobile App</Text>
      <Text style={styles.subtitle}>Phase 2: Essential Features - COMPLETED!</Text>
      <Text style={styles.description}>
        ✅ Navigation System{'\n'}
        ✅ Authentication Flow{'\n'}
        ✅ Payment Screens{'\n'}
        ✅ QR Code Features{'\n'}
        ✅ Profile Management
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default TestScreen;

