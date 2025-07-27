import React, { useRef, useEffect } from 'react';
import { ScrollView, Text, View, StyleSheet, Animated } from 'react-native';
import { Sword, Heart, Shield, Zap, CircleAlert as AlertCircle } from 'lucide-react-native';
import { BattleLogEntry } from '../../types/game';

interface EnhancedBattleLogProps {
  entries: BattleLogEntry[];
  currentTurn: number;
}

interface TurnGroup {
  turn: number;
  entries: BattleLogEntry[];
}

export function EnhancedBattleLog({ entries, currentTurn }: EnhancedBattleLogProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-scroll to bottom when new entries are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Fade in animation for new content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [entries.length, fadeAnim]);

  // Group entries by turn
  const turnGroups: TurnGroup[] = [];
  let currentGroup: TurnGroup | null = null;

  entries.forEach(entry => {
    if (!currentGroup || currentGroup.turn !== entry.turn) {
      currentGroup = { turn: entry.turn, entries: [entry] };
      turnGroups.push(currentGroup);
    } else {
      currentGroup.entries.push(entry);
    }
  });

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'damage': return Sword;
      case 'heal': return Heart;
      case 'status': return Shield;
      case 'system': return AlertCircle;
      default: return Zap;
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'damage': return '#EF4444';
      case 'heal': return '#10B981';
      case 'status': return '#F59E0B';
      case 'system': return '#8B5CF6';
      default: return '#D1D5DB';
    }
  };

  const renderTurnGroup = (group: TurnGroup, index: number) => {
    const isCurrentTurn = group.turn === currentTurn - 1;
    
    return (
      <Animated.View
        key={`turn-${group.turn}`}
        style={[
          styles.turnGroup,
          isCurrentTurn && styles.currentTurnGroup,
          { opacity: fadeAnim }
        ]}
      >
        {group.turn > 0 && (
          <View style={styles.turnHeader}>
            <Text style={[styles.turnTitle, isCurrentTurn && styles.currentTurnTitle]}>
              Turn {group.turn}
            </Text>
          </View>
        )}
        
        {group.entries.map((entry, entryIndex) => {
          const IconComponent = getEntryIcon(entry.type);
          const color = getEntryColor(entry.type);
          
          return (
            <View key={entry.id} style={styles.entryContainer}>
              <View style={[styles.entryIcon, { backgroundColor: color + '20' }]}>
                <IconComponent size={14} color={color} strokeWidth={2} />
              </View>
              <Text style={[styles.entryText, { color }]}>
                {entry.message}
              </Text>
            </View>
          );
        })}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚔️ Battle Chronicle</Text>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {turnGroups.slice(-6).map(renderTurnGroup)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F1F23',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    height: 240,
    borderWidth: 2,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: '#6B46C1',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  turnGroup: {
    marginBottom: 16,
    backgroundColor: '#2A2A2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  currentTurnGroup: {
    borderColor: '#6B46C1',
    backgroundColor: '#2D1B69',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  turnHeader: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  turnTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  currentTurnTitle: {
    color: '#8B5CF6',
  },
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  entryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  entryText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});