<template>
    <div>
        <bubbles></bubbles>
        <selector></selector>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import Store from './store/store.js'
    import bubbles from './components/BubbleDisplay.vue'
    import selector from './components/ProjectionSelector.vue'

    export default {
        el: '#app',
        store: Store,
        components: {bubbles, selector},
        computed: mapGetters(['projection'])
    }
</script>