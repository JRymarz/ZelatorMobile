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

export default function DashboardLayout() {
    const [isAuthentiacted, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuthentication = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setIsAuthenticated(!!userData);

            if(userData) {
                console.log(userData)
                router.replace('/dashboard');
            } else {
                router.replace('/');
            }
        };

        checkAuthentication();
    }, []);

    return (
        <Stack>
            <Stack.Screen name="index" options={{headerShown: false}} />
        </Stack>
    );
}
