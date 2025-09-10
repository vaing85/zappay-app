import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

const NotificationScreen: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotification();
  const { isDarkMode, colors } = useTheme();

  const onRefresh = () => {
    // Simulate refresh
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return 'payment';
      case 'security':
        return 'security';
      case 'promotion':
        return 'local-offer';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment':
        return '#10B981';
      case 'security':
        return '#EF4444';
      case 'promotion':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const renderNotification = ({ item, index }: { item: any; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={[
        styles.notificationItem,
        { backgroundColor: isDarkMode ? colors.dark.card : colors.light.card },
        !item.read && styles.unreadNotification,
      ]}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={() => markAsRead(item.id)}
      >
        <View style={styles.notificationIcon}>
          <Icon
            name={getNotificationIcon(item.type)}
            size={24}
            color={getNotificationColor(item.type)}
          />
        </View>
        
        <View style={styles.notificationDetails}>
          <Text style={[styles.notificationTitle, { color: isDarkMode ? colors.dark.text : colors.light.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.notificationMessage, { color: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary }]}>
            {item.message}
          </Text>
          <Text style={[styles.notificationTime, { color: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary }]}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
        
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </Animatable.View>
  );

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
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? colors.dark.text : colors.light.text,
    },
    headerActions: {
      flexDirection: 'row',
    },
    headerButton: {
      marginLeft: 15,
    },
    notificationItem: {
      marginHorizontal: 20,
      marginBottom: 10,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    unreadNotification: {
      borderLeftWidth: 4,
      borderLeftColor: '#F97316',
    },
    notificationContent: {
      flexDirection: 'row',
      padding: 15,
      alignItems: 'flex-start',
    },
    notificationIcon: {
      marginRight: 15,
      marginTop: 2,
    },
    notificationDetails: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    notificationMessage: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 4,
    },
    notificationTime: {
      fontSize: 12,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#F97316',
      marginTop: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={markAllAsRead}>
            <Icon name="done-all" size={24} color={isDarkMode ? colors.dark.text : colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={clearNotifications}>
            <Icon name="clear-all" size={24} color={isDarkMode ? colors.dark.text : colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="notifications-none" size={64} color={isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary} />
          <Text style={styles.emptyStateText}>No notifications yet</Text>
        </View>
      )}
    </View>
  );
};

export default NotificationScreen;

