import * as bub from './Bubbles.mjs'

function BubbleDisplay(d3) {
    let bubbles;
    let chartId = "chart-" + Math.random().toString(36).substr(2, 16);

    function projectionChanged(newValue) {
        bubbles.apply(newValue)
    }

    function init() {
        bubbles = bub.create(d3, `#${chartId}`);
    }

    return {
        template: `<div id="${chartId}" style="height: 400px; width: 1200px"></div>`,
        computed: {
          projection() {
              return this.$store.getters.projection
          }
        },
        watch: {
            projection: projectionChanged
        },
        mounted: init
    };
}

export default BubbleDisplay;