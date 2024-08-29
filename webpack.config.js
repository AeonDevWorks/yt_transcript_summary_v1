const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    background: './src/background.ts',
    content: './src/content.ts',
    index: './src/index.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // This will clean the dist folder before each build
  },
  plugins: [
    new Dotenv({
      systemvars: true, // Load all system environment variables as well
    }),
    new CopyPlugin({
      patterns: [
        { 
          from: "public", 
          to: ".",
          globOptions: {
            ignore: ["**/manifest.json"],
          },
        },
        {
          from: "public/manifest.json",
          to: "manifest.json",
        },
        {
          from: "public/icons",
          to: "icons"
        },
      ],
    }),
  ],
};