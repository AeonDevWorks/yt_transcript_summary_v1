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
    clean: true,
  },
  plugins: [
    new Dotenv({
      systemvars: true,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "manifest.json",
          to: "manifest.json",
          transform(content) {
            const jsonContent = JSON.parse(content);
            jsonContent.background.service_worker = "dist/background.js";
            jsonContent.content_scripts[0].js = ["dist/content.js"];
            jsonContent.icons = {
              "16": "dist/icons/icon16.png",
              "48": "dist/icons/icon48.png",
              "128": "dist/icons/icon128.png"
            };
            if (jsonContent.web_accessible_resources) {
              jsonContent.web_accessible_resources[0].resources = ["dist/index.js"];
            }
            return JSON.stringify(jsonContent, null, 2);
          },
        },
        { from: "public/icons", to: "icons" },
      ],
    }),
  ],
};