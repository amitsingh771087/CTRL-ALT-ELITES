import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerify'>;

/**
 * "Login successful?" decision from the flowchart. On success routes to
 * ProfileForm for a new user, or straight to Results for a returning one.
 */
export function OtpVerifyScreen({ route, navigation }: Props): JSX.Element {
  const { phone } = route.params;
  const { setUser } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(undefined);
    if (code.length !== 6) {
      setError('Enter the 6-digit code we sent you');
      return;
    }

    setLoading(true);
    try {
      const { user, isNewUser } = await authService.verifyOtp(phone, code);
      setUser(user);
      navigation.reset({
        index: 0,
        routes: [{ name: isNewUser ? 'ProfileForm' : 'Results' }],
      });
    } catch {
      setError('Incorrect or expired code');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    try {
      await authService.requestOtp(phone);
      Alert.alert('Code sent', `A new OTP was sent to ${phone}`);
    } catch {
      Alert.alert('Could not resend', 'Please try again shortly.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={typography.h1}>Enter the code</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to {phone}</Text>

      <Input
        label="OTP"
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        error={error}
        autoFocus
      />

      <Button label="Verify & Continue" onPress={onSubmit} loading={loading} />
      <Button label="Resend code" onPress={onResend} variant="ghost" style={styles.resend} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.lg },
  resend: { marginTop: spacing.sm },
});
