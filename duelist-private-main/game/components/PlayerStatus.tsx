import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Zap, Wind, Droplets, Snowflake } from 'lucide-react-native';
import { Player } from '../../types/game';

interface PlayerStatusProps {
  player: Player;
  isAI?: boolean;
}

export function PlayerStatus({ player, isAI }: PlayerStatusProps) {
  const hpPercentage = (player.hp / player.maxHp) * 100;
  
  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'block': return Zap;
      case 'stun': return Zap;
      case 'dodge': return Wind;
      case 'poison': return Droplets;
      case 'freeze': return Snowflake;
      default: return Zap;
    }
  };

  return (
    <View style={[styles.container, isAI && styles.aiContainer]}>
      <View style={styles.avatarSection}>
        <Text style={styles.avatar}>{player.avatar}</Text>
        <Text style={styles.name}>{player.name}</Text>
      </View>
      
      <View style={styles.hpSection}>
        <Text style={styles.hpText}>
          {player.hp}/{player.maxHp} HP
        </Text>
        <View style={styles.hpBarContainer}>
          <View style={styles.hpBarBackground}>
            <View
              style={[
                styles.hpBarFill,
                { width: `${hpPercentage}%` },
                hpPercentage <= 25 && styles.hpCritical,
                hpPercentage <= 50 && hpPercentage > 25 && styles.hpWarning,
              ]}
            />
          </View>
        </View>
      </View>

      {/* Show 'Stunned' label if player is stunned */}
      {player.statusEffects.some(e => e.type === 'stun') && (
        <Text style={{ color: '#EF4444', fontWeight: 'bold', marginTop: 4 }}>Stunned</Text>
      )}
      {player.statusEffects.length > 0 && (
        <View style={styles.statusEffects}>
          {player.statusEffects.map((effect, index) => {
            const StatusIcon = getStatusIcon(effect.type);
            return (
              <View key={`${effect.id}-${index}`} style={styles.statusEffect}>
                <StatusIcon size={16} color="#F59E0B" strokeWidth={2} />
                <Text style={styles.statusText}>{effect.name}</Text>
                <Text style={styles.statusDuration}>{effect.duration}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F1F23',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    borderWidth: 2,
    borderColor: '#6B46C1',
  },
  aiContainer: {
    borderColor: '#EF4444',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 32,
    marginRight: 12,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  hpSection: {
    marginBottom: 8,
  },
  hpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hpBarContainer: {
    width: '100%',
  },
  hpBarBackground: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  hpWarning: {
    backgroundColor: '#F59E0B',
  },
  hpCritical: {
    backgroundColor: '#EF4444',
  },
  statusEffects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusEffect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    marginRight: 2,
  },
  statusDuration: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },
});