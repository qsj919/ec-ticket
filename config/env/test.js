/*
 * @Author: GaoYuJian
 * @Date: 2019-10-15 11:35:03
 * @Last Modified by: HuKai
 * @Last Modified time: 2019-10-17 10:13:59
 * @Desc 测试环境
 */

module.exports = {
  env: {
    PRODUCT_ENVIRONMENT: '"test"'
  },
  defineConstants: {},
  h5: {
    devServer: {
      proxy: {
        '/slb': {
          target: 'https://hzdev.hzdlsoft.com'
        }
      }
    }
  }
}
