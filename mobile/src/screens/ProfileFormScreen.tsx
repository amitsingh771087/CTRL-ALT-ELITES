import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UserCategory, Gender } from '../types';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import * as schemeService from '../services/schemeService';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileForm'>;

const CATEGORIES: UserCategory[] = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'];
const GENDERS: Gender[] = ['Male', 'Female', 'Other'];

/**
 * "Fill eligibility profile — Age, income, occupation, category, location,
 * documents" then "Encrypt & save profile securely" from the flowchart.
 * All sensitive fields (age, income, address, Aadhaar) are encrypted
 * server-side on save — see backend User.setSensitiveProfile().
 */
export function ProfileFormScreen({ navigation }: Props): JSX.Element {
  const [age, setAge] = useState('');
  const [annualIncomeInr, setAnnualIncomeInr] = useState('');
  const [occupation, setOccupation] = useState('');
  const [category, setCategory] = useState<UserCategory>('General');
  const [gender, setGender] = useState<Gender>('Male');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('');
  const [isBPL, setIsBPL] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Pre-fill if the user already has a partial profile (e.g. resuming later).
    schemeService.getMyProfile().then((p) => {
      if (p.age) setAge(String(p.age));
      if (p.annualIncomeInr) setAnnualIncomeInr(String(p.annualIncomeInr));
      if (p.occupation) setOccupation(p.occupation);
      if (p.category) setCategory(p.category);
      if (p.gender) setGender(p.gender);
      if (p.state) setState(p.state);
      if (p.district) setDistrict(p.district);
      if (p.isBPL !== undefined) setIsBPL(p.isBPL);
      if (p.isDisabled !== undefined) setIsDisabled(p.isDisabled);
    }).catch(() => {
      /* new user — nothing to pre-fill */
    });
  }, []);

  const onSave = async () => {
    if (!age || !annualIncomeInr || !occupation || !district) {
      Alert.alert('A few fields are missing', 'Please fill in age, income, occupation and district.');
      return;
    }

    setSaving(true);
    try {
      const { isProfileComplete } = await schemeService.updateMyProfile({
        age: Number(age),
        annualIncomeInr: Number(annualIncomeInr),
        occupation,
        category,
        gender,
        state,
        district,
        isBPL,
        isDisabled,
      });

      if (isProfileComplete) {
        navigation.reset({ index: 0, routes: [{ name: 'Results' }] });
      } else {
        Alert.alert('Almost there', 'A few more details are needed to match schemes accurately.');
      }
    } catch {
      Alert.alert('Could not save profile', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.h1}>Your eligibility profile</Text>
      <Text style={styles.subtitle}>
        Stored encrypted, and used only to match you against scheme rules.
      </Text>

      <Input label="Age" keyboardType="number-pad" value={age} onChangeText={setAge} placeholder="35" />
      <Input
        label="Annual household income (₹)"
        keyboardType="number-pad"
        value={annualIncomeInr}
        onChangeText={setAnnualIncomeInr}
        placeholder="250000"
      />
      <Input label="Occupation" value={occupation} onChangeText={setOccupation} placeholder="Farmer" />

      <ChipGroup label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
      <ChipGroup label="Gender" options={GENDERS} value={gender} onChange={setGender} />

      <Input label="State" value={state} onChangeText={setState} placeholder="Maharashtra" />
      <Input label="District" value={district} onChangeText={setDistrict} placeholder="Thane" />

      <ToggleRow label="Below Poverty Line (BPL) card holder" value={isBPL} onChange={setIsBPL} />
      <ToggleRow label="Person with disability" value={isDisabled} onChange={setIsDisabled} />

      <Button label="Save & find my schemes" onPress={onSave} loading={saving} style={styles.save} />
    </ScrollView>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}): JSX.Element {
  return (
    <View style={styles.chipGroup}>
      <Text style={styles.chipLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <Text
              key={opt}
              onPress={() => onChange(opt)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              {opt}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}): JSX.Element {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.lg },
  chipGroup: { marginBottom: spacing.md },
  chipLabel: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  chipSelected: { backgroundColor: colors.primary, color: colors.textInverse, borderColor: colors.primary },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  toggleLabel: { ...typography.body, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  save: { marginTop: spacing.md },
});
