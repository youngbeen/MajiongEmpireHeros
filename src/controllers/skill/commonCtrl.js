// 通用技能
import eventBus from '../../EventBus'
import hero from '../../models/hero'
import system from '../../models/system'

export default {
  // 守备
  guard () {
    let me = hero.units[system.unitIndex]
    me.isActed = true
    me.actRounds++

    let heal = 1
    if (me.type === 'DK') {
      heal = 0
    } else if (me.type === 'YD') {
      heal = 3
    } else if (me.iceblock) {
      heal = 2
    }
    me.hp += heal
    if (me.hp > me.maxhp) {
      me.hp = me.maxhp
    }
    // 显示治疗特效
    eventBus.$emit('animateHeal', {
      targets: [system.unitIndex],
      value: heal
    })
    system.msg = [`${system.unitIndex + 1}号单位*守备*,回复${heal}点生命值`, ...system.msg]
  }
}
