<template>
  <div :id="chartId" style="width: 100%; height: 100%;"></div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as bub from './Bubbles.js'

export default {
  data () {
    return {
      bubbles: null,
      chartId:
        'chart-' +
        Math.random()
          .toString(36)
          .substr(2, 16)
    }
  },

  computed: mapGetters(['projection']),

  watch: {
    projection (newValue) {
      this.bubbles.apply(newValue)
    }
  },

  mounted () {
    this.bubbles = bub.create(`#${this.chartId}`)
  }
}
</script>
