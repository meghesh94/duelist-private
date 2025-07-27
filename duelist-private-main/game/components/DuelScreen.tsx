import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AnimatedAbilityCard } from './AnimatedAbilityCard';
import { CharacterProfile } from './CharacterProfile';
import { EnhancedBattleLog } from './EnhancedBattleLog';
import { GameState } from '../../types/game';
import { getCharacter } from '../logic/characters';

interface DuelScreenProps {
  gameState: GameState;
  onSelectAbility: (abilityId: string) => void;
}

export function DuelScreen({ gameState, onSelectAbility }: DuelScreenProps) {
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  const playerCharacter = getCharacter('player');
  const aiCharacter = getCharacter('ai');

  const handleAbilitySelect = (abilityId: string) => {
    setSelectedAbility(abilityId);
  };

  const handleConfirmAction = () => {
    if (selectedAbility) {
      onSelectAbility(selectedAbility);
      setSelectedAbility(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚔️ Battle in Progress</Text>
      <Text style={styles.turnText}>Turn {gameState.currentTurn}</Text>
      
      <View style={styles.playersContainer}>
        <CharacterProfile
          character={playerCharacter}
          hp={gameState.players.player.hp}
          maxHp={gameState.players.player.maxHp}
          statusEffects={gameState.players.player.statusEffects}
        />
        <CharacterProfile
          character={aiCharacter}
          hp={gameState.players.ai.hp}
          maxHp={gameState.players.ai.maxHp}
          statusEffects={gameState.players.ai.statusEffects}
        />
      </View>

      <EnhancedBattleLog 
        entries={gameState.battleLog} 
        currentTurn={gameState.currentTurn}
      />

      <View style={styles.abilitiesContainer}>
        <Text style={styles.abilitiesTitle}>Choose Your Action</Text>
        
        <View style={styles.abilities}>
          {gameState.playerOptions.map((ability) => (
            <AnimatedAbilityCard
              key={ability.id}
              ability={ability}
              onPress={() => handleAbilitySelect(ability.id)}
              selected={selectedAbility === ability.id}
              disabled={gameState.players.player.statusEffects.some(e => e.type === 'stun')}
            />
          ))}
        </View>

        {selectedAbility && (
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmAction}>
            <Text style={styles.confirmText}>Execute Action</Text>
          </TouchableOpacity>
        )}
      </View>
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
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
    textShadowColor: '#EF4444',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  turnText: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  abilitiesContainer: {
    padding: 16,
  },
  abilitiesTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  abilities: {
    gap: 8,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});