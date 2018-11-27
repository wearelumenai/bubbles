import Vue from "vue";
import Vuex from "vuex";

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

Vue.use(Vuex);
export default new Vuex.Store(Store);
