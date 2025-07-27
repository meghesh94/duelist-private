
export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
  };
};
