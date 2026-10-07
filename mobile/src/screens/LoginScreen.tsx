import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import * as authService from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

/** "Login with OTP (first time)" step — collects the phone number and requests an OTP. */
export function LoginScreen({ navigation }: Props): JSX.Element {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(undefined);
    if (!/^\+?[1-9]\d{9,14}$/.test(phone)) {
      setError('Enter a valid phone number, e.g. +919876543210');
      return;
    }

    setLoading(true);
    try {
      await authService.requestOtp(phone);
      navigation.navigate('OtpVerify', { phone });
    } catch (e) {
      Alert.alert('Could not send OTP', 'Please check your number and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={typography.h1}>Verify your number</Text>
      <Text style={styles.subtitle}>
        We'll text you a 6-digit code to check your personalised eligibility.
      </Text>

      <Input
        label="Mobile number"
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        error={error}
        autoFocus
      />

      <Button label="Send OTP" onPress={onSubmit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.lg },
});
