<template>
  <section class="bed-audio-manager">
    <!-- 提供音效 -->
    <audio id="audio-manager" src="" autoplay></audio>
  </section>
</template>

<script>
import eventBus from '@/EventBus'
// import soundAnger from '@/assets/audio/Anger.wav'

export default {
  name: 'audioManager',

  methods: {
    playSound (sound, isLoop = false) {
      document.querySelector('#audio-manager').src = ''
      document.querySelector('#audio-manager').src = `./audio/${sound}.wav`
      document.querySelector('#audio-manager').loop = isLoop
    }
  },

  mounted () {
    eventBus.$on('playSound', params => {
      if (params && params.sound) {
        this.playSound(params.sound)
      }
    })
  }
}
</script>

<style scoped>
</style>
