import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';

import { SplashScreen } from '../screens/SplashScreen';
import { BrowseSchemesScreen } from '../screens/BrowseSchemesScreen';
import { SchemeDetailScreen } from '../screens/SchemeDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OtpVerifyScreen } from '../screens/OtpVerifyScreen';
import { ProfileFormScreen } from '../screens/ProfileFormScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Screen graph mirrors the flowchart 1:1:
 * Splash -> Browse (public) -> [Login -> OtpVerify -> ProfileForm] -> Results -> SchemeDetail
 * with Notifications reachable from anywhere once authenticated.
 */
export function AppNavigator(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textInverse,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BrowseSchemes" component={BrowseSchemesScreen} options={{ title: 'GovSync', headerShown: false }} />
        <Stack.Screen name="SchemeDetail" component={SchemeDetailScreen} options={{ title: 'Scheme Details' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
        <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} options={{ title: 'Verify OTP' }} />
        <Stack.Screen name="ProfileForm" component={ProfileFormScreen} options={{ title: 'Your Profile' }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Your Matches', headerBackVisible: false }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
