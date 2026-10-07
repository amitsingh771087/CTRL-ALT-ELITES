import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import * as authService from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

/**
 * "Citizen opens app" from the flowchart. Silently attempts the
 * biometric/refresh-token login so a returning user skips straight
 * past OTP; otherwise lands on the public Browse screen.
 */
export function SplashScreen({ navigation }: Props): JSX.Element {
  useEffect(() => {
    (async () => {
      try {
        await authService.loginWithBiometrics();
      } catch {
        // No stored session, or biometrics unavailable/declined — that's fine,
        // the user simply continues as a guest until they choose to log in.
      } finally {
        navigation.replace('BrowseSchemes');
      }
    })();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GovSync</Text>
      <Text style={styles.subtitle}>Find every government scheme you qualify for</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  title: { ...typography.h1, color: colors.textInverse, marginBottom: 8 },
  subtitle: { ...typography.body, color: colors.textInverse, opacity: 0.85 },
});
