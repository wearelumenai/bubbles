<template>
    <div>
        <q-btn @click="example1" label="Exemple 1" color="primary" class="q-ma-md"></q-btn>
        <span class="label" :class="{chosen: choice[0]}" style="padding: 3px">
          x = premium ; y = montant ski; r = sqrt(effectif); couleur = premium
        </span>
        <br>
        <q-btn @click="example2" label="Exemple 2" color="primary" class="q-ma-md"></q-btn>
        <span class="label" :class="{chosen: choice[1]}" style="padding: 3px">
          x = montant voyages ; y = montant location voitures; r = sqrt(effectif); couleur = montant voyages
        </span>
    </div>
</template>

<script>
export default {
  data () {
    return {
      choice: [false, false]
    }
  },
  methods: {
    example1 () {
      this.choice = [true, false]
      this.$store.commit('projection', [[1.16663013e+00, 3.95360149e-01, 3.12270000e+04, 1.16663013e+00],
        [1.20378654e+00, 2.00172207e-01, 2.54880000e+04, 1.20378654e+00],
        [1.55104893e+00, 3.88973066e-01, 1.22670000e+04, 1.55104893e+00],
        [9.49810433e-01, 1.05006153e-01, 4.25020000e+04, 9.49810433e-01],
        [1.41767738e+00, 1.54163771e+00, 4.76800000e+03, 1.41767738e+00],
        [1.30537379e+00, 2.48439006e-01, 1.64400000e+03, 1.30537379e+00],
        [1.31119393e+00, 3.74355894e-01, 7.97300000e+03, 1.31119393e+00],
        [1.22229984e+00, 2.12068567e-01, 9.36500000e+03, 1.22229984e+00],
        [1.15061080e+00, 1.14366698e-01, 6.45000000e+02, 1.15061080e+00],
        [1.32864883e+00, 4.01465012e-01, 3.72700000e+03, 1.32864883e+00]])
    },
    example2 () {
      this.choice = [false, true]
      this.$store.commit('projection', [[3.42906402e-02, 1.37126132e+03, 3.12270000e+04, 3.42906402e-02],
        [2.10378950e-02, 7.14235153e+02, 2.54880000e+04, 2.10378950e-02],
        [5.92779245e-02, 1.37862311e+03, 1.22670000e+04, 5.92779245e-02],
        [1.22360551e-02, 5.86289347e+02, 4.25020000e+04, 1.22360551e-02],
        [1.14881782e-01, 3.27500095e+03, 4.76800000e+03, 1.14881782e-01],
        [4.96832805e-02, 1.08363295e+03, 1.64400000e+03, 4.96832805e-02],
        [8.12253082e-02, 1.46300294e+03, 7.97300000e+03, 8.12253082e-02],
        [4.41889118e-02, 9.48925844e+02, 9.36500000e+03, 4.41889118e-02],
        [1.31560450e-03, 1.28018570e+03, 6.45000000e+02, 1.31560450e-03],
        [6.66543217e-02, 1.30114147e+03, 3.72700000e+03, 6.66543217e-02]])
    }
  }
}
</script>

<style>
.chosen {
  text-decoration: underline
}
</style>
