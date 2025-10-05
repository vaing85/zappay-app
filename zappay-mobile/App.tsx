import React from 'react';
import { StatusBar, Platform } from 'react-native';
import AppNavigator from './ZapPayMobile/src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#f97316"
        translucent={Platform.OS === 'android'}
      />
      <AppNavigator />
    </>
  );
};

export default App;
