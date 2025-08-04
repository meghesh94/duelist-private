import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

let LottieComponent: any;
if (Platform.OS === 'web') {
  LottieComponent = require('lottie-react').default;
} else {
  LottieComponent = require('lottie-react-native').default;
}

export function LogoAnimation({ size = 64 }: { size?: number }) {
  return (
    <View style={styles.container}>
      <LottieComponent
        {...(Platform.OS === 'web'
          ? { animationData: require('../assets/logo-lottie.json') }
          : { source: require('../assets/logo-lottie.json') })}
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
