// memory-detail.js
Page({
  data: {
    memoryDetail: {}
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
  }
});