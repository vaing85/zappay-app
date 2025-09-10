import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const SettingsScreen: React.FC = () => {
  const { isDarkMode, colors, toggleTheme } = useTheme();
  const { isBiometricEnabled } = useAuth();

  const settingsItems = [
    {
      id: 'theme',
      title: 'Dark Mode',
      icon: 'dark-mode',
      type: 'toggle',
      value: isDarkMode,
      onPress: toggleTheme,
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      icon: 'notifications',
      type: 'toggle',
      value: true,
      onPress: () => console.log('Toggle notifications'),
    },
    {
      id: 'biometric',
      title: 'Biometric Login',
      icon: 'fingerprint',
      type: 'toggle',
      value: isBiometricEnabled,
      onPress: () => console.log('Toggle biometric'),
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      icon: 'privacy-tip',
      type: 'navigation',
      onPress: () => console.log('Privacy settings'),
    },
    {
      id: 'security',
      title: 'Security',
      icon: 'security',
      type: 'navigation',
      onPress: () => console.log('Security settings'),
    },
    {
      id: 'about',
      title: 'About ZapPay',
      icon: 'info',
      type: 'navigation',
      onPress: () => console.log('About'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.dark.background : colors.light.background,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? colors.dark.text : colors.light.text,
      marginLeft: 15,
    },
    settingsContainer: {
      paddingHorizontal: 20,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.dark.card : colors.light.card,
      padding: 15,
      marginBottom: 10,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    settingsIcon: {
      marginRight: 15,
    },
    settingsTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? colors.dark.text : colors.light.text,
    },
    settingsArrow: {
      marginLeft: 10,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-back" size={24} color={isDarkMode ? colors.dark.text : colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
        {settingsItems.map((item, index) => (
          <Animatable.View
            key={item.id}
            animation="fadeInUp"
            delay={index * 100}
          >
            <TouchableOpacity style={styles.settingsItem} onPress={item.onPress}>
              <Icon name={item.icon} size={24} color="#F97316" style={styles.settingsIcon} />
              <Text style={styles.settingsTitle}>{item.title}</Text>
              
              {item.type === 'toggle' ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onPress}
                  trackColor={{ false: '#767577', true: '#F97316' }}
                  thumbColor={item.value ? '#FFFFFF' : '#f4f3f4'}
                />
              ) : (
                <Icon name="chevron-right" size={20} color={isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary} style={styles.settingsArrow} />
              )}
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
