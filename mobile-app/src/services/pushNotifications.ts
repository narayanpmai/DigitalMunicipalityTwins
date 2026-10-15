import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const initializePushNotifications = async () => {
  // Push Notifications are only supported on physical devices (Android/iOS)
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications are only available on native mobile devices.');
    return;
  }

  try {
    // Request permission to use push notifications
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('User denied push notification permission.');
      return;
    }

    // Register with Apple / Google to receive push via APNs/FCM
    await PushNotifications.register();

    // Listeners for push notifications
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      // Send this token to the FastAPI backend to store against the logged-in Citizen/Employee
      try {
        const { default: apiClient } = await import('../utils/apiClient');
        await apiClient.post('/notifications/register-token', { token: token.value });
      } catch (err) {
        console.error('Failed to send push token to backend', err);
      }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on push registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ', notification);
      // We can trigger an in-app alert or state update here
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ', notification);
      // Example: Navigate to specific page based on notification.data
    });

  } catch (error) {
    console.error('Error initializing push notifications: ', error);
  }
};
