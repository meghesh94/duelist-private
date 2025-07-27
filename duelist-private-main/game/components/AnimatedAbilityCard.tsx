import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { Sword, Heart, Shield, Zap, Wind, Droplets, Flame } from 'lucide-react-native';
import { Ability } from '../../types/game';

interface AnimatedAbilityCardProps {
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

export function AnimatedAbilityCard({ 
  ability, 
  onPress, 
  selected, 
  disabled, 
  compact 
}: AnimatedAbilityCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const IconComponent = iconMap[ability.icon as keyof typeof iconMap] || Sword;
  
  useEffect(() => {
    if (selected) {
      // Glow animation for selected card
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [selected, glowAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

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

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(107, 70, 193, 0)', 'rgba(107, 70, 193, 0.6)'],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.cardShadow,
          selected && {
            shadowColor: glowColor,
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card,
            compact && styles.compactCard,
            selected && styles.selected,
            disabled && styles.disabled,
            { borderColor: getTypeColor(ability.type) }
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.9}
        >
          <View style={styles.header}>
            <IconComponent
              size={compact ? 16 : 24}
              color={getTypeColor(ability.type)}
              strokeWidth={2}
            />
            <Text style={[styles.name, compact && styles.compactName]}>
              {ability.name}
            </Text>
            <View style={[styles.powerBadge, { backgroundColor: getTypeColor(ability.type) }]}>
              <Text style={styles.power}>{ability.power}</Text>
            </View>
          </View>
          {!compact && (
            <Text style={styles.description}>{ability.description}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    backgroundColor: '#1F1F23',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    margin: 8,
  },
  compactCard: {
    padding: 8,
    margin: 4,
  },
  selected: {
    backgroundColor: '#2D1B69',
    borderColor: '#10B981',
    borderWidth: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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