// pages/game/game.js
Page({
    data: {
      // 用户信息
      userInfo: null,
      characterInfo: null,
      
      // 历史记录
      // 当前游戏的选择记录
      currentGameChoices: [],
      
      // 游戏数值
      gameValues: {
        health: 80,      // 健康
        happiness: 75,   // 快乐
        intelligence: 70, // 智力
        wealth: 60,      // 财富
        social: 65       // 社交
      },
      
      // 当前事件
      currentEvent: {
        title: "大学生活开始了！",
        description: "你刚刚进入大学，面临着新的挑战和机遇。你的选择将影响你的未来发展。",
        image: "🎓"
      },
      
      // 游戏状态
      journeyStarted: false,
      currentYear: 1,  // 当前年级 1-4
      currentSemester: 1, // 当前学期 1-2
      eventIndex: 0,   // 当前事件索引
      gameEnded: false, // 游戏是否结束
      includePersonalMemories: false, // 是否加入个人回忆
      gameFlags: {     // 游戏标记，影响后续事件
        joinedLab: false,
        joinedCompetition: false,
        hasRelationship: false,
        cet4Passed: false,
        cet6Passed: false
      }
    },
  
    onLoad(options) {
      this.initializeGame()
      // 检查是否有传入的加载存档参数
      if (options.loadProgress === 'true') {
        this.loadGameProgress()
      }
    },
  
    onUnload() {
      // 页面卸载时自动保存游戏进度
      this.saveGameProgress()
    },
  
    onHide() {
      // 页面隐藏时自动保存游戏进度
      this.saveGameProgress()
    },
  
    // 初始化游戏
    initializeGame() {
      // 获取用户信息
      const userInfo = wx.getStorageSync('userInfo')
      const characterInfo = wx.getStorageSync('characterInfo')
      
      this.setData({
        userInfo: userInfo,
        characterInfo: characterInfo
      })
      
      console.log('游戏初始化完成', { userInfo, characterInfo })
    },
  
    // 开始旅程
    startJourney() {
      // 显示回忆选择弹窗
      wx.showModal({
        title: '回忆加入选择',
        content: '是否将你的个人回忆加入到游戏主线中？\n\n选择"是"：游戏中会融入你的个人经历\n选择"否"：使用默认的游戏剧情',
        confirmText: '是',
        cancelText: '否',
        success: (res) => {
          if (res.confirm) {
            // 用户选择加入个人回忆
            this.setData({
              includePersonalMemories: true
            })
            console.log('用户选择加入个人回忆')
          } else {
            // 用户选择不加入个人回忆
            this.setData({
              includePersonalMemories: false
            })
            console.log('用户选择不加入个人回忆')
          }
          
          // 开始游戏
          this.setData({
            journeyStarted: true,
            currentGameChoices: [] // 清空选择记录
          })
          
          // 开始第一个事件
          this.nextEvent()
        }
      })
    },
  
    // 进入下一个事件
    nextEvent() {
      const { currentYear, currentSemester, eventIndex } = this.data
      const events = this.getEventsForYear(currentYear)
      
      if (eventIndex < events.length) {
        const event = events[eventIndex]
        this.setData({
          currentEvent: event,
          eventIndex: eventIndex + 1
        })
      } else {
        // 当前年级事件结束，进入下一年级或结束游戏
        this.advanceYear()
      }
    },
  
    // 进入下一年级
    advanceYear() {
      const { currentYear } = this.data
      
      if (currentYear < 4) {
        this.setData({
          currentYear: currentYear + 1,
          eventIndex: 0
        })
        this.nextEvent()
      } else {
        // 游戏结束
        this.gameEnd()
      }
    },
  
    // 获取指定年级的事件
    getEventsForYear(year) {
      const eventsByYear = {
        1: [ // 大一
          {
            title: "军训开始",
            description: "炎热的夏天，你开始了为期两周的军训生活。严格的训练让你感到疲惫，但也锻炼了意志。",
            choices: [
              { text: "认真训练，严格要求自己", effects: { health: -5, social: +10, intelligence: +5 } },
              { text: "偷懒摸鱼，能躲就躲", effects: { health: +5, social: -5, happiness: +5 } }
            ]
          },
          {
            title: "开学典礼",
            description: "隆重的开学典礼上，校长发表了激励人心的讲话。你对未来的大学生活充满期待。",
            choices: [
              { text: "认真聆听，制定学习计划", effects: { intelligence: +10, happiness: +5 } },
              { text: "走神想其他事情", effects: { happiness: +5, social: +5 } }
            ]
          },
          {
            title: "宿舍聚餐",
            description: "室友们提议一起出去聚餐，增进感情。这是建立友谊的好机会。",
            choices: [
              { text: "积极参与，主动买单", effects: { social: +15, wealth: -10, happiness: +10 } },
              { text: "参与但AA制", effects: { social: +10, happiness: +5 } },
              { text: "以学习为由拒绝", effects: { intelligence: +5, social: -5 } }
            ]
          },
          {
            title: "第一次早八课",
            description: "你的第一门专业课安排在早上8点。起床铃响起，你需要做出选择。",
            choices: [
              { text: "准时起床，认真听课", effects: { intelligence: +10, health: -5 } },
              { text: "迟到但还是去了", effects: { intelligence: +5, social: -5 } },
              { text: "继续睡觉，翘课", effects: { health: +10, intelligence: -10, happiness: +5 } }
            ]
          },
          {
            title: "选择社团",
            description: "社团招新开始了，各种社团都在招募新成员。你需要选择一个适合自己的社团。",
            choices: [
              { text: "加入学术类社团", effects: { intelligence: +15, social: +5 } },
              { text: "加入文艺类社团", effects: { happiness: +15, social: +10 } },
              { text: "加入体育类社团", effects: { health: +15, social: +10 } },
              { text: "不加入任何社团", effects: { wealth: +5, intelligence: +5 } }
            ]
          },
          {
            title: "期中考试",
            description: "第一次大学期中考试来临，你需要决定如何应对。",
            choices: [
              { text: "提前一周开始复习", effects: { intelligence: +15, health: -5, happiness: -5 } },
              { text: "考前突击复习", effects: { intelligence: +10, health: -10, happiness: -10 } },
              { text: "随缘应考", effects: { happiness: +5, intelligence: -5 } }
            ]
          },
          {
            title: "四级考试",
            description: "英语四级考试报名开始，这是大学生必须面对的挑战之一。",
            choices: [
              { text: "认真准备，背单词刷题", effects: { intelligence: +10, happiness: -5 }, flag: 'cet4Prepared' },
              { text: "裸考试试运气", effects: { happiness: +5 }, flag: 'cet4Unprepared' }
            ]
          }
        ],
        2: [ // 大二
          {
            title: "专业课学习",
            description: "大二开始接触更多专业课程，学习难度明显增加。你需要调整学习方法。",
            choices: [
              { text: "课前预习，课后复习", effects: { intelligence: +15, health: -5 } },
              { text: "只听课，不预习复习", effects: { intelligence: +5, happiness: +5 } },
              { text: "经常逃课，考前突击", effects: { happiness: +10, intelligence: -10 } }
            ]
          },
          {
            title: "实验室机会",
            description: "导师邀请你加入实验室，参与科研项目。这将占用你很多时间，但对未来发展有帮助。",
            choices: [
              { text: "加入实验室，专心科研", effects: { intelligence: +20, social: -5, wealth: +5 }, flag: 'joinedLab' },
              { text: "拒绝，专注课业", effects: { intelligence: +10, happiness: +5 } }
            ]
          },
          {
            title: "竞赛机会",
            description: "学校举办编程竞赛，获奖可以为简历加分。但需要投入大量时间准备。",
            choices: [
              { text: "报名参加，全力准备", effects: { intelligence: +15, health: -10, social: -5 }, flag: 'joinedCompetition' },
              { text: "不参加，保持现状", effects: { happiness: +5, health: +5 } }
            ]
          },
          {
            title: "恋爱机会",
            description: "你遇到了一个很有好感的人，对方似乎也对你有意思。要不要开始一段恋情？",
            choices: [
              { text: "勇敢表白，开始恋爱", effects: { happiness: +20, social: +10, wealth: -10 }, flag: 'hasRelationship' },
              { text: "专注学业，暂不考虑", effects: { intelligence: +10, happiness: -5 } }
            ]
          }
        ],
        3: [ // 大三
          {
            title: "保研还是考研？",
            description: "大三下学期，你需要为未来做出重要决定：是争取保研资格还是准备考研？",
            choices: [
              { text: "争取保研，提高绩点", effects: { intelligence: +20, health: -10, social: -10 } },
              { text: "准备考研，报班学习", effects: { intelligence: +15, wealth: -15, health: -5 } },
              { text: "准备就业，找实习", effects: { social: +15, wealth: +10, intelligence: +5 } }
            ]
          },
          {
            title: "实习机会",
            description: "一家知名公司提供实习机会，但会影响学习时间。要不要去？",
            choices: [
              { text: "接受实习，积累经验", effects: { wealth: +20, social: +10, intelligence: -5 } },
              { text: "拒绝实习，专心学业", effects: { intelligence: +15, happiness: -5 } }
            ]
          },
          {
            title: "毕业论文选题",
            description: "需要选择毕业论文题目，不同的选择会影响你的学习压力和成果。",
            choices: [
              { text: "选择有挑战性的前沿题目", effects: { intelligence: +20, health: -15, happiness: -10 } },
              { text: "选择相对简单的题目", effects: { intelligence: +10, happiness: +10, health: +5 } }
            ]
          }
        ],
        4: [ // 大四
          {
            title: "求职季",
            description: "大四上学期，求职季正式开始。你需要投简历、参加面试。",
            choices: [
              { text: "海投简历，广撒网", effects: { social: +10, health: -10, wealth: -5 } },
              { text: "精准投递，重点准备", effects: { intelligence: +10, social: +5 } }
            ]
          },
          {
            title: "毕业设计答辩",
            description: "毕业设计答辩即将开始，这是大学生涯的最后一次重要考核。",
            choices: [
              { text: "充分准备，力求完美", effects: { intelligence: +15, health: -10 } },
              { text: "正常准备，顺利通过即可", effects: { intelligence: +10, happiness: +5 } }
            ]
          },
          {
            title: "毕业典礼",
            description: "四年大学生活即将结束，毕业典礼上你回顾着这段求学时光。",
            choices: [
              { text: "感慨万千，珍惜友谊", effects: { happiness: +15, social: +10 } },
              { text: "展望未来，迎接挑战", effects: { intelligence: +10, happiness: +10 } }
            ]
          }
        ]
      }
      
      return eventsByYear[year] || []
    },
  
    // 处理选择
     makeChoice(e) {
       const choiceIndex = e.currentTarget.dataset.index
       const { currentEvent, gameValues, gameFlags, currentYear, currentGameChoices } = this.data
       const choice = currentEvent.choices[choiceIndex]
       
       // 记录选择信息
       const choiceRecord = {
         year: currentYear,
         semester: currentYear <= 2 ? 1 : (currentYear === 3 ? (Math.random() > 0.5 ? 1 : 2) : 2), // 简化学期逻辑
         eventTitle: currentEvent.title,
         choiceText: choice.text,
         effects: choice.effects ? this.formatEffects(choice.effects) : null
       }
       
       const newCurrentGameChoices = [...currentGameChoices, choiceRecord]
       
       // 应用选择效果
       const newGameValues = { ...gameValues }
       if (choice.effects) {
         Object.keys(choice.effects).forEach(key => {
           newGameValues[key] = Math.max(0, Math.min(100, newGameValues[key] + choice.effects[key]))
         })
       }
       
       // 设置游戏标记
       const newGameFlags = { ...gameFlags }
       if (choice.flag) {
         if (choice.flag === 'cet4Prepared') {
           newGameFlags.cet4Passed = Math.random() > 0.3 // 70%通过率
         } else if (choice.flag === 'cet4Unprepared') {
           newGameFlags.cet4Passed = Math.random() > 0.8 // 20%通过率
         } else {
           newGameFlags[choice.flag] = true
         }
       }
       
       this.setData({
         gameValues: newGameValues,
         gameFlags: newGameFlags,
         currentGameChoices: newCurrentGameChoices
       })
       
       // 自动保存游戏进度
       this.saveGameProgress()
       
       // 显示选择结果
       let resultText = `你选择了：${choice.text}`
       if (choice.effects) {
         const effects = []
         Object.keys(choice.effects).forEach(key => {
           const value = choice.effects[key]
           const names = {
             health: '健康',
             happiness: '快乐', 
             intelligence: '智力',
             wealth: '财富',
             social: '社交'
           }
           if (value > 0) {
             effects.push(`${names[key]}+${value}`)
           } else if (value < 0) {
             effects.push(`${names[key]}${value}`)
           }
         })
         if (effects.length > 0) {
           resultText += `\n\n效果：${effects.join('，')}`
         }
       }
       
       // 特殊事件结果
       if (choice.flag === 'cet4Prepared' || choice.flag === 'cet4Unprepared') {
         resultText += newGameFlags.cet4Passed ? '\n\n四级考试通过了！' : '\n\n四级考试没通过，下次再努力吧。'
       }
       
       wx.showModal({
         title: '选择结果',
         content: resultText,
         showCancel: false,
         success: () => {
           // 延迟进入下一个事件
           setTimeout(() => {
             this.nextEvent()
           }, 500)
         }
       })
     },

     // 格式化效果文本
     formatEffects(effects) {
       const effectsArray = []
       const names = {
         health: '健康',
         happiness: '快乐',
         intelligence: '智力',
         wealth: '财富',
         social: '社交'
       }
       
       Object.keys(effects).forEach(key => {
         const value = effects[key]
         if (value > 0) {
           effectsArray.push(`${names[key]}+${value}`)
         } else if (value < 0) {
           effectsArray.push(`${names[key]}${value}`)
         }
       })
       
       return effectsArray.join('，')
     },

     // 游戏结束
      gameEnd() {
        const { gameValues, gameFlags, userInfo, characterInfo } = this.data
        
        // 计算最终成就
        let achievements = []
        
        if (gameValues.intelligence >= 90) achievements.push("学霸")
        if (gameValues.social >= 90) achievements.push("社交达人")
        if (gameValues.health >= 90) achievements.push("健康达人")
        if (gameValues.wealth >= 90) achievements.push("理财高手")
        if (gameValues.happiness >= 90) achievements.push("快乐源泉")
        
        if (gameFlags.joinedLab && gameFlags.joinedCompetition) achievements.push("科研竞赛双料王")
        if (gameFlags.cet4Passed && gameFlags.cet6Passed) achievements.push("英语达人")
        if (gameFlags.hasRelationship) achievements.push("恋爱达人")
        
        this.setData({
          currentEvent: {
            title: "大学生涯结束",
            description: `四年大学时光结束了！你获得了以下成就：${achievements.length > 0 ? achievements.join('、') : '普通毕业生'}`,
          },
          gameEnded: true // 标记游戏结束
        })
      },
  
      // 自动保存游戏进度
      saveGameProgress() {
        const { gameValues, currentYear, currentSemester, eventIndex, gameFlags, userInfo, characterInfo, journeyStarted, gameEnded } = this.data
        
        // 如果游戏已结束，不需要保存进度
        if (gameEnded) {
          wx.removeStorageSync('gameProgress')
          return
        }
        
        // 创建游戏进度数据
        const gameProgress = {
          gameValues: gameValues,
          currentYear: currentYear,
          currentSemester: currentSemester,
          eventIndex: eventIndex,
          gameFlags: gameFlags,
          userInfo: userInfo,
          characterInfo: characterInfo,
          journeyStarted: journeyStarted,
          saveTime: new Date().toLocaleString('zh-CN')
        }
        
        // 保存到本地存储
        wx.setStorageSync('gameProgress', gameProgress)
        console.log('游戏进度已保存', gameProgress)
      },
  
      // 加载游戏进度
      loadGameProgress() {
        const gameProgress = wx.getStorageSync('gameProgress')
        if (gameProgress) {
          this.setData({
            gameValues: gameProgress.gameValues,
            currentYear: gameProgress.currentYear,
            currentSemester: gameProgress.currentSemester,
            eventIndex: gameProgress.eventIndex,
            gameFlags: gameProgress.gameFlags,
            userInfo: gameProgress.userInfo,
            characterInfo: gameProgress.characterInfo,
            journeyStarted: gameProgress.journeyStarted
          })
          
          // 加载当前事件
          this.loadCurrentEvent()
          console.log('游戏进度已加载', gameProgress)
          return true
        }
        return false
      },
  
      // 加载当前事件
      loadCurrentEvent() {
        const { currentYear, eventIndex } = this.data
        const events = this.getEventsForYear(currentYear)
        if (events && events[eventIndex]) {
          this.setData({
            currentEvent: events[eventIndex]
          })
        }
      },
  

  
  })