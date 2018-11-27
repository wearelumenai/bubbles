<template>
    <div id="q-app">
        <selector></selector>
        <bubbles></bubbles>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'
import Store from './store'
import bubbles from './components/BubbleDisplay.vue'
import selector from './components/ProjectionSelector.vue'

export default {
  name: 'App',
  store: Store,
  components: {bubbles, selector},
  computed: mapGetters(['projection'])
}
</script>
