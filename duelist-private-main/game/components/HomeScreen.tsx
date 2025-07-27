import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';

interface HomeScreenProps {
  onPlay: () => void;
  onHowTo: () => void;
}

export function HomeScreen({ onPlay, onHowTo }: HomeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Shadow Duelist</Text>
      <TouchableOpacity style={styles.button} onPress={onPlay}>
        <Text style={styles.buttonText}>Play Game</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonSecondary} onPress={onHowTo}>
        <Text style={styles.buttonText}>How to</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    borderRadius: 32,
    backgroundColor: '#222',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 40,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  button: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
    marginBottom: 20,
    width: 220,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#222',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
    width: 220,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
