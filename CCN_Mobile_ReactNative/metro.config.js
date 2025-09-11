const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable package exports to fix module resolution issues
config.resolver.unstable_enablePackageExports = false;

// Add additional resolver configuration for better module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure transformer for better compatibility
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;





