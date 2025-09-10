import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import SplashScreenLib from 'react-native-splash-screen';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  useEffect(() => {
    // Hide splash screen after animation
    const timer = setTimeout(() => {
      SplashScreenLib.hide();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F97316" />
      
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View
          animation="bounceIn"
          duration={1500}
          style={styles.logoContainer}
        >
          <Text style={styles.logo}>⚡</Text>
        </Animatable.View>
        
        <Animatable.Text
          animation="fadeInUp"
          delay={500}
          duration={1000}
          style={styles.title}
        >
          ZapPay
        </Animatable.Text>
        
        <Animatable.Text
          animation="fadeInUp"
          delay={800}
          duration={1000}
          style={styles.subtitle}
        >
          Lightning Fast Payments
        </Animatable.Text>
        
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
        </Animatable.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 60,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 50,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
});

export default SplashScreen;

