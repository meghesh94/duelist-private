import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { HelpModalContent } from './HelpModalContent';

interface HomeScreenProps {
  onStartDuel: () => void;
}

export function HomeScreen({ onStartDuel }: HomeScreenProps) {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚔️ Shadow Duelist</Text>
      <TouchableOpacity style={styles.button} onPress={onStartDuel}>
        <Text style={styles.buttonText}>Start Duel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => setShowHelp(true)}>
        <Text style={styles.buttonText}>How to Play</Text>
      </TouchableOpacity>
      <Modal
        visible={showHelp}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHelp(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowHelp(false)}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
            <HelpModalContent />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 48,
    textShadowColor: '#EF4444',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  button: {
    backgroundColor: '#F59E42',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#F59E42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 220,
  },
  buttonSecondary: {
    backgroundColor: '#181c24',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E42',
    minWidth: 220,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#181c24',
    borderRadius: 24,
    padding: 16,
    minWidth: 320,
    maxWidth: 600,
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 10,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
});
