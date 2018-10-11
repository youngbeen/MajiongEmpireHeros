// 系统配置

export default {
  slightTimes: 0.8, // 偏斜攻击倍数
  normalTimes: 1, // 正常攻击倍数
  criticalTimes: 1.4, // 偏斜攻击倍数
  guardBaseHeal: 1, // 守备基本恢复治疗量
  guardDKHeal: 0, // 守备DK恢复量
  guardYDPlusHeal: 2, // 守备YD增加的治疗量
  guardIceblockPlusHeal: 1, // 守备iceblock效果增加的治疗量
  yyMaxTurns: 2, // yy 技能持续层数
  yyPlusMaxhp: 2, // yy 技能增加的maxhp值
  yyPlusSpeed: 2, // yy 技能增加的speed值
  magicShotMinusSpeed: 2, // 奥术射击技能减少的speed值
  deathFingerMinDamage: 5, // 死亡一指最低伤害
  deathFingerMaxDamage: 10, // 死亡一指必杀血线 <= 该值则触发
  poisonDamage: 3 // 中毒dot伤害值
}
