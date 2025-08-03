const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.platforms = ['ios', 'android', 'native', 'web'];
defaultConfig.resolver.assetExts.push('cjs');

module.exports = defaultConfig;