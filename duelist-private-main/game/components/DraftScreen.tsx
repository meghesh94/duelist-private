import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AnimatedAbilityCard } from './AnimatedAbilityCard';
import { CharacterProfile } from './CharacterProfile';
import { GameState } from '../../types/game';
import { getCharacter } from '../logic/characters';

interface DraftScreenProps {
  gameState: GameState;
  onDraftAbility: (abilityId: string) => void;
}

export function DraftScreen({ gameState, onDraftAbility }: DraftScreenProps) {
  const playerCharacter = getCharacter('player');
  const aiCharacter = getCharacter('ai');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚔️ Shadow Duelist</Text>
      <Text style={styles.subtitle}>The shadows await your choice...</Text>
      
      <View style={styles.playersContainer}>
        <CharacterProfile
          character={playerCharacter}
          hp={gameState.players.player.hp}
          maxHp={gameState.players.player.maxHp}
          statusEffects={gameState.players.player.statusEffects}
          showFlavorText={gameState.players.player.abilities.length === 0}
        />
        <CharacterProfile
          character={aiCharacter}
          hp={gameState.players.ai.hp}
          maxHp={gameState.players.ai.maxHp}
          statusEffects={gameState.players.ai.statusEffects}
          showFlavorText={gameState.players.ai.abilities.length === 0}
        />
      </View>

      <View style={styles.draftContainer}>
        <Text style={styles.draftTitle}>
          Choose Ability ({gameState.players.player.abilities.length}/3)
        </Text>
        
        <View style={styles.draftOptions}>
          {gameState.draftOptions.map((ability: any) => (
            <AnimatedAbilityCard
              key={ability.id}
              ability={ability}
              onPress={() => onDraftAbility(ability.id)}
            />
          ))}
        </View>
      </View>

      {gameState.players.player.abilities.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>Your Abilities</Text>
          <View style={styles.selectedAbilities}>
            {gameState.players.player.abilities.map((ability) => (
              <AnimatedAbilityCard
                key={ability.id}
                ability={ability}
                compact
                disabled
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
    textShadowColor: '#6B46C1',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  draftContainer: {
    padding: 16,
  },
  draftTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  draftOptions: {
    gap: 8,
  },
  selectedContainer: {
    padding: 16,
  },
  selectedTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  selectedAbilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});