<template>
  <el-dialog class="window-choose-hero" title="选择英雄" :visible.sync="isShow" width="82%" top="2vh" :before-close="handleClose">
    <div class="box-heros">
      <div class="box-hero" v-for="item in heros" :key="item.name" @click="choose(item)">
        <div class="box-avatar">
          <img :src="item.url" :alt="item.cnName">
        </div>
        <div class="title">
          {{ item.cnName }}
        </div>
        <div class="desc">
          {{ item.desc }}
        </div>
      </div>
      <div class="box-hero" @click="choose()">
        <div class="box-avatar">
          <img src="../assets/img/nounit.png">
        </div>
        <div class="title">
          空置
        </div>
        <div class="desc">
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleCancel">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import eventBus from '@/EventBus'
import heroDict from '@/models/heroDict'
import hero from '@/models/hero'

export default {
  name: 'chooseHero',
  data () {
    return {
      isShow: false,
      heros: heroDict.list
    }
  },

  methods: {
    choose (item) {
      let index = Number(window.sessionStorage.getItem('sourceIndex'))
      let copy = hero.units[index]
      if (item) {
        // 选择了英雄
        copy.type = item.name
        copy.url = item.url
      } else {
        // 空置
        copy.type = ''
        copy.url = ''
      }
      hero.units.splice(index, 1, copy)
      this.handleCancel()
    },
    handleCancel () {
      this.isShow = false
      this.handleClose()
    },
    handleClose () {
      window.sessionStorage.removeItem('sourceIndex')
    }
  },

  mounted () {
    eventBus.$on('chooseHero', () => {
      this.isShow = true
    })
  }
}
</script>

<style lang="less" scoped>
  .box-heros {
    display: flex;
    // justify-content: space-between;
    flex-wrap: wrap;
    .box-hero {
      margin: 8px 8px;
      border: 3px solid rgba(0,0,0,0);
      box-shadow: 1px 1px 8px rgba(0,0,0, .4);
      cursor: pointer;
      &:hover {
        border: 3px solid rgb(46, 150, 255);
        box-shadow: 1px 1px 4px rgba(0,0,0, .8);
      }
      .box-avatar {
        img {
          width: 120px;
          height: 140px;
        }
      }
      .title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
      }
      .desc {
        width: 120px;
        text-align: center;
        font-size: 12px;
      }
    }
  }
</style>
