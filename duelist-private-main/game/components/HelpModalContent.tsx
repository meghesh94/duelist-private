import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ABILITIES } from '../logic/abilities';
import { AbilityCard } from './AbilityCard';

export function HelpModalContent() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>How to Play</Text>
      <Text style={styles.paragraph}>
        Shadow Duelist is a turn-based strategy game. Your objective is to reduce your opponent's HP to zero before they do the same to you. Each turn, choose an ability to attack, defend, heal, or use special effects. Predict your opponent's moves and use abilities wisely to win!
      </Text>
      <Text style={styles.sectionTitle}>Abilities</Text>
      <Text style={styles.paragraph}>
        Each ability has unique effects. Some interact with others in special ways. Tap on an ability to select it during your turn.
      </Text>
      <View style={styles.abilitiesGrid}>
        {ABILITIES.map((ability) => (
          <View key={ability.id} style={styles.abilityCardWrapper}>
            <AbilityCard ability={ability} compact={false} />
            <Text style={styles.abilityInteraction}>{getAbilityInteraction(ability.id)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function getAbilityInteraction(id: string): string {
  switch (id) {
    case 'block':
      return 'Blocks most damage, but does not reduce stun or poison effects.';
    case 'stun':
      return 'Cancels opponent’s action (except if dodged). Ignores block.';
    case 'dodge':
      return 'Avoids all direct damage and stun this turn.';
    case 'drain':
      return 'Heals only if damage is actually dealt (not blocked or dodged).';
    case 'fireball':
      return '50% chance to miss. Can be blocked or dodged.';
    case 'poison':
      return 'Poison is refreshed, not stacked. Block does not reduce poison.';
    case 'freeze':
      return 'Prevents healing for 1 turn. Can be blocked or dodged.';
    case 'lifesteal':
      return 'Heals only if damage is actually dealt (not blocked or dodged).';
    case 'rage':
      return 'Deals high damage but hurts yourself.';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#181c24',
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#F59E42',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  paragraph: {
    color: '#D1D5DB',
    fontSize: 16,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  abilitiesGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  abilityCardWrapper: {
    width: 180,
    margin: 8,
    alignItems: 'center',
  },
  abilityInteraction: {
    color: '#A1A1AA',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
