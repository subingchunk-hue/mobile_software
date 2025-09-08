// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-0g0d5vtwf73848db',
        traceUser: true,
      })
    }
    
    console.log('小程序启动')
  },
  
  onShow() {
    console.log('小程序显示')
  },
  
  onHide() {
    console.log('小程序隐藏')
  },
  
  globalData: {
    userInfo: null
  }
})