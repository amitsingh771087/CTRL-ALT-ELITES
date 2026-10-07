import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Scheme } from '../types';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { LoadingSpinner } from '../components/LoadingSpinner';
import * as schemeService from '../services/schemeService';

type Props = NativeStackScreenProps<RootStackParamList, 'SchemeDetail'>;

/** "View details, required documents & apply steps" from the flowchart. */
export function SchemeDetailScreen({ route }: Props): JSX.Element {
  const { schemeId } = route.params;
  const [scheme, setScheme] = useState<Scheme | null>(null);

  useEffect(() => {
    schemeService.getSchemeById(schemeId).then(setScheme);
  }, [schemeId]);

  if (!scheme) return <LoadingSpinner label="Loading scheme details..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.h1}>{scheme.title}</Text>
      <Text style={styles.meta}>
        {scheme.level} · {scheme.sourceAuthority}
      </Text>

      <Section title="About this scheme">
        <Text style={styles.paragraph}>{scheme.description}</Text>
      </Section>

      <Section title="Benefits">
        <Text style={styles.paragraph}>{scheme.benefits}</Text>
      </Section>

      {!!scheme.requiredDocuments?.length && (
        <Section title="Required documents">
          {scheme.requiredDocuments.map((doc, i) => (
            <Text key={i} style={styles.listItem}>
              •  {doc}
            </Text>
          ))}
        </Section>
      )}

      {!!scheme.applySteps?.length && (
        <Section title="How to apply">
          {scheme.applySteps.map((step, i) => (
            <Text key={i} style={styles.listItem}>
              {i + 1}. {step}
            </Text>
          ))}
        </Section>
      )}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={typography.h3}>{title}</Text>
      <View style={{ marginTop: spacing.xs }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  meta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  paragraph: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  listItem: { ...typography.body, color: colors.textPrimary, marginBottom: 4 },
});
