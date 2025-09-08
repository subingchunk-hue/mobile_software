// pages/character-setup/character-setup.js
Page({
  data: {
    selectedGender: '', // 选中的性别
    selectedMajor: '', // 选中的专业
    genders: [
      { id: 'male', name: '男'},
      { id: 'female', name: '女'}
    ],
    majors: [
      { id: 'computer', name: '工科生'},
      { id: 'business', name: '医学生'},
      { id: 'medicine', name: '法学生' },
      { id: 'engineering', name: '文科生'},
      { id: 'art', name: '艺术生'},
      { id: 'education', name: '体育生'}
    ],
    isGenerating: false 
  },

  onLoad(options) {
    console.log('角色设置页面加载')
  },

  // 选择性别
  selectGender(e) {
    const genderId = e.currentTarget.dataset.id
    this.setData({
      selectedGender: genderId
    })
  },

  // 选择专业
  selectMajor(e) {
    const majorId = e.currentTarget.dataset.id
    this.setData({
      selectedMajor: majorId
    })
  },

  // 确认选择
  confirmSelection() {
    if (!this.data.selectedGender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return
    }

    if (!this.data.selectedMajor) {
      wx.showToast({
        title: '请选择专业',
        icon: 'none'
      })
      return
    }

    // 开始生成角色
    this.startGenerating()
  },

  // 开始生成角色
  startGenerating() {
    this.setData({
      isGenerating: true
    })

    // 模拟生成过程，3秒后跳转到游戏主界面
    setTimeout(() => {
      // 保存角色信息到本地存储
      const characterInfo = {
        gender: this.data.selectedGender,
        major: this.data.selectedMajor,
        genderName: this.data.genders.find(g => g.id === this.data.selectedGender)?.name,
        majorName: this.data.majors.find(m => m.id === this.data.selectedMajor)?.name
      }
      
      wx.setStorageSync('characterInfo', characterInfo)
      
      // 跳转到游戏主界面
      wx.redirectTo({
        url: '/pages/game/game'
      })
    }, 3000)
  }
})