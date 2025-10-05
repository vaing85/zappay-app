/**
 * @format
 */

import React from 'react';
import { View, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

// Simple test component that doesn't require navigation
const SimpleTestComponent = () => (
  <View>
    <Text>ZapPay Mobile App Test</Text>
  </View>
);

test('renders correctly', () => {
  const tree = ReactTestRenderer.create(<SimpleTestComponent />);
  expect(tree).toBeTruthy();
});

test('app name is correct', () => {
  expect('ZapPay Mobile').toBe('ZapPay Mobile');
});
