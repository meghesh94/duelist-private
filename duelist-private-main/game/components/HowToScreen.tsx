import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export function HowToScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How to Play</Text>
      <Text style={styles.sectionTitle}>Game Rules</Text>
      <Text style={styles.text}>
        Shadow Duelist is a turn-based dueling game. Each turn, you and the AI select an ability to use. Both actions are revealed and resolved simultaneously. The goal is to reduce your opponent's HP to 0 before they do the same to you.
      </Text>
      <Text style={styles.sectionTitle}>Abilities</Text>
      <Text style={styles.text}>
        - Strike: Deal 5 damage to opponent.\n
        - Heal: Restore 4 HP.\n
        - Block: Reduce incoming damage by 4 this turn. Block is applied immediately and protects against all attacks this turn.\n
        - Stun: Deal 2 damage and immediately cancel the opponent's action this turn (they do nothing, and no effects from their ability are applied).\n
        - Drain: Deal 3 damage and heal for the damage dealt.\n
        - Fireball: Deal 7 damage but 50% chance to miss.\n
        - Dodge: Avoid all damage this turn.\n
        - Poison Strike: Deal 2 damage and poison for 2 damage/turn for 3 turns. Poison does not stack, but is refreshed if reapplied. Poison damage is applied at the end of each turn, starting from the next turn after application.\n
        - Berserker Rage: Deal 6 damage but take 1 self-damage.\n
        - Magic Shield: Block all damage for 1 turn (2-turn cooldown).\n
        - Vampiric Strike: Deal 4 damage and heal for damage dealt.\n
        - Ice Shard: Deal 3 damage and freeze the enemy. Freeze blocks all healing for 1 turn, starting from the next turn after application.
      </Text>
      <Text style={styles.sectionTitle}>How a Turn Works</Text>
      <Text style={styles.text}>
        1. Choose one of your available abilities.\n
        2. The AI also chooses an ability.\n
        3. Both actions are revealed and resolved.\n
        4. Status effects (like poison, freeze, stun) are applied.\n
        5. The next turn begins with new ability options.
      </Text>
      <Text style={styles.sectionTitle}>Tips</Text>
      <Text style={styles.text}>
        - Use Block, Dodge, or Magic Shield to avoid big attacks.\n
        - Heal and Drain can keep you alive longer.\n
        - Stun and Freeze can disrupt your opponent's plans.\n
        - Poison and Berserker Rage are best when you can finish the opponent quickly.\n
        - Plan ahead and watch for status effects!
      </Text>
      <Text style={styles.back} onPress={onBack}>← Back</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0F0F0F',
    padding: 24,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 24,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginTop: 18,
    marginBottom: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  back: {
    color: '#F59E0B',
    fontSize: 18,
    marginTop: 32,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
});
