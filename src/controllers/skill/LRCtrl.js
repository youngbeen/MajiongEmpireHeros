import eventBus from '../../EventBus'
import skillDict from '../../models/skillDict'
import config from '../../models/config'
import hero from '../../models/hero'
import system from '../../models/system'
import diceUtil from '../../utils/diceUtil'
import reduceCtrl from '../reduceCtrl'

export default {
  // 普攻
  atk (targets = []) {
    // 只有一目标
    const youIndex = targets[0]
    let me = hero.units[system.unitIndex]
    let you = hero.units[youIndex]

    me.isActed = true
    me.actRounds++

    // STEP1 计算伤害倍数
    let times = config.normalTimes // 伤害倍数
    // 正常情况
    let timeDice = diceUtil.getDamageTimes()
    times = timeDice.times
    if (you.type === 'WS' && timeDice.dice === 3) {
      // 武僧被动技能，3点修正为偏斜攻击
      times = config.slightTimes
    }
    // STEP2 计算原始伤害
    let tc = ''
    let damage = Math.ceil(diceUtil.rollDice(10) * times)
    if (you.iceblock) {
      // 寒冰屏障
      damage = reduceCtrl.getReducedDamage(damage, 'iceblock')
    } else if (you.flagBear) {
      // 熊形态
      damage = reduceCtrl.getReducedDamage(damage, 'bear')
    }
    if (you.flagEarth && times === config.criticalTimes) {
      // 大地之力反伤
      let newDamage = reduceCtrl.getReducedDamage(damage, 'earth')
      let reflectDamage = newDamage.reflectDamage
      damage = newDamage.leftDamage
      me.hp -= reflectDamage
      if (me.hp <= 0) {
        me.hp = 0
        me.isDead = true
      }
      tc = setTimeout(() => {
        // 显示伤害动效
        eventBus.$emit('animateDamage', {
          targets: [system.unitIndex],
          value: reflectDamage
        })
        system.msg = [`*大地之力*效果使${system.unitIndex + 1}号单位受到${reflectDamage}点反馈伤害`, ...system.msg]
      }, 1500)
    }
    // STEP3 结算
    me.directDamageTotal += damage
    me.damageTotal += damage
    you.hp -= damage
    if (you.hp <= 0) {
      you.hp = 0
      you.isDead = true
    }
    // 显示伤害动效
    eventBus.$emit('animateDamage', {
      targets: [youIndex],
      value: damage,
      sound: 'atklr',
      image: 'effdamarrow'
    })
    system.msg = [`${system.unitIndex + 1}号单位对${youIndex + 1}号单位造成${damage}点伤害`, ...system.msg]

    // 处理伤害后的效果
    if (me.confuse && diceUtil.rollDice(3) === 3) {
      // 蛊惑时1/3的概率自己遭受同等伤害
      me.hp -= damage
      if (me.hp <= 0) {
        me.hp = 0
        me.isDead = true
      }
      let delayTime = 1500
      if (tc) {
        delayTime = 3000
      }
      setTimeout(() => {
        // 显示伤害动效
        eventBus.$emit('animateDamage', {
          targets: [system.unitIndex],
          value: damage
        })
        system.msg = [`*蛊惑*使${system.unitIndex + 1}号单位受到了${damage}点伤害`, ...system.msg]
      }, delayTime)
    }

    // 回写数据
    hero.units.splice(system.unitIndex, 1, me)
    hero.units.splice(youIndex, 1, you)
  },
  // 箭雨
  rain (skillId = '', targets = []) {
    const skill = skillDict.list.find(item => {
      return item.id === skillId
    })
    let me = hero.units[system.unitIndex]
    me.isActed = true
    me.sp -= skill.spCost
    me.actRounds++

    // 寻找所有对方有效单位
    hero.units.forEach((item, index) => {
      if (item.isOpen && item.type && !item.isDead && item.hp) {
        // 有效单位
        if (system.unitIndex > 4 && index < 5) {
          targets.push(index)
        } else if (system.unitIndex < 5 && index > 4) {
          targets.push(index)
        }
      }
    })

    // STEP1 计算伤害
    let damage = 2
    let dice = diceUtil.rollDice()
    if (dice === 6) {
      damage = 5
    } else if (dice === 4 || dice === 5) {
      damage = 3
    }
    targets.forEach(target => {
      let youDamage = damage // 每个单位的最终伤害可能不同
      const youIndex = target
      let you = hero.units[youIndex]

      if (you.iceblock) {
        // 寒冰屏障
        youDamage = reduceCtrl.getReducedDamage(youDamage, 'iceblock')
      } else if (you.flagBear) {
        // 熊形态
        youDamage = reduceCtrl.getReducedDamage(youDamage, 'bear')
      }
      // STEP2 结算
      me.skillDamageTotal += youDamage
      me.damageTotal += youDamage
      you.hp -= youDamage
      if (you.hp <= 0) {
        you.hp = 0
        you.isDead = true
      }
      // 显示伤害动效
      eventBus.$emit('animateDamage', {
        targets: [youIndex],
        value: youDamage,
        sound: 'atklr',
        image: 'effdamarrow'
      })
      system.msg = [`*箭雨*对${youIndex + 1}号单位造成了${youDamage}点伤害`, ...system.msg]

      hero.units.splice(youIndex, 1, you)
    })

    // 回写数据
    hero.units.splice(system.unitIndex, 1, me)
  },
  // 奥术射击
  magicShoot (skillId = '', targets = []) {
    const skill = skillDict.list.find(item => {
      return item.id === skillId
    })
    // 只有一目标
    const youIndex = targets[0]
    let you = hero.units[youIndex]
    let me = hero.units[system.unitIndex]
    me.isActed = true
    me.sp -= skill.spCost
    me.actRounds++

    // STEP1 计算伤害倍数
    let times = config.normalTimes // 伤害倍数
    // 正常情况
    let timeDice = diceUtil.getDamageTimes()
    times = timeDice.times
    if (you.type === 'WS' && timeDice.dice === 3) {
      // 武僧被动技能，3点修正为偏斜攻击
      times = config.slightTimes
    }
    // STEP2 计算原始伤害
    let damage = Math.ceil(diceUtil.rollDice(10) * times)
    if (you.iceblock) {
      // 寒冰屏障
      damage = reduceCtrl.getReducedDamage(damage, 'iceblock')
    } else if (you.flagBear) {
      // 熊形态
      damage = reduceCtrl.getReducedDamage(damage, 'bear')
    }
    if (you.flagEarth && times === config.criticalTimes) {
      // 大地之力反伤
      let newDamage = reduceCtrl.getReducedDamage(damage, 'earth')
      let reflectDamage = newDamage.reflectDamage
      damage = newDamage.leftDamage
      me.hp -= reflectDamage
      if (me.hp <= 0) {
        me.hp = 0
        me.isDead = true
      }
      setTimeout(() => {
        // 显示伤害动效
        eventBus.$emit('animateDamage', {
          targets: [system.unitIndex],
          value: reflectDamage
        })
        system.msg = [`*大地之力*效果使${system.unitIndex + 1}号单位受到${reflectDamage}点反馈伤害`, ...system.msg]
      }, 1500)
    }
    // STEP3 结算
    // 清除yy效果
    if (you.yy) {
      you.yy = 0
      you.maxhp -= config.yyPlusMaxhp
      you.hp -= config.yyPlusMaxhp
      if (you.hp < 1) {
        you.hp = 1
      }
      you.speed -= config.yyPlusSpeed
    }
    // 清除激怒效果
    you.flagAnger = false
    // 减速效果（不叠加）
    if (!you.flagSlow) {
      you.flagSlow = true
      you.speed -= config.magicShotMinusSpeed
    }
    me.skillDamageTotal += damage
    me.damageTotal += damage
    you.hp -= damage
    if (you.hp <= 0) {
      you.hp = 0
      you.isDead = true
    }
    // 显示伤害动效
    eventBus.$emit('animateDamage', {
      targets: [youIndex],
      value: damage,
      sound: 'atklr',
      image: 'effdamarrow'
    })
    system.msg = [`*奥术射击*使${youIndex + 1}号单位减速，并对其造成${damage}点伤害`, ...system.msg]

    // 回写数据
    hero.units.splice(system.unitIndex, 1, me)
    hero.units.splice(youIndex, 1, you)
  }
}
