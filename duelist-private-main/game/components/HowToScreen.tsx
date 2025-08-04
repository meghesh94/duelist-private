
import React from 'react';
import { AnimatedAbilityCard } from '../components/AnimatedAbilityCard';
import { ScrollView as RNScrollView, Text, StyleSheet } from 'react-native';

export function HowToScreen({ onBack }: { onBack: () => void }) {
  const allAbilities = [
    { id: 'strike', name: 'Strike', description: 'Deal 5 damage to opponent.', icon: 'sword', type: 'damage' as const, power: 5 },
    { id: 'heal', name: 'Heal', description: 'Restore 4 HP.', icon: 'heart', type: 'heal' as const, power: 4 },
    { id: 'block', name: 'Block', description: 'Reduce incoming damage by 4 this turn. Block is applied immediately and protects against all attacks this turn.', icon: 'shield', type: 'block' as const, power: 4 },
    { id: 'stun', name: 'Stun', description: 'Deal 2 damage and immediately cancel the opponent\'s action this turn (they do nothing, and no effects from their ability are applied).', icon: 'zap', type: 'stun' as const, power: 2 },
    { id: 'drain', name: 'Drain', description: 'Deal 3 damage and heal for the damage dealt.', icon: 'droplets', type: 'drain' as const, power: 3 },
    { id: 'fireball', name: 'Fireball', description: 'Deal 7 damage but 50% chance to miss.', icon: 'flame', type: 'damage' as const, power: 7 },
    { id: 'dodge', name: 'Dodge', description: 'Avoid all damage this turn.', icon: 'wind', type: 'dodge' as const, power: 0 },
    { id: 'poison', name: 'Poison Strike', description: 'Deal 2 damage and poison for 2 damage/turn for 3 turns. Poison does not stack, but is refreshed if reapplied. Poison damage is applied at the end of each turn, starting from the next turn after application.', icon: 'droplets', type: 'poison' as const, power: 2 },
    { id: 'berserk', name: 'Berserker Rage', description: 'Deal 6 damage but take 1 self-damage.', icon: 'sword', type: 'damage' as const, power: 6 },
    { id: 'lifesteal', name: 'Lifesteal', description: 'Deal 4 damage and heal for damage dealt.', icon: 'heart', type: 'drain' as const, power: 4 },
    { id: 'ice', name: 'Ice Shard', description: 'Deal 3 damage and freeze the enemy. Freeze blocks all healing for 1 turn, starting from the next turn after application.', icon: 'zap', type: 'freeze' as const, power: 3 },
  ];
  return (
    <RNScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How to Play</Text>
      <Text style={styles.sectionTitle}>Game Rules</Text>
      <Text style={styles.text}>
        Shadow Duelist is a turn-based dueling game. Each turn, you and the AI select an ability to use. Both actions are revealed and resolved simultaneously. The goal is to reduce your opponent's HP to 0 before they do the same to you.
      </Text>
      <Text style={styles.sectionTitle}>Abilities</Text>
      <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
        {allAbilities.map((ability) => (
          <AnimatedAbilityCard key={ability.id} ability={ability} compact />
        ))}
      </RNScrollView>
      <Text style={styles.sectionTitle}>How a Turn Works</Text>
      <Text style={styles.text}>
        1. Choose one of your available abilities.{"\n"}
        2. The AI also chooses an ability.{"\n"}
        3. Both actions are revealed and resolved.{"\n"}
        4. Status effects (like poison, freeze, stun) are applied.{"\n"}
        5. The next turn begins with new ability options.
      </Text>
      <Text style={styles.sectionTitle}>Tips</Text>
      <Text style={styles.text}>
        - Use Block or Dodge to avoid big attacks.{"\n"}
        - Heal and Drain can keep you alive longer.{"\n"}
        - Stun and Freeze can disrupt your opponent's plans.{"\n"}
        - Poison and Berserker Rage are best when you can finish the opponent quickly.{"\n"}
        - Plan ahead and watch for status effects!
      </Text>
      <Text style={styles.back} onPress={onBack}>← Back</Text>
    </RNScrollView>
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
