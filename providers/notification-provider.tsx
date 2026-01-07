import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import * as Notifications from "expo-notifications";
import {
  setupNotificationHandler,
  setupAndroidChannel,
  registerForPushNotificationsAsync,
} from "@/lib/notifications";

interface NotificationContextValue {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | undefined;
  requestPermissions: () => Promise<string | undefined>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  useEffect(() => {
    // Wrap in try-catch to prevent crashes in production
    const setup = async () => {
      try {
        // Set up notification handler for foreground notifications
        setupNotificationHandler();

        // Set up Android notification channel and register for push
        await setupAndroidChannel();
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
      } catch (error) {
        console.log("Notification setup failed:", error);
      }
    };
    setup();

    // Listen for incoming notifications (when app is foregrounded)
    try {
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
          console.log("Notification received:", notification);
        });

      // Listen for notification responses (when user taps notification)
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("Notification response:", response);
          // Handle navigation based on notification data here
          const data = response.notification.request.content.data;
          if (data) {
            // Future: Navigate to specific screen based on notification data
            console.log("Notification data:", data);
          }
        });
    } catch (error) {
      console.log("Notification listener setup failed:", error);
    }

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const requestPermissions = useCallback(async () => {
    const token = await registerForPushNotificationsAsync();
    setExpoPushToken(token);
    return token;
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        requestPermissions,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
