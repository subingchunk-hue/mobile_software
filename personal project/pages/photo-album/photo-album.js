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
          const key = memory.summary || '未命名回忆';
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
  },

  // 导出回忆为图片
  exportMemory(e) {
    const index = e.currentTarget.dataset.index;
    const memory = this.data.albumGroups[index];
    
    if (!memory || !memory.images || memory.images.length === 0) {
      wx.showToast({
        title: '没有照片可导出',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '正在生成图片...'
    });

    // 创建画布上下文
    const ctx = wx.createCanvasContext('exportCanvas', this);
    
    // 动态计算画布尺寸 - 基于正方形网格布局
    const canvasWidth = 750;
    let estimatedHeight = 200; // 基础高度：标题+边距
    
    // 估算文字内容高度
    if (memory.semester) estimatedHeight += 40;
    if (memory.description) {
      const lines = this.wrapText({measureText: () => ({width: 0})}, memory.description, canvasWidth - 80, 24);
      estimatedHeight += lines.length * 30 + 20;
    }
    if (memory.mood) estimatedHeight += 50;
    
    // 计算图片区域需要的高度（正方形网格布局）
    const photosPerRow = 3;
    const photoSpacing = 20;
    const photoSize = (canvasWidth - 80 - (photosPerRow - 1) * photoSpacing) / photosPerRow; // 正方形尺寸
    const totalImages = Math.min(memory.images.length, 9);
    const totalRows = Math.ceil(totalImages / photosPerRow);
    const photoAreaHeight = totalRows * (photoSize + photoSpacing) - photoSpacing + 20; // 减去最后一行的间距，加上底部边距
    
    const canvasHeight = estimatedHeight + photoAreaHeight + 100; // 额外边距
    
    // 设置背景
    ctx.fillStyle = '#f8f6f0';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制边框
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvasWidth - 40, canvasHeight - 40);
    
    // 绘制标题
    ctx.fillStyle = '#333';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(memory.title, canvasWidth / 2, 80);
    
    // 绘制描述信息
    let yPos = 130;
    
    // 添加学期信息
    if (memory.semester) {
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#8b4513';
      ctx.textAlign = 'left';
      ctx.fillText(`学期：${memory.semester}`, 50, yPos);
      yPos += 35;
    }
    
    if (memory.description) {
      ctx.font = '24px sans-serif';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'left';
      const lines = this.wrapText(ctx, memory.description, canvasWidth - 80, 24);
      lines.forEach(line => {
        ctx.fillText(line, 50, yPos);
        yPos += 30;
      });
      yPos += 10; // 增加间距
    }
    
    if (memory.mood) {
      ctx.fillStyle = '#8b4513';
      ctx.fillText(`心情：${memory.mood}`, 50, yPos);
      yPos += 40;
    }
    
    // 计算照片布局
    const photoStartY = yPos + 20;
    
    // 下载并绘制照片
    this.drawPhotosOnCanvas(ctx, memory.images, 50, photoStartY, photoSize, 3, 20, () => {
      // 生成图片
      wx.canvasToTempFilePath({
        canvasId: 'exportCanvas',
        success: (res) => {
          wx.hideLoading();
          // 保存到相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({
                title: '已保存到相册',
                icon: 'success'
              });
            },
            fail: (err) => {
              console.error('保存失败:', err);
              wx.showToast({
                title: '保存失败',
                icon: 'error'
              });
            }
          });
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('生成图片失败:', err);
          wx.showToast({
            title: '生成失败',
            icon: 'error'
          });
        }
      }, this);
    });
  },

  // 文本换行处理
  wrapText(ctx, text, maxWidth, lineHeight) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  },

  // 在画布上绘制照片
  drawPhotosOnCanvas(ctx, images, startX, startY, maxPhotoWidth, photosPerRow, photoSpacing, callback) {
    let loadedCount = 0;
    const totalImages = Math.min(images.length, 9); // 最多显示9张照片
    
    if (totalImages === 0) {
      callback();
      return;
    }
    
    const photoSize = maxPhotoWidth; // 正方形尺寸
    
    images.slice(0, totalImages).forEach((imageUrl, index) => {
      wx.getImageInfo({
        src: imageUrl,
        success: (res) => {
          const row = Math.floor(index / photosPerRow);
          const col = index % photosPerRow;
          
          const x = startX + col * (photoSize + photoSpacing);
          const y = startY + row * (photoSize + photoSpacing);
          
          // 绘制白色背景框
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, photoSize, photoSize);
          
          // 计算图片的实际显示尺寸，保持原始比例
          const imgWidth = res.width;
          const imgHeight = res.height;
          const aspectRatio = imgWidth / imgHeight;
          
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
          
          if (aspectRatio > 1) {
            // 横向图片，以正方形的宽度为准
            drawWidth = photoSize;
            drawHeight = photoSize / aspectRatio;
            offsetY = (photoSize - drawHeight) / 2;
          } else {
            // 纵向图片，以正方形的高度为准
            drawHeight = photoSize;
            drawWidth = photoSize * aspectRatio;
            offsetX = (photoSize - drawWidth) / 2;
          }
          
          // 绘制图片（在正方形框内居中显示）
          ctx.drawImage(res.path, x + offsetX, y + offsetY, drawWidth, drawHeight);
          
          loadedCount++;
          if (loadedCount === totalImages) {
            ctx.draw(false, callback);
          }
        },
        fail: (err) => {
          console.error('加载图片失败:', err);
          loadedCount++;
          if (loadedCount === totalImages) {
            ctx.draw(false, callback);
          }
        }
      });
    });
  }
})