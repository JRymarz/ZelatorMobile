import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAuthentiacted, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
      const checkAuthentication = async () => {
          const userData = await AsyncStorage.getItem('userData');
          setIsAuthenticated(!!userData);

          if(userData) {
              console.log(userData);
              router.replace('/dashboard');
          }
      };

      checkAuthentication();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
      <Stack>
          <Stack.Screen name="index" options={{headerShown: false}}/>
          <Stack.Screen name="login" options={{headerShown: false}} />
          <Stack.Screen name="dashboard" options={{headerShown: false}} />
          <Stack.Screen name="+not-found" />
      </Stack>
  );
}
