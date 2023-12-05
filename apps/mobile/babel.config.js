module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        // react-native-quick-crypto
        alias: {
          'crypto': 'react-native-quick-crypto',
          'stream': 'stream-browserify',
          'buffer': '@craftzdog/react-native-buffer',
        },
      },
    ],
    // react-native-reanimated
    'react-native-reanimated/plugin',
  ],
};
