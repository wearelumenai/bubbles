import * as d3 from 'd3'

export function getTransition () {
  return o => o.transition().ease(d3.easeSinOut).duration(1000)
}

export function optimizeLayout (clusters, container) {
  const collisionForce = _getCollisionForce()
  const { xForce, yForce } = _getPositionForces()
  const collideSimulation = d3.forceSimulation()
    .alphaTarget(0.0005) // runs longer
    .nodes(clusters)
    .force('collide', collisionForce)
    .force('x', xForce)
    .force('y', yForce)
    .stop()
  _simulate(clusters, container, collideSimulation)
  return collideSimulation
}

function _simulate (clusters, container, collideSimulation) {
  const n = Math.ceil(Math.log(collideSimulation.alphaMin()) /
    Math.log(1 - collideSimulation.alphaDecay()))
  for (let i = 0; i < n; i++) {
    collideSimulation.tick()
    container.progressiveBound(clusters, i)
  }
}

function _getCollisionForce () {
  return d3.forceCollide(n => n.radius).strength(0.6)
}

function _getPositionForces () {
  const xForce = d3.forceX(n => n.xTarget).strength(0.01)
  const yForce = d3.forceY(n => n.yTarget).strength(0.01)
  return { xForce, yForce }
}
