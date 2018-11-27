import Vue from 'vue'
import Vuex from 'vuex'

function getProjection (state) {
  return state.projection
}

function setProjection (state, projection) {
  state.projection = projection
}

function build () {
  let Store = {
    state: {projection: []},
    mutations: {
      projection: setProjection

    },
    getters: {
      projection: getProjection
    }
  }

  return new Vuex.Store(Store)
}

Vue.use(Vuex)
export default build
