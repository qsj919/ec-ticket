# 电子小票



## 小程序 / h5 适配注意点

1. 二维码
   - 小程序使用`weapp-qrcode`
   - h5使用`qrcode`，在运行小程序时，需移除该库，否则会报错。
2. 页面/导航
   - tab页面的导航，小程序**必须**使用`switchTab`，h5可以使用`navigateTo`
   - 小程序点击tab，不会触发`didMount`，h5会执行一遍完整的生命周期
3. video组件
   - 小程序中使用的是Taro组件
   - h5使用的是原生标签`<video>`

