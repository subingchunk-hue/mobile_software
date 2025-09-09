// pages/index/index.js
Page({
  data: {
    currentTab: 0, // 当前选中的Tab索引
    isLoggedIn: false, // 登录状态
    userInfo: null, // 用户信息
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    gameHistory: [], // 游戏历史记录
    recentMemories: [], // 最近回忆记录
    
    // 添加回忆弹窗相关数据
    showModal: false, // 控制弹窗显示
    semesterOptions: [
      '大一上','大一寒假', '大一下', '大一暑假','大二上', '大二寒假','大二下','大二暑假',
      '大三上','大三寒假', '大三下','大三暑假', '大四上', '大四寒假','大四下','大学毕业'
    ],
    semesterIndex: 0, // 当前选中的学期索引
    formData: {
      summary: '', // 事件概括
      description: '', // 详细描述
      mood: '', // 心情记录
      time: '', // 时间记录
      semester: '大一上' // 学期
    },
    selectedImages: [], // 选中的图片
    uploadingImages: false, // 图片上传状态
    uploadProgress: [], // 每张图片的上传进度
    totalProgress: 0 // 总体上传进度
  },

  onLoad() {
    // 页面加载时检查登录状态
    this.checkLoginStatus()
  },

  onShow() {
    // 页面显示时刷新登录状态和游戏历史
    this.checkLoginStatus()
    this.loadGameHistory()
    this.loadRecentMemories()
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      })
    }
  },

  // Tab 切换
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    console.log('切换到 Tab:', index)
    this.setData({
      currentTab: index
    })
    
    // 如果切换到历史Tab，刷新历史数据
    if (index === 1) {
      this.loadGameHistory()
    }
    // 如果切换到回忆Tab，刷新回忆数据
    else if (index === 2) {
      this.loadRecentMemories()
    }
  },

  // 加载游戏历史记录
  loadGameHistory() {
    const gameHistory = wx.getStorageSync('gameHistory') || []
    console.log('加载游戏历史:', gameHistory)
    this.setData({
      gameHistory: gameHistory
    })
  },

  // 游戏相关功能
  startNewGame() {
    // 检查是否有游戏存档
    const gameProgress = wx.getStorageSync('gameProgress')
    if (gameProgress) {
      // 有存档，提示用户确认是否覆盖
      wx.showModal({
        title: '确认开始新游戏',
        content: '检测到未完成的游戏存档，开始新游戏将会覆盖当前存档，是否继续？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 用户确认，清除存档并开始新游戏
            wx.removeStorageSync('gameProgress')
            wx.navigateTo({
              url: '/pages/character-setup/character-setup'
            })
          }
        }
      })
    } else {
      // 没有存档，直接开始新游戏
      wx.navigateTo({
        url: '/pages/character-setup/character-setup'
      })
    }
  },

  continueGame() {
    // 检查是否有游戏存档
    const gameProgress = wx.getStorageSync('gameProgress')
    if (gameProgress) {
      // 有存档，跳转到游戏页面并加载进度
      wx.navigateTo({
        url: '/pages/game/game?loadProgress=true'
      })
    } else {
      // 没有存档，提示用户
      wx.showModal({
        title: '提示',
        content: '没有找到游戏存档，请先开始新游戏',
        showCancel: false,
        confirmText: '确定'
      })
    }
  },

  // 加载最近回忆记录
  loadRecentMemories() {
    const memories = wx.getStorageSync('memories') || []
    // 获取最近3条回忆
    const recentMemories = memories.slice(-3).reverse()
    console.log('加载最近回忆:', recentMemories)
    this.setData({
      recentMemories: recentMemories
    })
  },

  // 切换到回忆Tab
  goToMemoryTab() {
    this.setData({
      currentTab: 2
    })
  },

  // 清除所有游戏历史记录
  clearAllHistory() {
    if (this.data.gameHistory.length === 0) {
      wx.showToast({
        title: '暂无历史记录',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除所有游戏历史记录吗？此操作不可恢复。',
      confirmText: '删除',
      confirmColor: '#ff4757',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储中的游戏历史
          wx.removeStorageSync('gameHistory')
          // 更新页面数据
          this.setData({
            gameHistory: []
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },



  // 微信登录
  wechatLogin() {
    if (this.data.canIUseGetUserProfile) {
      // 使用 getUserProfile 获取用户信息
      wx.getUserProfile({
        desc: '用于完善个人资料',
        success: (res) => {
          console.log('获取用户信息成功', res)
          const userInfo = res.userInfo
          // 保存用户信息到本地存储
          wx.setStorageSync('userInfo', userInfo)
          this.setData({
            isLoggedIn: true,
            userInfo: userInfo
          })
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.log('获取用户信息失败', err)
          wx.showToast({
            title: '登录失败',
            icon: 'error'
          })
        }
      })
    } 
  },

  // 更换头像
  changeAvatar() {
    wx.showActionSheet({
      itemList: ['从相册选择', '选择默认头像'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 从相册选择
          wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: (res) => {
              const tempFilePath = res.tempFiles[0].tempFilePath
              this.updateUserInfo('avatarUrl', tempFilePath)
              wx.showToast({
                title: '头像更新成功',
                icon: 'success'
              })
            },
            fail: (err) => {
              console.log('选择图片失败', err)
            }
          })
        } else if (res.tapIndex === 1) {
          // 跳转到头像选择器
          wx.navigateTo({
            url: '/pages/avatar-selector/avatar-selector?currentAvatar=' + encodeURIComponent(this.data.userInfo.avatarUrl || '')
          })
        }
      }
    })
  },

  // 编辑昵称
  editNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.updateUserInfo('nickName', res.content.trim())
          wx.showToast({
            title: '昵称更新成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 编辑生日
  editBirthday() {
    wx.showModal({
      title: '设置生日',
      editable: true,
      placeholderText: '请输入生日 (如: 1990-01-01)',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          // 简单的日期格式验证
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/
          if (dateRegex.test(res.content.trim())) {
            this.updateUserInfo('birthday', res.content.trim())
            wx.showToast({
              title: '生日设置成功',
              icon: 'success'
            })
          } else {
            wx.showToast({
              title: '日期格式错误',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 更新用户信息
  updateUserInfo(key, value) {
    const userInfo = { ...this.data.userInfo }
    userInfo[key] = value
    
    // 更新本地存储
    wx.setStorageSync('userInfo', userInfo)
    
    // 更新页面数据
    this.setData({
      userInfo: userInfo
    })
  },

  // 从头像选择器更新头像
  updateAvatarFromSelector: function(avatarUrl) {
    this.updateUserInfo('avatarUrl', avatarUrl);
    wx.showToast({
      title: '头像更新成功',
      icon: 'success'
    });
  },

  // 打开相册集
  openPhotoAlbum() {
    wx.navigateTo({
      url: '/pages/photo-album/photo-album'
    })
  },

  // 打开关于页面
  openAbout() {
    wx.showModal({
      title: '关于',
      content: '大学生活模拟器\n版本：1.0.0\n开发者：小F',
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          this.setData({
            isLoggedIn: false,
            userInfo: null
          })
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  // 添加回忆弹窗相关方法
  // 显示添加回忆弹窗
  showAddModal() {
    this.setData({
      showModal: true
    })
  },

  // 隐藏添加回忆弹窗
  hideAddModal() {
    this.setData({
      showModal: false,
      formData: {
        summary: '',
        description: '',
        mood: '',
        time: '',
        semester: this.data.semesterOptions[this.data.semesterIndex]
      },
      selectedImages: [],
      uploadingImages: false
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止点击弹窗内容时关闭弹窗
  },

  // 学期选择器变化
  onSemesterChange(e) {
    const index = e.detail.value
    this.setData({
      semesterIndex: index,
      'formData.semester': this.data.semesterOptions[index]
    })
  },

  // 表单输入处理
  onSummaryInput(e) {
    this.setData({
      'formData.summary': e.detail.value
    })
  },

  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    })
  },

  onMoodInput(e) {
    this.setData({
      'formData.mood': e.detail.value
    })
  },

  onTimeInput(e) {
    this.setData({
      'formData.time': e.detail.value
    })
  },

  // 选择图片
  chooseImages() {
    wx.chooseMedia({
      count: 9 - this.data.selectedImages.length, // 最多9张图片
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(file => ({
          tempFilePath: file.tempFilePath,
          size: file.size
        }))
        
        this.setData({
          selectedImages: [...this.data.selectedImages, ...newImages]
        })
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        })
      }
    })
  },

  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const selectedImages = [...this.data.selectedImages]
    selectedImages.splice(index, 1)
    this.setData({
      selectedImages
    })
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index
    const urls = this.data.selectedImages.map(img => img.tempFilePath)
    wx.previewImage({
      current: urls[index],
      urls: urls
    })
  },

  // 上传图片到云存储
  async uploadImages() {
    if (this.data.selectedImages.length === 0) {
      return []
    }

    const imageCount = this.data.selectedImages.length
    this.setData({ 
      uploadingImages: true,
      uploadProgress: new Array(imageCount).fill(0),
      totalProgress: 0
    })
    
    try {
      const uploadPromises = this.data.selectedImages.map((image, index) => {
        const cloudPath = `memories/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${image.tempFilePath.split('.').pop()}`
        
        return new Promise((resolve, reject) => {
          const uploadTask = wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: image.tempFilePath,
            success: resolve,
            fail: reject
          })
          
          // 监听上传进度
          uploadTask.onProgressUpdate((res) => {
            const progress = Math.round(res.progress)
            const currentProgress = [...this.data.uploadProgress]
            currentProgress[index] = progress
            
            // 计算总体进度
            const totalProgress = Math.round(currentProgress.reduce((sum, p) => sum + p, 0) / imageCount)
            
            this.setData({
              uploadProgress: currentProgress,
              totalProgress: totalProgress
            })
          })
        })
      })
      
      const results = await Promise.all(uploadPromises)
      const imageUrls = results.map(res => res.fileID)
      
      console.log('图片上传成功:', imageUrls)
      return imageUrls
    } catch (error) {
      console.error('图片上传失败:', error)
      wx.showToast({
        title: '图片上传失败',
        icon: 'error'
      })
      throw error
    } finally {
      this.setData({ 
        uploadingImages: false,
        uploadProgress: [],
        totalProgress: 0
      })
    }
  },

  // 添加回忆
  async addMemory() {
    const { summary, description, mood, time, semester } = this.data.formData
    
    // 验证必填字段
    if (!summary.trim()) {
      wx.showToast({
        title: '请输入事件概括',
        icon: 'none'
      })
      return
    }
    
    if (!description.trim()) {
      wx.showToast({
        title: '请输入详细描述',
        icon: 'none'
      })
      return
    }
    
    try {
      // 上传图片到云存储
      const imageUrls = await this.uploadImages()
      
      // 创建回忆对象
      const memory = {
        id: Date.now(),
        summary: summary.trim(),
        description: description.trim(),
        mood: mood.trim(),
        time: time.trim(),
        semester: semester,
        images: imageUrls, // 添加图片URL数组
        createTime: new Date().toISOString()
      }
      
      // 获取现有回忆列表
      const memories = wx.getStorageSync('memories') || []
      memories.push(memory)
      
      // 保存到本地存储
      wx.setStorageSync('memories', memories)
      
      // 刷新回忆列表
      this.loadRecentMemories()
      
      // 关闭弹窗
      this.hideAddModal()
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('添加回忆失败:', error)
      wx.showToast({
        title: '添加失败',
        icon: 'error'
      })
    }
  },

  // 查看回忆详情
  viewMemoryDetail: function(e) {
    const memoryId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/memory-detail/memory-detail?id=${memoryId}`
    });
  }
})
 