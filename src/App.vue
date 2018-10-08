<template>
  <div id="app">
    <action-panel></action-panel>
    <battle-field></battle-field>

    <choose-hero></choose-hero>
    <make-skill></make-skill>
    <choose-target></choose-target>
    <skill-tooltip></skill-tooltip>

    <audio-manager></audio-manager>
  </div>
</template>

<script>
import ActionPanel from './components/ActionPanel.vue'
import BattleField from './components/BattleField.vue'
import ChooseHero from './components/ChooseHero.vue'
import MakeSkill from './components/MakeSkill.vue'
import ChooseTarget from './components/ChooseTarget.vue'
import SkillTooltip from './components/SkillTooltip.vue'
import AudioManager from './components/AudioManager.vue'

export default {
  name: 'app',
  components: {
    ActionPanel,
    BattleField,
    ChooseHero,
    MakeSkill,
    ChooseTarget,
    SkillTooltip,
    AudioManager
  }
}
</script>

<style lang="less">
#app {
  position: relative;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  // color: #2c3e50;
  // margin-top: 60px;
}
</style>
