<template>
    <div>
        <q-btn @click="example1" label="Example 1" color="primary" class="q-ma-md"></q-btn>
        <q-btn @click="example2" label="Example 2" color="primary" class="q-ma-md"></q-btn>
    </div>
</template>

<script>
export default {
  methods: {
    example1 () {
      this.$store.commit('projection', [[10, 3, 5, 10], [15, 2, 9, 15], [12, 8, 8, 12], [12.1, 2, 6, 12.1]])
    },
    example2 () {
      this.$store.commit('projection', [[12.1, 5, 5, 12.1], [12, 7, 9, 12], [15, 8, 8, 15], [10, 2, 6, 10]])
    }
  }
}
</script>
