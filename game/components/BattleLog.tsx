import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { BattleLogEntry } from '../../types/game';

interface BattleLogProps {
  entries: BattleLogEntry[];
}

export function BattleLog({ entries }: BattleLogProps) {
  const getEntryStyle = (type: string) => {
    switch (type) {
      case 'damage': return styles.damageEntry;
      case 'heal': return styles.healEntry;
      case 'status': return styles.statusEntry;
      case 'system': return styles.systemEntry;
      default: return styles.actionEntry;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battle Log</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {entries.slice(-8).map((entry) => (
          <View key={entry.id} style={styles.entry}>
            <Text style={[styles.message, getEntryStyle(entry.type)]}>
              {entry.message}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F1F23',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    height: 200,
    borderWidth: 2,
    borderColor: '#374151',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  entry: {
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionEntry: {
    color: '#D1D5DB',
  },
  damageEntry: {
    color: '#EF4444',
    fontWeight: '600',
  },
  healEntry: {
    color: '#10B981',
    fontWeight: '600',
  },
  statusEntry: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  systemEntry: {
    color: '#8B5CF6',
    fontStyle: 'italic',
  },
});