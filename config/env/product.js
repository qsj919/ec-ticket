/*
 * @Author: GaoYuJian
 * @Date: 2019-10-15 11:38:10
 * @Last Modified by: HuKai
 * @Last Modified time: 2019-10-17 10:13:38
 * @Desc 正式环境
 */

module.exports = {
  env: {
    PRODUCT_ENVIRONMENT: '"product"'
  },
  defineConstants: {},
  h5: {
    devServer: {
      proxy: {
        '/slb': {
          target: 'https://bao.hzecool.com'
        }
      }
    }
  }
}
