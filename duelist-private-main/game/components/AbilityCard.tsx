import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Sword, Heart, Shield, Zap, Wind, Droplets, Flame } from 'lucide-react-native';
import { Ability } from '../../types/game';

interface AbilityCardProps {
  ability: Ability;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

const iconMap = {
  sword: Sword,
  heart: Heart,
  shield: Shield,
  zap: Zap,
  droplets: Droplets,
  flame: Flame,
  wind: Wind,
  snowflake: Zap, // Using Zap as placeholder for snowflake
};

export function AbilityCard({ ability, onPress, selected, disabled, compact }: AbilityCardProps) {
  const IconComponent = iconMap[ability.icon as keyof typeof iconMap] || Sword;
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'damage': return '#EF4444';
      case 'heal': return '#10B981';
      case 'block': return '#6B7280';
      case 'stun': return '#8B5CF6';
      case 'dodge': return '#06B6D4';
      case 'drain': return '#EC4899';
      case 'poison': return '#22C55E';
      case 'freeze': return '#3B82F6';
      default: return '#F59E0B';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        compact && styles.compactCard,
        selected && styles.selected,
        disabled && styles.disabled,
        { borderColor: getTypeColor(ability.type) }
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <IconComponent
          size={compact ? 16 : 24}
          color={getTypeColor(ability.type)}
          strokeWidth={2}
        />
        <Text style={[styles.name, compact && styles.compactName]}>{ability.name}</Text>
        <View style={[styles.powerBadge, { backgroundColor: getTypeColor(ability.type) }]}>
          <Text style={styles.power}>{ability.power}</Text>
        </View>
      </View>
      {!compact && (
        <Text style={styles.description}>{ability.description}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1F1F23',
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
});