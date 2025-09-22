module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@components': './src/components',
          '@features': './src/features',
          '@lib': './src/lib',
          '@hooks': './src/hooks',
          '@constants': './src/constants',
          '@utils': './src/utils',
          '@navigation': './src/navigation',
          '@assets': './src/assets',
          '@types': './src/@types'
        }
      }
    ]
  ]
};