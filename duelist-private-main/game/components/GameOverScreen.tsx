import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trophy, RotateCcw } from 'lucide-react-native';
import { GameState } from '../../types/game';

interface GameOverScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

export function GameOverScreen({ gameState, onRestart }: GameOverScreenProps) {
  const isVictory = gameState.winner === 'player';

  return (
    <View style={styles.container}>
      <View style={styles.resultContainer}>
        <Trophy
          size={80}
          color={isVictory ? '#F59E0B' : '#6B7280'}
          strokeWidth={2}
        />
        
        <Text style={[styles.resultTitle, isVictory ? styles.victory : styles.defeat]}>
          {isVictory ? 'VICTORY!' : 'DEFEAT!'}
        </Text>
        
        <Text style={styles.resultMessage}>
          {isVictory 
            ? 'You have mastered the shadow arts!'
            : 'The shadows have claimed another soul...'
          }
        </Text>

        <View style={styles.finalStats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Final HP:</Text>
            <Text style={styles.statValue}>
              🧙 {gameState.players.player.hp} | 🤖 {gameState.players.ai.hp}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Turns Survived:</Text>
            <Text style={styles.statValue}>{gameState.currentTurn - 1}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
        <RotateCcw size={24} color="#FFFFFF" strokeWidth={2} />
        <Text style={styles.restartText}>Play Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resultTitle: {
    fontSize: 48,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 12,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  victory: {
    color: '#F59E0B',
    textShadowColor: '#F59E0B',
  },
  defeat: {
    color: '#EF4444',
    textShadowColor: '#EF4444',
  },
  resultMessage: {
    color: '#D1D5DB',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  finalStats: {
    backgroundColor: '#1F1F23',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#374151',
    minWidth: 250,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  restartButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  restartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});