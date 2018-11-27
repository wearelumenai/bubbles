import BubbleDisplay from './BubbleDisplay.mjs'
import ProjectionSelector from './ProjectionSelector.mjs'

function getProjection(state) {
    return state.projection;
}

function setProjection(state, projection) {
    state.projection = projection;
}

let Store = {
    state: {projection: []},
    mutations: {
        projection: setProjection

    },
    getters: {
        projection: getProjection
    }
};

function Root(store, d3) {
    return {
        el: '#app',
        components: {
            bubbles: BubbleDisplay(d3),
            selector: ProjectionSelector()
        },
        store,
        computed: {
            projection() {
                return this.$store.getters.projection;
            }
        }
    }
}

export default {Store, Root}