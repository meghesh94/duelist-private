import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, Animated, Easing, Platform } from 'react-native';
import { Scroll as ScrollIcon, HelpCircle } from 'lucide-react-native';
import { HelpModalContent } from './HelpModalContent';
import { AnimatedAbilityCard } from './AnimatedAbilityCard';
import { CharacterProfile } from './CharacterProfile';
import { EnhancedBattleLog } from './EnhancedBattleLog';
import { TurnSummaryModal } from './TurnSummaryModal';
import { getCalculationMessage } from '../logic/getCalculationMessage';
import { GameState, Ability, AIThought } from '../../types/game';
import { getCharacter } from '../logic/characters';
import { LogoAnimation } from './LogoAnimation';
let LottieComponent;
if (Platform.OS === 'web') {
  LottieComponent = require('lottie-react').default;
} else {
  LottieComponent = require('lottie-react-native').default;
}


interface DuelScreenProps {
  gameState: GameState;
  onSelectAbility: (abilityId: string) => void;
}

export function DuelScreen({ gameState, onSelectAbility }: DuelScreenProps) {
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  const [showTurnSummary, setShowTurnSummary] = useState(false);
  const [turnSummaryData, setTurnSummaryData] = useState<{
    playerAbility: Ability | null;
    aiAbility: Ability | null;
    aiThought: string;
    calculation: { summary: string; playerFinalHp?: number; aiFinalHp?: number };
  }>({ playerAbility: null, aiAbility: null, aiThought: '', calculation: { summary: '' } });
  const [pendingNextTurn, setPendingNextTurn] = useState(false);
  const [showBattleLog, setShowBattleLog] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(false);

  const playerCharacter = getCharacter('player');
  const aiCharacter = getCharacter('ai');

  // Responsive layout
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 600;

  // Find the latest turn present in the battle log
  const latestTurn = gameState.battleLog.length > 0
    ? Math.max(...gameState.battleLog.map(e => e.turn))
    : gameState.currentTurn;
  const latestTurnEntries = gameState.battleLog.filter(e => e.turn === latestTurn);

  // Show summary modal after a turn is resolved (when new entries appear for the turn)
  React.useEffect(() => {
    // Show summary if the latest turn has at least one action entry OR a 'both stunned' status entry
    const hasActionEntry = latestTurnEntries.some(e => e.type === 'action');
    const hasBothStunned = latestTurnEntries.some(e => e.type === 'status' && e.message.toLowerCase().includes('both') && e.message.toLowerCase().includes('stunned'));
    if (
      latestTurnEntries.length > 0 &&
      (hasActionEntry || hasBothStunned) &&
      ['duel', 'action'].includes(gameState.phase) &&
      !pendingNextTurn
    ) {
      // Parse new action log format: actorType:abilityId:abilityName
      const playerActionEntry = latestTurnEntries.find(e => e.type === 'action' && e.message.startsWith('player:'));
      const aiActionEntry = latestTurnEntries.find(e => e.type === 'action' && e.message.startsWith('ai:'));
      const getAbilityFromEntry = (entry: { message: string } | undefined, options: Ability[]): Ability | null => {
        if (!entry) return null;
        const parts = entry.message.split(':');
        if (parts.length < 3) return null;
        const abilityId = parts[1];
        return options.find((a: Ability) => a.id === abilityId) || null;
      };
      const playerAbility = getAbilityFromEntry(playerActionEntry, gameState.playerOptions);
      const aiAbility = getAbilityFromEntry(aiActionEntry, gameState.aiOptions);
      const calculation = getCalculationMessage(latestTurnEntries);
      let aiThoughtEntry = latestTurnEntries.find(e => e.message.toLowerCase().includes('ai thought:'));
      let aiThought = aiThoughtEntry ? aiThoughtEntry.message.replace(/ai thought:/i, '').trim() : '';
      // Fallback: if no AI thought for this turn, use the most recent one in the battle log
      if (!aiThought) {
        const allAIThoughts = [...gameState.battleLog].reverse().filter(e => e.message.toLowerCase().includes('ai thought:'));
        if (allAIThoughts.length > 0) {
          aiThought = allAIThoughts[0].message.replace(/ai thought:/i, '').trim();
        }
      }
      setTurnSummaryData({
        playerAbility: gameState.lastTurnPlayerAbility || playerAbility || null,
        aiAbility: gameState.lastTurnAIAbility || aiAbility || null,
        aiThought,
        calculation,
      });
      setShowTurnSummary(true);
      setPendingNextTurn(true);
      setLoading(false);
    }
  }, [gameState.battleLog.length, gameState.currentTurn, gameState.phase]);

  const handleAbilitySelect = (abilityId: string) => {
    setSelectedAbility(abilityId);
  };

  const handleConfirmAction = (abilityId: string) => {
    setLoading(true);
    onSelectAbility(abilityId);
    setSelectedAbility(null);
  };

  // Handler for Next Turn button in modal
  const handleNextTurn = () => {
    setShowTurnSummary(false);
    setPendingNextTurn(false);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={styles.headerSpacer} />
          <View style={styles.headerTitleWrapper}>
            <LogoAnimation size={48} />
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">Duelist</Text>
          </View>
          <View style={styles.headerIconsWrapper}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowHelp(true)}>
              <HelpCircle size={22} color="#F59E42" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.battleLogButton} onPress={() => setShowBattleLog(true)}>
              <ScrollIcon size={22} color="#F59E42" />
            </TouchableOpacity>
          </View>
        </View>
      {/* Help Modal */}
      <Modal
        visible={showHelp}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHelp(false)}
      >
        <View style={styles.battleLogModalOverlay}>
          <View style={[styles.battleLogModalContent, { maxWidth: 600, minWidth: 320 }]}> 
            <TouchableOpacity style={styles.battleLogCloseButton} onPress={() => setShowHelp(false)}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
            <HelpModalContent />
          </View>
        </View>
      </Modal>
        <Text style={styles.turnText}>Turn {gameState.currentTurn}</Text>

        <View style={[styles.playersContainer, isSmallScreen ? styles.playersContainerMobile : styles.playersContainerDesktop]}>
          <View style={styles.playerCardWrapper}>
            <CharacterProfile
              character={playerCharacter}
              hp={gameState.players.player.hp}
              maxHp={gameState.players.player.maxHp}
              statusEffects={gameState.players.player.statusEffects}
            />
          </View>
          <View style={styles.playerCardWrapper}>
            <CharacterProfile
              character={aiCharacter}
              hp={gameState.players.ai.hp}
              maxHp={gameState.players.ai.maxHp}
              statusEffects={gameState.players.ai.statusEffects}
            />
          </View>
        </View>

        <View style={styles.abilitiesContainer}>
          <Text style={styles.abilitiesTitle}>Choose Your Action</Text>

          <View style={styles.abilities}>
            {gameState.playerOptions.map((ability) => (
              <View key={ability.id} style={{ width: '100%' }}>
                <AnimatedAbilityCard
                  ability={ability}
                  onPress={() => handleAbilitySelect(ability.id)}
                  selected={selectedAbility === ability.id}
                  disabled={gameState.players.player.statusEffects.some(e => e.type === 'stun') || showTurnSummary}
                />
                {selectedAbility === ability.id && !showTurnSummary && (
                  <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirmAction(ability.id)}>
                    <Text style={styles.confirmText}>Play</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Battle Chronicle Modal */}
      <Modal
        visible={showBattleLog}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBattleLog(false)}
      >
        <View style={styles.battleLogModalOverlay}>
          <View style={styles.battleLogModalContent}>
            <TouchableOpacity style={styles.battleLogCloseButton} onPress={() => setShowBattleLog(false)}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
            <EnhancedBattleLog
              entries={gameState.battleLog}
              currentTurn={gameState.currentTurn}
            />
          </View>
        </View>

      </Modal>
      {/* Turn Summary Modal */}
      {showTurnSummary && (turnSummaryData.playerAbility || turnSummaryData.aiAbility || turnSummaryData.calculation || turnSummaryData.aiThought) && (
        <TurnSummaryModal
          playerAbility={turnSummaryData.playerAbility || { id: 'none', name: 'Unknown', description: '', icon: 'sword', type: 'damage', power: 0 }}
          aiAbility={turnSummaryData.aiAbility || { id: 'none', name: 'Unknown', description: '', icon: 'sword', type: 'damage', power: 0 }}
          aiThought={turnSummaryData.aiThought}
          calculation={turnSummaryData.calculation || { summary: 'No calculation available.' }}
          visible={showTurnSummary}
          onNextTurn={handleNextTurn}
          player={gameState.players.player}
          ai={gameState.players.ai}
        />
      )}
      <Modal
        visible={loading}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#222', padding: 32, borderRadius: 16, alignItems: 'center' }}>
            <LottieComponent
              {...(Platform.OS === 'web'
                ? { animationData: require('../assets/sword-fight-lottie.json') }
                : { source: require('../assets/sword-fight-lottie.json') })}
              autoPlay
              loop
              style={{ width: 200, height: 200 }}
            />
            <Text style={{ color: '#fff', fontSize: 20, marginTop: 24 }}>Duel in progress...</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  // Removed duplicate 'title' style
  title: {
    textAlign: 'center',
    textShadowColor: '#EF4444',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    includeFontPadding: false,
    color: '#FFFFFF',
    fontSize: 18,
    maxWidth: '80%',
    overflow: 'hidden',
    fontWeight: '800',
    flexShrink: 1,
    flexGrow: 1,
  },
  turnText: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  playersContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  playersContainerDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
  },
  playersContainerMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    width: '100%',
    gap: 8,
    marginBottom: 8,
  },
  playerCardWrapper: {
    flex: 1,
    alignItems: 'stretch',
  },
  abilitiesContainer: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
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
    width: '100%',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'center',
    minWidth: 120,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 40,
    marginBottom: 8,
    paddingHorizontal: 8,
    position: 'relative',
  },
  headerSpacer: {
    flex: 1,
    minWidth: 0,
  },
  headerTitleWrapper: {
    flex: 2,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  headerIconsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    minWidth: 0,
    gap: 0,
    zIndex: 2,
  },
  battleLogButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  iconButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
  },
  battleLogModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  battleLogModalContent: {
    backgroundColor: '#181c24',
    borderRadius: 24,
    padding: 16,
    minWidth: 320,
    maxWidth: 500,
    width: '92%',
    maxHeight: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    position: 'relative',
  },
  battleLogCloseButton: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 10,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
});