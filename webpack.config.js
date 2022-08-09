const path = require('path');


module.exports = {
    mode: 'development',
    devServer: {
        static: './dist',
      },

module: {
        rules: [
         {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
         },
         {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
         }
        ],
      },
  };