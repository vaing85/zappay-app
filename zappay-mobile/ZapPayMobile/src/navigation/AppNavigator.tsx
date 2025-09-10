import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useAuth } from '../store/authStore';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SendMoneyScreen from '../screens/SendMoneyScreen';
import ReceiveMoneyScreen from '../screens/ReceiveMoneyScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QRCodeScreen from '../screens/QRCodeScreen';
import QRScannerScreen from '../screens/QRScannerScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Simple icon component for tabs
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 20, color: focused ? '#F97316' : '#6B7280' }}>
      {name === 'Dashboard' ? '🏠' : 
       name === 'Send' ? '💸' : 
       name === 'Receive' ? '📱' : 
       name === 'History' ? '📊' : 
       name === 'Profile' ? '👤' : '❓'}
    </Text>
  </View>
);

// Main tab navigator for authenticated users
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => (
        <TabIcon name={route.name} focused={focused} />
      ),
      tabBarActiveTintColor: '#F97316',
      tabBarInactiveTintColor: '#6B7280',
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{ tabBarLabel: 'Home' }}
    />
    <Tab.Screen 
      name="Send" 
      component={SendMoneyScreen}
      options={{ tabBarLabel: 'Send' }}
    />
    <Tab.Screen 
      name="Receive" 
      component={ReceiveMoneyScreen}
      options={{ tabBarLabel: 'Receive' }}
    />
    <Tab.Screen 
      name="History" 
      component={TransactionHistoryScreen}
      options={{ tabBarLabel: 'History' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

// Auth stack for unauthenticated users
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Main app navigator
const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="QRCode" component={QRCodeScreen} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
