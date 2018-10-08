import eventBus from '../EventBus'
import heroDict from '../models/heroDict'
import hero from '../models/hero'
import system from '../models/system'
import commonCtrl from './skill/commonCtrl'
import ZSCtrl from './skill/ZSCtrl'

export default {
  // 设置角色数据
  setUnitData () {
    let isMSUpside = hero.units.some((item, index) => {
      return index < 5 && item.type === 'MS'
    })
    let isMSDownside = hero.units.some((item, index) => {
      return index >= 5 && index < 10 && item.type === 'MS'
    })
    let isSMUpside = hero.units.some((item, index) => {
      return index < 5 && item.type === 'SM'
    })
    let isSMDownside = hero.units.some((item, index) => {
      return index >= 5 && index < 10 && item.type === 'SM'
    })
    let isYDUpside = hero.units.some((item, index) => {
      return index < 5 && item.type === 'YD'
    })
    let isYDDownside = hero.units.some((item, index) => {
      return index >= 5 && index < 10 && item.type === 'YD'
    })
    hero.units = hero.units.map((item, index) => {
      if (item.type) {
        // 选择了英雄，进行初始化
        item.isOpen = true
        item.isActed = false
        item.isDead = false
        // 从字典中搜索匹配项，获取对应信息
        let truth = heroDict.list.find(citem => {
          return citem.name === item.type
        })
        item.hp = item.maxhp = truth.maxhp
        item.maxsp = truth.maxsp
        item.sp = 0
        item.speed = truth.speed
        item.directDamageTotal = 0
        item.skillDamageTotal = 0
        item.damageTotal = 0
        item.actRounds = 0
        item.flagAnger = false
        item.iceblock = 0
        item.flagEnhance = false
        item.flagTiger = false
        item.flagBear = false
        item.flagTree = false
        item.yy = 0
        item.flagTaunt = false
        item.flagEarth = false
        item.flagFaint = false
        item.flagSlow = false
        item.poison = 0
        item.confuse = 0
        item.flagBind = false
        item.flagDrunk = false
        if (index < 5) {
          // 上方
          if (isMSUpside) {
            item.maxhp += 3
            item.hp += 3
            item.flagEnhance = true
          }
          if (isSMUpside) {
            item.flagEarth = true
          }
          if (isYDDownside) {
            // 敌方有园丁
            item.flagBind = true
          }
        } else if (index < 10) {
          // 下方
          if (isMSDownside) {
            item.maxhp += 3
            item.hp += 3
            item.flagEnhance = true
          }
          if (isSMDownside) {
            item.flagEarth = true
          }
          if (isYDUpside) {
            // 敌方有园丁
            item.flagBind = true
          }
        }
      }
      return item
    })

    // 处理木偶的血量
    let upsideMOIndex = ''
    let downsideMOIndex = ''
    let upsideHeroCount = 0
    let downsideHeroCount = 0
    hero.units.forEach((item, index) => {
      if (index < 5) {
        if (item.type) {
          upsideHeroCount++
          if (item.type === 'MO') {
            upsideMOIndex = index
          }
        }
      } else if (index < 10) {
        if (item.type) {
          downsideHeroCount++
          if (item.type === 'MO') {
            downsideMOIndex = index
          }
        }
      }
    })
    if (upsideMOIndex !== '') {
      let copy = hero.units[upsideMOIndex]
      copy.maxhp = 10
      copy.maxhp += 15 * downsideHeroCount - 5 * upsideHeroCount
      copy.hp = copy.maxhp
      hero.units.splice(upsideMOIndex, 1, copy)
    }
    if (downsideMOIndex !== '') {
      let copy = hero.units[downsideMOIndex]
      copy.maxhp = 10
      copy.maxhp += 15 * upsideHeroCount - 5 * downsideHeroCount
      copy.hp = copy.maxhp
      hero.units.splice(downsideMOIndex, 1, copy)
    }
  },
  // 寻找下一个动作单位
  proceedTurn () {
    // 先检查获取胜利
    if (this.checkWin()) {
      return false
    }
    let slotUp = 0
    let slotDown = 0
    let speedUp = -99 // 初始速度设置为-99
    let speedDown = -99 // 初始速度设置为-99
    // 选出上，下方速度最高的有效单位
    for (let i = 0; i < 5; i++) {
      if (hero.units[i].type && hero.units[i].isOpen && !hero.units[i].isActed && !hero.units[i].isDead) {
        if (hero.units[i].speed > speedUp) {
          slotUp = i
          speedUp = hero.units[i].speed
        }
      }
      if (hero.units[i + 5].type && hero.units[i + 5].isOpen && !hero.units[i + 5].isActed && !hero.units[i + 5].isDead) {
        if (hero.units[i + 5].speed > speedDown) {
          slotDown = i
          speedDown = hero.units[i + 5].speed
        }
      }
    }

    if (speedUp === -99 && speedDown === -99) {
      // 无可行动角色，回合结束，重新开始新回合
      this.refreshActionFlag()
      // //清除debuff TODO
      // data.runBuffs();
      system.turn = system.firstHand

      eventBus.$emit('playSound', {
        sound: 'reset'
      })
      system.msg = ['所有单位已重置！', ...system.msg]
    } else if (speedUp !== -99 && speedDown !== -99) {
      // 都存在未动作单位，比较速度大小及先后手
      if (speedUp > speedDown) {
        // 上方
        system.unitIndex = slotUp
        this.makeSkill()
      } else if (speedUp === speedDown) {
        // 速度相同，开始看轮番turn
        if (system.turn === 'up') {
          // 上方
          system.turn = 'down'
          system.unitIndex = slotUp
          this.makeSkill()
        } else {
          // 下方
          system.turn = 'up'
          system.unitIndex = slotDown + 5
          this.makeSkill()
        }
      } else {
        system.unitIndex = slotDown + 5
        this.makeSkill()
      }
    } else {
      // 只有一方存在未动作单位
      if (speedUp === -99) {
        // 下方
        system.unitIndex = slotDown + 5
        this.makeSkill()
      } else {
        // 上方
        system.unitIndex = slotUp
        this.makeSkill()
      }
    }
  },
  // 选择技能
  makeSkill () {
    if (hero.units[system.unitIndex].flagFaint) {
      // 准备行动的角色已被眩晕
      hero.units[system.unitIndex].isActed = true
      eventBus.$emit('playSound', {
        sound: 'faint'
      })
    } else if (hero.units[system.unitIndex].flagDrunk) {
      // 准备行动的角色已被醉酒
      hero.units[system.unitIndex].isActed = true
      eventBus.$emit('playSound', {
        sound: 'drunk'
      })
    } else {
      // 可以行动
      eventBus.$emit('makeSkill')
    }
  },
  // 处理技能
  proceedSkill (skillId = '', targets = []) {
    switch (skillId) {
      case 'C1': // 战士普攻
        ZSCtrl.atk(targets)
        break
      case 'C2': // 战士守备
        commonCtrl.guard()
        break
      default:
        // TODO
    }
  },
  // 刷新action
  refreshActionFlag () {
    hero.units = hero.units.map(item => {
      item.isActed = false
      return item
    })
  },
  // 检查胜利
  checkWin () {
    let isUpsideWin = true
    let isDownsideWin = true
    hero.units.forEach((item, index) => {
      if (index < 5) {
        // 检查上方
        if (item.isOpen && item.type && !item.isDead) {
          isDownsideWin = false
        }
      } else if (index < 10) {
        // 检查下方
        if (item.isOpen && item.type && !item.isDead) {
          isUpsideWin = false
        }
      }
    })

    if (isUpsideWin && isDownsideWin) {
      // 罕见的同归于尽结局...
      system.msg = [`平局未分胜负`, ...system.msg]
      window.alert(`平局未分胜负`)
    } else if (isUpsideWin) {
      // 上方胜利
      system.msg = [`上方获得了最终的胜利！`, ...system.msg]
      window.alert(`上方获得了最终的胜利！`)
    } else if (isDownsideWin) {
      // 下方胜利
      system.msg = [`下方获得了最终的胜利！`, ...system.msg]
      window.alert(`下方获得了最终的胜利！`)
    } else {
      // 还未结束
    }
    return isUpsideWin || isDownsideWin
  }
}
