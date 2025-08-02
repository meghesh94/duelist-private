import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Sword, Heart, Shield, Zap, Wind, Droplets, Flame, Snowflake } from 'lucide-react-native';
import { Ability } from '../../types/game';

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    margin: 8,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  compactCard: {
    padding: 8,
    margin: 4,
  },
  selected: {
    backgroundColor: '#2D1B69',
    shadowColor: '#10B981',
    shadowOpacity: 0.6,
    borderColor: '#10B981',
  },
  disabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  compactName: {
    fontSize: 14,
  },
  powerBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  power: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
  status: {
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
    alignSelf: 'center',
    letterSpacing: 1,
  },
  statusHit: {
    color: '#10B981',
  },
  statusMiss: {
    color: '#EF4444',
  },
});

export function AbilityCard(props: {
  ability: Ability;
  compact?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  status?: 'Hit' | 'Miss';
}) {
  const { ability, compact, selected, disabled, onPress, status } = props;

  // Icon selection logic based on ability.icon property
  const getAbilityIcon = (icon: string) => {
    switch (icon) {
      case 'sword': return <Sword size={18} color={getTypeColor(ability.type)} />;
      case 'heart': return <Heart size={18} color={getTypeColor(ability.type)} />;
      case 'shield': return <Shield size={18} color={getTypeColor(ability.type)} />;
      case 'zap': return <Zap size={18} color={getTypeColor(ability.type)} />;
      case 'wind': return <Wind size={18} color={getTypeColor(ability.type)} />;
      case 'droplets': return <Droplets size={18} color={getTypeColor(ability.type)} />;
      case 'flame': return <Flame size={18} color={getTypeColor(ability.type)} />;
      case 'snowflake': return <Snowflake size={18} color={getTypeColor(ability.type)} />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'damage': return '#F59E42';
      case 'heal': return '#10B981';
      case 'block': return '#60A5FA';
      case 'stun': return '#FBBF24';
      case 'dodge': return '#38BDF8';
      case 'drain': return '#3B82F6';
      case 'poison': return '#A3E635';
      case 'freeze': return '#60A5FA';
      default: return '#A1A1AA';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: getTypeColor(ability.type) + '22', borderColor: getTypeColor(ability.type) },
        compact && styles.compactCard,
        selected && styles.selected,
        disabled && styles.disabled,
      ]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        {getAbilityIcon(ability.icon)}
        <Text style={[styles.name, compact && styles.compactName]}>{ability.name}</Text>
        <View style={[styles.powerBadge, { backgroundColor: getTypeColor(ability.type) }]}> 
          <Text style={[styles.power, { color: '#fff', textShadowColor: getTypeColor(ability.type), textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>{ability.power}</Text>
        </View>
      </View>
      {status && (
        <Text style={[styles.status, status === 'Hit' ? styles.statusHit : styles.statusMiss]}>{status}</Text>
      )}
      {!compact && (
        <Text style={styles.description}>{ability.description}</Text>
      )}
    </TouchableOpacity>
  );
}
