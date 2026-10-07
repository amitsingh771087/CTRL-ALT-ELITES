import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { SchemeLevel, SchemeSourceAuthority } from '../types';

interface SchemeCardProps {
  title: string;
  level: SchemeLevel;
  sourceAuthority: SchemeSourceAuthority;
  benefits: string;
  matchScore?: number; // shown only on the personalised "Results" screen
  onPress: () => void;
}

const LEVEL_COLOR: Record<SchemeLevel, string> = {
  Local: colors.secondary,
  State: colors.accent,
  Central: colors.primary,
};

/** Reusable card for both the public browse list and the personalised results list. */
export function SchemeCard({
  title,
  level,
  sourceAuthority,
  benefits,
  matchScore,
  onPress,
}: SchemeCardProps): JSX.Element {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: LEVEL_COLOR[level] }]}>
          <Text style={styles.badgeText}>{level}</Text>
        </View>
        <Text style={styles.source}>{sourceAuthority}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.benefits} numberOfLines={2}>
        {benefits}
      </Text>

      {matchScore !== undefined && (
        <View style={styles.matchRow}>
          <View style={styles.matchBarTrack}>
            <View style={[styles.matchBarFill, { width: `${matchScore}%` }]} />
          </View>
          <Text style={styles.matchLabel}>{matchScore}% match</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
  },
  badgeText: { color: colors.textInverse, fontSize: 11, fontWeight: '700' },
  source: { ...typography.caption, color: colors.textSecondary },
  title: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  benefits: { ...typography.bodySmall, color: colors.textSecondary },
  matchRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  matchBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  matchBarFill: { height: '100%', backgroundColor: colors.secondary },
  matchLabel: { ...typography.caption, color: colors.secondary, fontWeight: '700' },
});
