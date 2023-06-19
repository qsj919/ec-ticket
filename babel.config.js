// babel-preset-taro 更多选项和默认值：
// https://github.com/NervJS/taro/blob/next/packages/babel-preset-taro/README.md
// const plugins = ['lodash']
// if (process.env.NODE_ENV === 'production') {
//   plugins.push('transform-remove-console')
// }

module.exports = {
  sourceMap: true,
  presets: [
    [
      'taro',
      {
        framework: 'react',
        ts: true
      }
    ]
  ],
  plugins:
  [
    // 'transform-decorators-legacy',
    // 'transform-class-properties',
    // 'transform-object-rest-spread',
    // [
    //   'transform-runtime',
    //   {
    //     helpers: false,
    //     polyfill: false,
    //     regenerator: true,
    //     moduleName: 'babel-runtime'
    //   }
    // ]      
    // '@babel/plugin-transform-runtime',
    // '@babel/plugin-proposal-decorators'                                                                                                                                                  
  ]

}
