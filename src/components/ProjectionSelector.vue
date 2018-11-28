<template>
  <div class="table">
    <div class="row header">
      <div class="label cell">
      </div>
      <div class="label cell">
        X
      </div>
      <div class="label cell">
        Y
      </div>
      <div class="label cell">
        Couleur
      </div>
    </div>
    <div class="row" :class="{chosen: choice[0]}">
      <div class="cell">
        <q-btn @click="example1" label="Exemple 1" color="primary"></q-btn>
      </div>
      <div class="label cell">
        nb premium
      </div>
      <div class="label cell">
        montant ski
      </div>
      <div class="label cell">
        nb premium
      </div>
    </div>
    <div class="row" :class="{chosen: choice[1]}">
      <div class="label cell">
        <q-btn @click="example2" label="Exemple 2" color="primary"></q-btn>
      </div>
      <div class="label cell">
        nb location voitures
      </div>
      <div class="label cell">
        nb produits assurance
      </div>
      <div class="label cell">
        nb location voitures
      </div>
    </div>
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
      this.$store.commit('projection', [[1.50961303e-01, 3.09062098e+00, 1.64600000e+03, 1.50961303e-01],
        [8.96613922e-02, 2.40450976e+00, 2.12410000e+04, 8.96613922e-02],
        [2.29822031e-01, 5.16746707e+00, 5.62200000e+03, 2.29822031e-01],
        [9.59225202e-02, -3.05881325e-01, 4.77800000e+03, 9.59225202e-02],
        [3.19487820e-01, 1.19113852e+01, 1.34820000e+04, 3.19487820e-01],
        [1.73575337e-01, 3.24632470e-01, 1.18360000e+04, 1.73575337e-01],
        [1.23975939e-01, 3.77829776e+00, 8.70400000e+03, 1.23975939e-01],
        [6.70332568e-02, 1.26034846e+00, 5.07470000e+04, 6.70332568e-02],
        [5.29644683e-02, 1.14838105e+00, 9.34300000e+03, 5.29644683e-02],
        [3.57742263e-01, 6.77441438e+00, 8.52100000e+03, 3.57742263e-01],
        [1.59854104e-01, 3.24766286e+00, 3.68000000e+03, 1.59854104e-01]])
    },
    example2 () {
      this.choice = [false, true]
      this.$store.commit('projection', [[2.41267655e-01, 1.15941498e+00, 1.64600000e+03, 2.41267655e-01],
        [3.90997921e-01, 4.13126566e-01, 2.12410000e+04, 3.90997921e-01],
        [2.62189843e-01, 8.91793115e-01, 5.62200000e+03, 2.62189843e-01],
        [3.84087466e-02, 9.81752425e-01, 4.77800000e+03, 3.84087466e-02],
        [5.23437249e-01, 5.13124657e-01, 1.34820000e+04, 5.23437249e-01],
        [4.21645197e-01, 4.11127941e+00, 1.18360000e+04, 4.21645197e-01],
        [2.00664104e-01, 7.93315034e-01, 8.70400000e+03, 2.00664104e-01],
        [1.97117738e-01, 5.37573483e-01, 5.07470000e+04, 1.97117738e-01],
        [3.34834077e-01, 2.93238737e-01, 9.34300000e+03, 3.34834077e-01],
        [3.79977419e-01, 4.74244676e-01, 8.52100000e+03, 3.79977419e-01],
        [4.07126387e-01, 5.57576834e-01, 3.68000000e+03, 4.07126387e-01]])
    }
  }
}
</script>

<style>
.table {
  display: table;
}
.row {
  display: table-row;
}
.cell {
  display: table-cell;
  padding: 5px;
  border-right: 1pt solid black;
}
.row.header {
  font-weight: 700;
}
.row.chosen {
background-color: aliceblue;
}
</style>
