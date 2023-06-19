// eslint-disable-next-line
const path = require('path')
// eslint-disable-next-line
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const ImageUploadPlugin = require('./ImageUploadPlugin')
const TerserPlugin = require('terser-webpack-plugin')
const productionGzipExtensions = ['js', 'css']

const args = process.argv.slice(2)
const emitFile = args.includes('--images')

let env = process.env.TARO_ENV //编译时环境
var outputRoot = ''
switch (env) {
  // case 'weapp':
  //   outputRoot= 'dist_weapp'
  //   break
  case 'h5':
    outputRoot = 'dist_h5'
    break
  default:
    outputRoot = 'dist'
}

const config = {
  projectName: 'ec-ticket',
  date: '2019-8-24',
  designWidth: 750,
  deviceRatio: {
    '640': 2.34 / 2,
    '750': 1,
    '828': 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: outputRoot,
  alias: {
    '@@': path.resolve(__dirname, '..', 'src'),
    '@/images': path.resolve(__dirname, '..', 'src/assets/images'),
    '@/request': path.resolve(__dirname, '..', 'src/utils/request'),
    '@components': path.resolve(__dirname, '..', 'src/components'),
    '@utils': path.resolve(__dirname, '..', 'src/utils'),
    '@api': path.resolve(__dirname, '..', 'src/api'),
    '@models': path.resolve(__dirname, '..', 'src/models'),
    '@@types': path.resolve(__dirname, '..', 'src/types'),
    '@constants': path.resolve(__dirname, '..', 'src/constants'),
    '@pages': path.resolve(__dirname, '..', 'src/pages'),
    '@services': path.resolve(__dirname, '..', 'src/services'),
    '@config': path.resolve(__dirname, '..', 'src/config')
  },
  plugins: [
    // '@tarojs/plugin-sass'
  ],
  // fuck ! sass配置无效是taro的问题
  // https://github.com/NervJS/taro/issues/4443
  // 开启webpack5
  compiler: 'webpack5',
  sass: {
    resource: [
      path.resolve(__dirname, '..', 'src/style/_variable.scss'),
      path.resolve(__dirname, '..', 'src/style/_mixins.scss')
    ],
    projectDirectory: path.resolve(__dirname, '..')
  },
  defineConstants: {},
  uglify: {
    enable: true,
    config: {
      // 配置项同 https://github.com/mishoo/UglifyJS2#minify-options
    }
  },
  // terser: {
  //   enable: true,
  //   config: {
  //     // 配置项同 https://github.com/terser/terser#minify-options
  //   }
  // },
  copy: {
    patterns: [
      {
        from: 'src/subpackages/manage/components/GoodsSortView/move.wxs',
        to: 'dist/subpackages/manage/components/GoodsSortView/move.wxs'
      }
    ]
  },
  framework: 'react',
  mini: {
    webpackChain(chain, webpack, PARSE_AST_TYPE) {
      chain.optimization.sideEffects(false)
      chain.plugin('ImageUploadPlugin').use(
        new ImageUploadPlugin({
          excludePath: '/assets/images/tabbar',
          svnConfig: {
            path:
              'http://svn.hzdlsoft.com:3698/svn/ec-web/project/ec-web-doc/webCdn/weapp/ec-ticket',
            username: 'liuyu',
            password: 'Ly654321'
          },
          sshConfig: {
            host: '122.112.255.39',
            port: 9231,
            username: 'dev',
            password: 'dev2009',
            command: `./front cs3d2_webdoc1 'ec-web-doc'`
          },
          enable: args.includes('--images')
        })
      )

      // chain.plugin('analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
      chain.plugin('TerserPlugin').use(
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            ecma: 6
          }
        })
      )

      chain.merge({
        optimization: {
          splitChunks: {
            cacheGroups: {
              'subpackages/cloud_bill/vod': {
                name: 'subpackages/cloud_bill/vod',
                test(module) {
                  return /subpackages[\\/]cloud_bill[\\/]vod-wx-sdk-v2/.test(module.resource)
                },
                priority: 20
              }
              // 'subpackages/cloud_bill/vodh5': {
              //   name: 'subpackages/cloud_bill/vodh5',
              //   test(module) {
              //     return /[\\/]node_modules[\\/](vod-js-sdk-v6|axios|cos-js-sdk-v5)[\\/]/.test(
              //       module.resource
              //     )
              //     // return (
              //     //   /[\\/]node_modules[\\/]vod-js-sdk-v6[\\/]/.test(module.resource) ||
              //     //   /[\\/]node_modules[\\/]cos-js-sdk-v5[\\/]/.test(module.resource) ||
              //     //   /[\\/]node_modules[\\/]axios[\\/]/.test(module.resource)
              //     // )
              //   },
              //   priority: 20
              // }
            }
          }
        }
      })
    },
    // commonChunks(chunks) {
    //   chunks.push('subpackages/cloud_bill/vod')
    //   return chunks
    // },
    addChunkPages(pages, pagesNames) {
      pages.set('subpackages/cloud_bill/pages/video_edit/index', ['subpackages/cloud_bill/vod'])
      pages.set('subpackages/cloud_bill/pages/goods_edit/index', ['subpackages/cloud_bill/vod'])
      // pages.set('subpackages/cloud_bill/pages/video_edit/index', ['subpackages/cloud_bill/vodh5'])
      // pages.set('subpackages/mine/pages/statistics/index', ['echarts'])
    },
    imageUrlLoaderOption: {
      limit: 8192,
      publicPath: 'https://webdoc.hzecool.com/webCdn/weapp/ec-ticket/',
      // outputPath: "assets/",
      emitFile,
      name: '[path][contenthash].[ext]'
    },
    compile: {
      exclude: [
        path.resolve(__dirname, '..', 'src/subpackages/mine/components/ec-canvas/echarts.js'),
        path.resolve(__dirname, '..', 'src/subpackages/cloud_bill/vod_sdk/vod-js-sdk-v6.js'),
        path.resolve(__dirname, '..', 'src/subpackages/cloud_bill/vod-wx-sdk-v2.js'),
        path.resolve(__dirname, '..', 'src/subpackages/ar/pages/index/three_helper/three.weapp.js')
      ]
    },
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
          overrideBrowserslist: ['last 3 versions', 'Android >= 4.1', 'ios >= 8']
        }
      },
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 10240 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    miniCssExtractPluginOption: {
      ignoreOrder: true
    }
  },
  h5: {
    publicPath: process.env.NODE_ENV === 'development' ? '/' : '/web/cloud',
    staticDirectory: 'static',
    esnextModules: ['taro-ui'],
    devServer: {
      // https: true,
      proxy: {
        '/slb': {
          secure: true,
          changeOrigin: true
        }
      }
    },
    router: {
      mode: 'hash',
      basename: '/web/cloud'
    },
    imageUrlLoaderOption: {
      limit: 8192,
      publicPath(url) {
        if (url.includes('.temp/')) {
          url = url.replace(/\.temp\//, '')
        }
        return `https://webdoc.hzecool.com/webCdn/weapp/ec-ticket/${url}`
      },
      // outputPath: "assets/",
      emitFile,
      name: '[path][contenthash].[ext]'
    },
    output: {
      filename:
        process.env.NODE_ENV === 'development'
          ? 'static/js/[name].js'
          : 'static/js/[name].[chunkhash].js',
      chunkFilename:
        process.env.NODE_ENV === 'development'
          ? 'static/js/[name].js'
          : 'static/js/[name].[chunkhash].js'
    },
    miniCssExtractPluginOption: {
      filename:
        process.env.NODE_ENV === 'development'
          ? 'static/css/[name].css'
          : 'static/css/[name].[contenthash].css',
      chunkFilename:
        process.env.NODE_ENV === 'development'
          ? 'static/css/[name].css'
          : 'static/css/[name].[contenthash].css'
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          onePxTransform: false
        }
      },
      autoprefixer: {
        enable: true,
        config: {
          overrideBrowserslist: ['last 3 versions', 'Android >= 4.1', 'ios >= 8']
        }
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      if (process.env.NODE_ENV === 'production') {
        // 生产环境
        chain.merge({
          plugin: {
            install: {
              plugin: CompressionWebpackPlugin,
              args: [
                {
                  filename: '[path].gz[query]', // 旧版是asset
                  algorithm: 'gzip',
                  test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
                  threshold: 10, // Only assets bigger than this size are processed. In bytes.
                  minRatio: 0.8
                }
              ]
            }
          }
        })
      }
    }
  }
}

module.exports = function(merge) {
  let res
  if (process.env.NODE_ENV === 'development') {
    res = merge({}, config, require('./dev'))
  } else {
    res = merge({}, config, require('./prod'))
  }

  if (process.env.PRODUCT_ENVIRONMENT === 'test') {
    res = merge({}, res, require('./env/test'))
  } else if (process.env.PRODUCT_ENVIRONMENT === 'product') {
    res = merge({}, res, require('./env/product'))
  } else {
    res = merge({}, res, require('./env/product'))
  }
  res = merge({}, res, {
    env: {
      INDEPENDENT: process.env.INDEPENDENT
    }
  })
  // console.log(JSON.stringify(res))
  return res
}
