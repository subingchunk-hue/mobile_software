// pages/photo-album/photo-album.js
Page({
  data: {
    albumGroups: [] // 按回忆事件分组的相册数据
  },

  onLoad() {
    this.loadAlbumData()
  },

  onShow() {
    // 每次显示页面时重新加载数据，以防有新照片添加
    this.loadAlbumData()
  },

  // 加载相册数据
  loadAlbumData() {
    try {
      // 从本地存储获取回忆数据
      const memories = wx.getStorageSync('memories') || [];
      
      // 过滤出有图片的回忆并按学期分组
      const groupedMemories = {};
      memories.forEach(memory => {
        // 检查回忆是否有图片（支持images或imageUrls字段）
        const imageList = memory.images || memory.imageUrls || [];
        if (imageList && imageList.length > 0) {
          const key = `${memory.semester || '未知学期'} - ${memory.summary || '未命名回忆'}`;
          if (!groupedMemories[key]) {
            groupedMemories[key] = {
              title: key,
              semester: memory.semester || '未知学期',
              summary: memory.summary || '未命名回忆',
              description: memory.description || '',
              mood: memory.mood || '',
              time: memory.time || '',
              createTime: memory.createTime || '',
              images: []
            };
          }
          // 确保图片URL是有效的
          const validImages = imageList.filter(img => img && typeof img === 'string');
          groupedMemories[key].images.push(...validImages);
        }
      });
      
      // 转换为数组格式并按创建时间排序
      const albumGroups = Object.values(groupedMemories).sort((a, b) => {
        return new Date(b.createTime || 0) - new Date(a.createTime || 0);
      });
      
      console.log('加载的相册数据:', albumGroups);
      
      this.setData({
        albumGroups: albumGroups
      });
    } catch (error) {
      console.error('加载相册数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  // 预览照片
  previewPhoto(e) {
    const { current, urls } = e.currentTarget.dataset;
    
    wx.previewImage({
      current: current,
      urls: urls
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  }
})