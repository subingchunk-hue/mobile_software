// pages/avatar-selector/avatar-selector.js
Page({
  data: {
    avatarList: [
      '/images/0b8a472eb7680c4bcbf71d8078a91185.png',
      '/images/a53548c8334d41f346bff019b75e9cf8.png',
      '/images/b1e8e778ef3e91889b9b555718e10a05.png',
      '/images/bb9d5aec9a995493525eebb8aea575ce.png',
      '/images/d276a6e9f8984a2cf4ddaa3beb99f658.png',
      '/images/default-avatar.svg'
    ],
    selectedAvatar: ''
  },

  onLoad: function (options) {
    // 如果有传入当前头像，设置为选中状态
    if (options.currentAvatar) {
      this.setData({
        selectedAvatar: decodeURIComponent(options.currentAvatar)
      });
    }
  },

  // 选择头像
  selectAvatar: function(e) {
    const avatar = e.currentTarget.dataset.avatar;
    this.setData({
      selectedAvatar: avatar
    });
  },

  // 确认选择
  confirm: function() {
    if (!this.data.selectedAvatar) {
      wx.showToast({
        title: '请选择头像',
        icon: 'none'
      });
      return;
    }

    // 获取上一页面实例
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage) {
      // 调用上一页面的方法更新头像
      prevPage.updateAvatarFromSelector(this.data.selectedAvatar);
    }

    wx.navigateBack();
  },

  // 取消选择
  cancel: function() {
    wx.navigateBack();
  }
});