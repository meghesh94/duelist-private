import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ability, Player } from '../../types/game';
import { AbilityCard } from './AbilityCard';
import { getCharacter } from '../logic/characters';
import { AnimatedHealthBar } from './AnimatedHealthBar';

interface TurnSummaryProps {
  playerAbility: Ability;
  aiAbility: Ability;
  aiThought: string;
  calculation: { summary: string; playerFinalHp?: number; aiFinalHp?: number };
  visible: boolean;
  onNextTurn: () => void;
  player: Player;
  ai: Player;
}

export function TurnSummaryModal(props: TurnSummaryProps) {
  const { playerAbility, aiAbility, aiThought, calculation, visible, onNextTurn, player, ai } = props;
  if (!visible) return null;

  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 600;
  const playerChar = getCharacter('player');
  const aiChar = getCharacter('ai');

  // Always prefer calculation's final HP if available, else fallback to current
  const playerHp = calculation.playerFinalHp !== undefined
    ? Math.min(calculation.playerFinalHp, player.maxHp)
    : Math.min(player.hp, player.maxHp);
  const aiHp = calculation.aiFinalHp !== undefined
    ? Math.min(calculation.aiFinalHp, ai.maxHp)
    : Math.min(ai.hp, ai.maxHp);

  // Extract hit/miss for fireball for both player and AI from calculation.summary
  function getFireballStatus(actor: 'player' | 'ai') {
    if (!calculation.summary) return undefined;
    const lines = calculation.summary.split('\n');
    const name = actor === 'player' ? 'Riven' : 'Orion';
    const miss = lines.find(l => l.toLowerCase().includes(`${name.toLowerCase()}`) && l.toLowerCase().includes('fireball') && l.toLowerCase().includes('miss'));
    if (miss) return 'Miss';
    const hit = lines.find(l => l.toLowerCase().includes(`${name.toLowerCase()}`) && l.toLowerCase().includes('fireball') && l.toLowerCase().includes('damage'));
    if (hit) return 'Hit';
    return undefined;
  }
  const playerFireballStatus = playerAbility && playerAbility.id === 'fireball' ? getFireballStatus('player') : undefined;
  const aiFireballStatus = aiAbility && aiAbility.id === 'fireball' ? getFireballStatus('ai') : undefined;

  // Direct AI thought (no streaming)
  let aiReason = aiThought;
  if (aiReason) {
    aiReason = aiReason.replace(/^I chose to use the ability [^-–:]+[-–:]+/i, '');
    aiReason = aiReason.replace(/^I chose the ability [^-–:]+(because|to|with|using)?/i, '');
    aiReason = aiReason.replace(/^Used [^-–:]+(because|to|with|using)?/i, '');
    aiReason = aiReason.replace(/^[^:]+:/, '');
    aiReason = aiReason.replace(/^(because|to|with|using)\s*/i, '');
    aiReason = aiReason.trim();
    if (aiReason.length > 0) aiReason = aiReason.charAt(0).toUpperCase() + aiReason.slice(1);
  }

  return (
    <View style={styles.overlay}>
      <View style={[styles.popup, isSmallScreen && styles.popupMobile]}>
        <Text style={styles.title}>Turn Summary</Text>
        {isSmallScreen ? (
          <View style={{ width: '100%', flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <View style={[styles.side, styles.sideMobile, { marginBottom: 12, flex: 1 }]}> 
                <Text style={styles.avatar}>{playerChar.avatar}</Text>
                <Text style={styles.name}>{playerChar.name}</Text>
                <AnimatedHealthBar
                  currentHP={playerHp}
                  maxHP={player.maxHp}
                  color={playerChar.primaryColor}
                  label="You"
                />
                <View style={styles.abilityCardWrapper}>
                  <AbilityCard ability={playerAbility} compact status={playerFireballStatus} />
                </View>
              </View>
              <View style={[styles.side, styles.sideMobile, { marginBottom: 12, flex: 1 }]}> 
                <Text style={styles.avatar}>{aiChar.avatar}</Text>
                <Text style={styles.name}>{aiChar.name}</Text>
                <AnimatedHealthBar
                  currentHP={aiHp}
                  maxHP={ai.maxHp}
                  color={aiChar.primaryColor}
                  label="AI"
                />
                <View style={styles.abilityCardWrapper}>
                  <AbilityCard ability={aiAbility} compact status={aiFireballStatus} />
                </View>
              </View>
            </View>
            {aiReason ? (
              <View style={styles.aiChatRow}>
                <Text style={styles.avatar}>{aiChar.avatar}</Text>
                <View style={styles.aiChatBubble}>
                  <Text style={styles.thoughtText}>{aiReason}</Text>
                  <View style={styles.aiChatTail} />
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={[styles.row, { flex: 1, width: '100%', alignItems: 'flex-start', justifyContent: 'center', gap: 32 }]}> 
            <View style={[styles.side, { marginRight: 16 }]}> 
              <Text style={styles.avatar}>{playerChar.avatar}</Text>
              <Text style={styles.name}>{playerChar.name}</Text>
              <AnimatedHealthBar
                currentHP={playerHp}
                maxHP={player.maxHp}
                color={playerChar.primaryColor}
                label="You"
              />
              <View style={styles.abilityCardWrapper}>
                <AbilityCard ability={playerAbility} compact status={playerFireballStatus} />
              </View>
            </View>
            <View style={[styles.side, { marginLeft: 16, marginRight: 16 }]}> 
              <Text style={styles.avatar}>{aiChar.avatar}</Text>
              <Text style={styles.name}>{aiChar.name}</Text>
              <AnimatedHealthBar
                currentHP={aiHp}
                maxHP={ai.maxHp}
                color={aiChar.primaryColor}
                label="AI"
              />
              <View style={styles.abilityCardWrapper}>
                <AbilityCard ability={aiAbility} compact status={aiFireballStatus} />
              </View>
            </View>
            {aiReason ? (
              <View style={styles.aiChatRow}>
                <Text style={styles.avatar}>{aiChar.avatar}</Text>
                <View style={styles.aiChatBubble}>
                  <Text style={styles.thoughtText}>{aiReason}</Text>
                  <View style={styles.aiChatTail} />
                </View>
              </View>
            ) : null}
          </View>
        )}
        <View style={styles.nextTurnButtonContainer}>
          <TouchableOpacity style={styles.nextTurnButton} onPress={onNextTurn}>
            <Text style={styles.nextTurnText}>Next Turn</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popup: {
    backgroundColor: '#181c24',
    borderRadius: 24,
    padding: 32,
    minWidth: 340,
    minHeight: 320,
    maxWidth: 600,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#2e3545',
  },
  popupMobile: {
    padding: 16,
    minWidth: 0,
    minHeight: 0,
    width: '98%',
    maxWidth: '98%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 18,
    letterSpacing: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 32,
  },
  side: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  sideMobile: {
    width: '100%',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 38,
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  abilityCardWrapper: {
    marginTop: 8,
    marginBottom: 2,
    width: 120,
    alignSelf: 'center',
  },
  thoughtBubble: {
    backgroundColor: '#23283a',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2e3545',
    minWidth: 180,
    maxWidth: 260,
    alignSelf: 'center',
  },
  aiChatRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 18,
    marginBottom: 8,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  aiChatBubble: {
    backgroundColor: '#23283a',
    borderRadius: 16,
    padding: 14,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#2e3545',
    minWidth: 120,
    maxWidth: 260,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  aiChatTail: {
    position: 'absolute',
    left: -14,
    bottom: 8,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderRightWidth: 14,
    borderRightColor: '#23283a',
  },
  thoughtText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
  nextTurnButtonContainer: {
    marginTop: 18,
    width: '100%',
    alignItems: 'center',
  },
  nextTurnButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nextTurnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});