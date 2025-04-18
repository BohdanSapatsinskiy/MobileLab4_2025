import React, { useEffect } from "react";
import { LogLevel, OneSignal } from "react-native-onesignal";
import Constants from "expo-constants";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Home from './screens/Home';
import Tasks from './screens/Tasks';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    const oneSignalAppId = Constants.expoConfig.extra.OneSignalAppId;

    if (!oneSignalAppId) {
      console.error("❌ OneSignal App ID не знайдено в Constants.expoConfig.extra!");
      return;
    }

    // Ініціалізація OneSignal
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(oneSignalAppId);
    OneSignal.Notifications.requestPermission(true);
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen 
          name="Home" 
          component={Home} 
        />
        <Tab.Screen 
          name="Tasks" 
          component={Tasks} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}



