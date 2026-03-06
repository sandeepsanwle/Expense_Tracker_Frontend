const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const babelLoaderConfiguration = {
  test: /\.(js|jsx|ts|tsx)$/,
  include: [
    path.resolve(__dirname, 'index.web.js'),
    path.resolve(__dirname, 'App.js'),
    path.resolve(__dirname, 'src'),
    // Transpile these RN packages that ship un-compiled source
    path.resolve(__dirname, 'node_modules/react-native-vector-icons'),
    path.resolve(__dirname, 'node_modules/@expo/vector-icons'),
    path.resolve(__dirname, 'node_modules/react-native-paper'),
    path.resolve(__dirname, 'node_modules/react-native-safe-area-context'),
    path.resolve(__dirname, 'node_modules/react-native-reanimated'),
    path.resolve(__dirname, 'node_modules/react-native-gesture-handler'),
    path.resolve(__dirname, 'node_modules/react-native-worklets'),
    path.resolve(__dirname, 'node_modules/react-native-screens'),
    path.resolve(__dirname, 'node_modules/react-native-chart-kit'),
    path.resolve(__dirname, 'node_modules/react-native-svg'),
    path.resolve(__dirname, 'node_modules/@react-navigation'),
    path.resolve(__dirname, 'node_modules/@react-native-async-storage'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      sourceType: 'unambiguous',
      presets: [
        ['@babel/preset-env', { targets: { browsers: 'last 2 versions' }, modules: 'commonjs', exclude: ['transform-regenerator'] }],
        '@babel/preset-react',
        '@babel/preset-flow',
        '@babel/preset-typescript',
      ],
      plugins: [
        'react-native-web',
        'react-native-reanimated/plugin',
        ['@babel/plugin-transform-class-properties', { loose: true }],
        ['@babel/plugin-transform-private-methods', { loose: true }],
        ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      ],
    },
  },
};

// Load icon fonts as data URIs
const iconFontLoaderConfiguration = {
  test: /\.ttf$/,
  loader: 'url-loader',
  include: path.resolve(__dirname, 'node_modules/react-native-vector-icons'),
};

const cssLoaderConfiguration = {
  test: /\.css$/,
  use: ['style-loader', 'css-loader'],
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  type: 'asset/resource',
};

module.exports = {
  entry: path.resolve(__dirname, 'index.web.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-svg': 'react-native-svg-web',
      '@expo/vector-icons/MaterialCommunityIcons': 'react-native-vector-icons/MaterialCommunityIcons',
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/utils/AsyncStorage.web.js'),
      'react-native/Libraries/Utilities/codegenNativeCommands': 'react-native-web',
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      iconFontLoaderConfiguration,
      cssLoaderConfiguration,
      imageLoaderConfiguration,
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      process: { env: { NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development') } },
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    open: true,
    client: {
      overlay: { warnings: false, errors: true },
    },
  },
};
