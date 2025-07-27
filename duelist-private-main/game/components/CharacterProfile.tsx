import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Character } from '../../types/game';

interface CharacterProfileProps {
  character: Character;
  hp: number;
  maxHp: number;
  statusEffects: any[];
  showFlavorText?: boolean;
}

export function CharacterProfile({ 
  character, 
  hp, 
  maxHp, 
  statusEffects, 
  showFlavorText 
}: CharacterProfileProps) {
  const hpPercentage = (hp / maxHp) * 100;

  return (
    <View style={[styles.container, { borderColor: character.primaryColor }]}>
      <View style={styles.header}>
        <Text style={styles.avatar}>{character.avatar}</Text>
        <View style={styles.nameSection}>
          <Text style={[styles.name, { color: character.primaryColor }]}>
            {character.name}
          </Text>
          <Text style={[styles.title, { color: character.secondaryColor }]}>
            {character.title}
          </Text>
        </View>
      </View>

      {showFlavorText && (
        <Text style={[styles.flavorText, { color: character.secondaryColor }]}>
          "{character.flavorText}"
        </Text>
      )}

      <View style={styles.hpSection}>
        <Text style={styles.hpText}>
          {hp}/{maxHp} HP
        </Text>
        <View style={styles.hpBarContainer}>
          <View style={styles.hpBarBackground}>
            <View
              style={[
                styles.hpBarFill,
                { 
                  width: `${hpPercentage}%`,
                  backgroundColor: character.primaryColor,
                },
                hpPercentage <= 25 && styles.hpCritical,
                hpPercentage <= 50 && hpPercentage > 25 && styles.hpWarning,
              ]}
            />
          </View>
        </View>
      </View>

      {statusEffects.length > 0 && (
        <View style={styles.statusEffects}>
          {statusEffects.map((effect, index) => (
            <View key={`${effect.id}-${index}`} style={styles.statusEffect}>
              <Text style={styles.statusText}>{effect.name}</Text>
              <Text style={styles.statusDuration}>{effect.duration}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F1F23',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 40,
    marginRight: 16,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  flavorText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  hpSection: {
    marginBottom: 8,
  },
  hpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  hpBarContainer: {
    width: '100%',
  },
  hpBarBackground: {
    height: 10,
    backgroundColor: '#374151',
    borderRadius: 5,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    gap: 6,
  },
  statusEffect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },
  statusDuration: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});