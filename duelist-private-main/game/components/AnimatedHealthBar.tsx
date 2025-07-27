import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface AnimatedHealthBarProps {
  currentHP: number;
  maxHP: number;
  previousHP?: number;
  color: string;
  label: string;
}

export function AnimatedHealthBar({ 
  currentHP, 
  maxHP, 
  previousHP, 
  color, 
  label 
}: AnimatedHealthBarProps) {
  const widthAnim = useRef(new Animated.Value((currentHP / maxHP) * 100)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animate HP bar width change
    Animated.timing(widthAnim, {
      toValue: (currentHP / maxHP) * 100,
      duration: 600,
      useNativeDriver: false,
    }).start();

    // Flash effect on HP change
    if (previousHP !== undefined && previousHP !== currentHP) {
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [currentHP, maxHP, previousHP, widthAnim, flashAnim]);

  const hpPercentage = (currentHP / maxHP) * 100;
  
  const getBarColor = () => {
    if (hpPercentage <= 25) return '#EF4444';
    if (hpPercentage <= 50) return '#F59E0B';
    return color;
  };

  const flashColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}: {currentHP}/{maxHP} HP
      </Text>
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: widthAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
                backgroundColor: getBarColor(),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.flashOverlay,
              { backgroundColor: flashColor },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  barContainer: {
    width: '100%',
  },
  barBackground: {
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
  },
});