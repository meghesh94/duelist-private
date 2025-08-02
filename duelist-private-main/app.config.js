
export default ({ config }) => {
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      'expo-router',
    ],
    extra: {
      ...config.extra,
      OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
  };
};
