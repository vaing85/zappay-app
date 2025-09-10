import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const QRScannerScreen = ({ navigation }: any) => {
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const handleBarCodeRead = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      // Parse QR code data
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'payment_request') {
        // Handle payment request
        Alert.alert(
          'Payment Request',
          `Amount: $${qrData.amount}\nFrom: ${qrData.sender}`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setScanned(false) },
            { text: 'Pay', onPress: () => processPayment(qrData) },
          ]
        );
      } else if (qrData.type === 'user_profile') {
        // Handle user profile scan
        Alert.alert(
          'User Profile',
          `Name: ${qrData.name}\nEmail: ${qrData.email}`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setScanned(false) },
            { text: 'Send Money', onPress: () => sendMoneyToUser(qrData) },
          ]
        );
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not supported by ZapPay');
        setScanned(false);
      }
    } catch (error) {
      Alert.alert('Invalid QR Code', 'Unable to read QR code data');
      setScanned(false);
    }
  };

  const processPayment = (paymentData: any) => {
    // Navigate to payment screen with pre-filled data
    Alert.alert('Payment', 'Redirecting to payment screen...');
    navigation.goBack();
  };

  const sendMoneyToUser = (userData: any) => {
    // Navigate to send money screen with pre-filled recipient
    Alert.alert('Send Money', 'Redirecting to send money screen...');
    navigation.goBack();
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    cameraContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanArea: {
      width: width * 0.7,
      height: width * 0.7,
      borderWidth: 2,
      borderColor: '#F97316',
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    corner: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderColor: '#F97316',
    },
    topLeft: {
      top: -2,
      left: -2,
      borderTopWidth: 4,
      borderLeftWidth: 4,
      borderTopLeftRadius: 20,
    },
    topRight: {
      top: -2,
      right: -2,
      borderTopWidth: 4,
      borderRightWidth: 4,
      borderTopRightRadius: 20,
    },
    bottomLeft: {
      bottom: -2,
      left: -2,
      borderBottomWidth: 4,
      borderLeftWidth: 4,
      borderBottomLeftRadius: 20,
    },
    bottomRight: {
      bottom: -2,
      right: -2,
      borderBottomWidth: 4,
      borderRightWidth: 4,
      borderBottomRightRadius: 20,
    },
    header: {
      position: 'absolute',
      top: 50,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      zIndex: 1,
    },
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    instructions: {
      position: 'absolute',
      bottom: 100,
      left: 0,
      right: 0,
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    instructionsText: {
      color: '#FFFFFF',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    controls: {
      position: 'absolute',
      bottom: 50,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    controlButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 20,
    },
    scanLine: {
      position: 'absolute',
      top: '50%',
      left: '10%',
      right: '10%',
      height: 2,
      backgroundColor: '#F97316',
      borderRadius: 1,
    },
    mockCamera: {
      flex: 1,
      backgroundColor: '#1F2937',
      justifyContent: 'center',
      alignItems: 'center',
    },
    mockText: {
      color: '#FFFFFF',
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
    },
  });

  return (
    <View style={styles.container}>
      {/* Mock Camera View */}
      <View style={styles.mockCamera}>
        <Text style={styles.mockText}>📷 Camera View</Text>
        <Text style={styles.mockText}>QR Scanner (Mock)</Text>
        <Text style={styles.mockText}>Point camera at QR code</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Scan Area Overlay */}
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          {/* Corner indicators */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {/* Animated scan line */}
          {!scanned && (
            <View style={styles.scanLine} />
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Position the QR code within the frame to scan
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>
            {flashOn ? '💡' : '🔦'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: '#F97316' }]}
          onPress={() => setScanned(false)}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>🔄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QRScannerScreen;