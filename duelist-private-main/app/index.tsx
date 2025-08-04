import React, { useState } from 'react';
import { AnimatedAbilityCard } from '../game/components/AnimatedAbilityCard';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LogoAnimation } from '../game/components/LogoAnimation';
import { HowToScreen } from '../game/components/HowToScreen';

const allAbilities = [
  {
    id: 'strike',
    name: 'Strike',
    description: 'Deal 5 damage to opponent.',
    icon: 'sword',
    type: 'damage' as const,
    power: 5,
  },
  {
    id: 'heal',
    name: 'Heal',
    description: 'Restore 4 HP.',
    icon: 'heart',
    type: 'heal' as const,
    power: 4,
  },
  {
    id: 'block',
    name: 'Block',
    description: 'Reduce incoming damage by 4 this turn. Block is applied immediately and protects against all attacks this turn.',
    icon: 'shield',
    type: 'block' as const,
    power: 4,
  },
  {
    id: 'stun',
    name: 'Stun',
    description: 'Deal 2 damage and immediately cancel the opponent\'s action this turn (they do nothing, and no effects from their ability are applied).',
    icon: 'zap',
    type: 'stun' as const,
    power: 2,
  },
  {
    id: 'drain',
    name: 'Drain',
    description: 'Deal 3 damage and heal for the damage dealt.',
    icon: 'droplets',
    type: 'drain' as const,
    power: 3,
  },
  {
    id: 'fireball',
    name: 'Fireball',
    description: 'Deal 7 damage but 50% chance to miss.',
    icon: 'flame',
    type: 'damage' as const,
    power: 7,
  },
  {
    id: 'dodge',
    name: 'Dodge',
    description: 'Avoid all damage this turn.',
    icon: 'wind',
    type: 'dodge' as const,
    power: 0,
  },
  {
    id: 'poison',
    name: 'Poison Strike',
    description: 'Deal 2 damage and poison for 2 damage/turn for 3 turns. Poison does not stack, but is refreshed if reapplied. Poison damage is applied at the end of each turn, starting from the next turn after application.',
    icon: 'droplets',
    type: 'poison' as const,
    power: 2,
  },
  {
    id: 'berserk',
    name: 'Berserker Rage',
    description: 'Deal 6 damage but take 1 self-damage.',
    icon: 'sword',
    type: 'damage' as const,
    power: 6,
  },
  {
    id: 'lifesteal',
    name: 'Lifesteal',
    description: 'Deal 4 damage and heal for damage dealt.',
    icon: 'heart',
    type: 'drain' as const,
    power: 4,
  },
  {
    id: 'ice',
    name: 'Ice Shard',
    description: 'Deal 3 damage and freeze the enemy. Freeze blocks all healing for 1 turn, starting from the next turn after application.',
    icon: 'zap',
    type: 'freeze' as const,
    power: 3,
  },
];

const sampleAbilities = allAbilities.slice(0, 5);

function HowToPlayModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContentFull}>
          <HowToScreen onBack={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function AbilitiesModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContentFull}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <Text style={styles.modalTitle}>All Abilities</Text>
            {allAbilities.map((ability) => (
              <View key={ability.id} style={{ marginBottom: 20, backgroundColor: '#18181b', borderRadius: 10, padding: 12 }}>
                <AnimatedAbilityCard ability={ability} compact />
                <Text style={[styles.sectionTitle, { marginTop: 8, marginBottom: 4 }]}>{ability.name}</Text>
                <Text style={styles.modalText}>{ability.description}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [showHowTo, setShowHowTo] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);

  return (
    <View style={styles.container}>
      <LogoAnimation size={72} />
      <Text style={styles.title}>Shadow Duelist</Text>
      <Text style={styles.subtitle}>A turn-based battle of wits and shadows</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/game' })}>
        <Text style={styles.buttonText}>Start Duel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => setShowHowTo(true)}>
        <Text style={styles.buttonText}>How to Play</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.tertiaryButton]} onPress={() => setShowAbilities(true)}>
        <Text style={styles.buttonText}>Abilities</Text>
      </TouchableOpacity>
      <HowToPlayModal visible={showHowTo} onClose={() => setShowHowTo(false)} />
      <AbilitiesModal visible={showAbilities} onClose={() => setShowAbilities(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#374151',
  },
  tertiaryButton: {
    backgroundColor: '#1e293b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentFull: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 0,
    width: 360,
    maxHeight: '90%',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginTop: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
