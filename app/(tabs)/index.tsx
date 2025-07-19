import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { useGameState } from '../../game/hooks/useGameState';
import { DraftScreen } from '../../game/components/DraftScreen';
import { DuelScreen } from '../../game/components/DuelScreen';
import { GameOverScreen } from '../../game/components/GameOverScreen';

export default function ShadowDuelistGame() {
  const { gameState, startGame, draftAbility, selectAbility, resetGame } = useGameState();

  useEffect(() => {
    startGame();
  }, [startGame]);

  const renderCurrentScreen = () => {
    switch (gameState.phase) {
      case 'draft':
        return (
          <DraftScreen
            gameState={gameState}
            onDraftAbility={draftAbility}
          />
        );
      case 'duel':
        return (
          <DuelScreen
            gameState={gameState}
            onSelectAbility={selectAbility}
          />
        );
      case 'gameOver':
        return (
          <GameOverScreen
            gameState={gameState}
            onRestart={resetGame}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />
      {renderCurrentScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
});