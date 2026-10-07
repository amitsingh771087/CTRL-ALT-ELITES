import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { registerAutoRefresh } from './src/services/authService';

/** App root: wires up global providers, then renders the navigator. */
export default function App(): JSX.Element {
  useEffect(() => {
    registerAutoRefresh(); // enables silent 401 -> refresh -> retry across the app
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
