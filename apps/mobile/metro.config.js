const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, '../..');

const defaultConfig = getDefaultConfig(projectRoot);


/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // 1. Watch all files within the monorepo
  watchFolders: [workspaceRoot],
  resolver: {
    // 2. Let Metro know where to resolve packages and in what order
    nodeModulesPaths:  [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
    disableHierarchicalLookup: true,
    unstable_enableSymlinks: true,
    // node js mobile
    blacklistRE: exclusionList([
      /\nodejs-assets\/.*/,
      /\android\/.*/,
      /\/ios\/.*/
    ]),
  },
};

module.exports = mergeConfig(defaultConfig, config);
