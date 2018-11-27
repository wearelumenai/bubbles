export default function() {
    return {
        template: `
            <div>
            <button id="applyData1" @click="example1">Example 1</button>
            <button id="applyData2" @click="example2">Example 2</button>
            </div>
        `,
        methods: {
            example1() {
                this.$store.commit('projection', [[10, 3, 5, 10], [15, 2, 9, 15], [12, 8, 8, 12], [12.1, 2, 6, 12.1]])
            },
            example2() {
                this.$store.commit('projection', [[12.1, 5, 5, 12.1], [12, 7, 9, 12], [15, 8, 8, 15], [10, 2, 6, 10]])
            }
        }
    }
}