const twilio = require('twilio');

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }
  
  return twilio(accountSid, authToken);
};

// Send SMS message
const sendSMS = async (to, message) => {
  try {
    const client = getTwilioClient();
    const from = process.env.TWILIO_PHONE_NUMBER;
    
    if (!from) {
      throw new Error('Twilio phone number not configured');
    }
    
    const result = await client.messages.create({
      body: message,
      from: from,
      to: to
    });
    
    return {
      success: true,
      messageId: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send verification SMS
const sendVerificationSMS = async (phoneNumber, verificationCode) => {
  const message = `Your ZapPay verification code is: ${verificationCode}. This code expires in 10 minutes.`;
  return await sendSMS(phoneNumber, message);
};

// Send payment notification SMS
const sendPaymentNotificationSMS = async (phoneNumber, amount, fromUser, toUser) => {
  const message = `Payment received: $${amount} from ${fromUser} to ${toUser}. Thank you for using ZapPay!`;
  return await sendSMS(phoneNumber, message);
};

// Send security alert SMS
const sendSecurityAlertSMS = async (phoneNumber, alertType, details) => {
  const message = `ZapPay Security Alert: ${alertType}. ${details}. If this wasn't you, please contact support immediately.`;
  return await sendSMS(phoneNumber, message);
};

// Test SMS service
const testSMSService = async (testPhoneNumber) => {
  try {
    const message = 'ZapPay SMS service test - this is a test message from your backend!';
    const result = await sendSMS(testPhoneNumber, message);
    
    if (result.success) {
      console.log('SMS test successful:', result);
      return {
        success: true,
        message: 'SMS service is working correctly',
        messageId: result.messageId
      };
    } else {
      console.error('SMS test failed:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('SMS test error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendSMS,
  sendVerificationSMS,
  sendPaymentNotificationSMS,
  sendSecurityAlertSMS,
  testSMSService
};
