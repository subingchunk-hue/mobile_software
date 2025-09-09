// memory-detail.js
Page({
  data: {
    memoryDetail: {},
    isEditing: false,
    editTitle: '',
    editSummary: '',
    editDescription: '',
    editMood: '',
    editImages: []
  },

  onLoad: function(options) {
    // 从页面参数获取回忆ID
    const memoryId = options.id;
    if (memoryId) {
      this.loadMemoryDetail(memoryId);
    } else {
      wx.showToast({
        title: '回忆不存在',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载回忆详情
  loadMemoryDetail: function(memoryId) {
    try {
      // 从本地存储获取所有回忆
      const memories = wx.getStorageSync('memories') || [];
      
      // 查找对应的回忆（确保ID类型匹配）
      const memory = memories.find(item => item.id == memoryId);
      
      if (memory) {
        this.setData({
          memoryDetail: memory
        });
      } else {
        wx.showToast({
          title: '回忆不存在',
          icon: 'error'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('加载回忆详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 删除回忆
  deleteMemory: function() {
    const that = this;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条回忆吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#ff4757',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          that.performDelete();
        }
      }
    });
  },

  // 执行删除操作
  performDelete: function() {
    try {
      const memoryId = this.data.memoryDetail.id;
      
      // 从本地存储获取所有回忆
      const memories = wx.getStorageSync('memories') || [];
      
      // 过滤掉要删除的回忆
      const updatedMemories = memories.filter(item => item.id != memoryId);
      
      // 更新本地存储
      wx.setStorageSync('memories', updatedMemories);
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      
    } catch (error) {
      console.error('删除回忆失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    }
  },

  // 修改回忆
  editMemory: function() {
    if (!this.data.memoryDetail) {
      wx.showToast({
        title: '回忆数据不存在',
        icon: 'error'
      });
      return;
    }
    
    this.setData({
      isEditing: true,
      editTitle: this.data.memoryDetail.title || '',
      editSummary: this.data.memoryDetail.summary || '',
      editDescription: this.data.memoryDetail.description || '',
      editMood: this.data.memoryDetail.mood || '',
      editImages: [...(this.data.memoryDetail.images || [])]
    });
  },

  // 输入事件处理
  onTitleInput(e) {
    this.setData({
      editTitle: e.detail.value
    });
  },

  onSummaryInput(e) {
    this.setData({
      editSummary: e.detail.value
    });
  },

  onDescriptionInput(e) {
    this.setData({
      editDescription: e.detail.value
    });
  },

  onMoodInput(e) {
    this.setData({
      editMood: e.detail.value
    });
  },

  // 保存编辑
  saveEdit() {
    const { editTitle, editSummary, editDescription, editMood, editImages } = this.data;
    
    if (!editTitle.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'error'
      });
      return;
    }

    const updatedMemory = {
      ...this.data.memoryDetail,
      title: editTitle,
      summary: editSummary,
      description: editDescription,
      mood: editMood,
      images: editImages
    };

    // 更新本地存储
    const memories = wx.getStorageSync('memories') || [];
    const index = memories.findIndex(item => item.id === updatedMemory.id);
    if (index !== -1) {
      memories[index] = updatedMemory;
      wx.setStorageSync('memories', memories);
    }

    this.setData({
      memoryDetail: updatedMemory,
      isEditing: false
    });

    wx.showToast({
      title: '修改成功',
      icon: 'success'
    });
  },

  // 取消编辑
  cancelEdit() {
    this.setData({
      isEditing: false
    });
  },

  // 添加照片
  addPhoto() {
    const that = this;
    wx.chooseMedia({
      count: 9 - this.data.editImages.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const newImages = res.tempFiles.map(file => file.tempFilePath);
        that.setData({
          editImages: [...that.data.editImages, ...newImages]
        });
      }
    });
  },

  // 删除照片
  deletePhoto(e) {
    const index = e.currentTarget.dataset.index;
    const editImages = this.data.editImages;
    editImages.splice(index, 1);
    this.setData({
      editImages
    });
  }
});