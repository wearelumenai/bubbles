'use strict'

import * as d3 from 'd3'
import Container from './Container.js'
import NodeBuilder from './NodeBuilder.js'
import AxisRender from './AxisRender.js'
import CircleRender from './CircleRender.js'
import LabelRender from './LabelRender.js'
import InfoRender from './InfoRender.js'

class Bubbles {
  constructor (container) {
    this.container = container
    this.axisRender = new AxisRender(this.container)
    this.circleRender = new CircleRender(this.container)
    this.labelRender = new LabelRender(this.container)
    this.infoRender = new InfoRender(this.container, (x, y) => this.getClustersAtPosition(x, y))
    this._doApply = this._applyFirst
  }

  apply (projection) {
    this.projection = projection
    const builder = new NodeBuilder(projection)
    this.clusters = builder.getNodes(this.container)
    this._makeRender(builder)
    this._doApply()
  }

  _makeRender (builder) {
    this.axisRender.apply(this.clusters, builder)
    this.circleRender.apply(this.clusters)
    this.labelRender.apply(this.clusters)
    this.infoRender.apply(this.clusters)
  }

  getClustersAtPosition (x, y) {
    let found = []
    if (this.clusters) {
      const clustersAtPosition = this.clusters
        .filter(d => (Math.pow(x - d.x, 2) + Math.pow(y - d.y, 2)) < Math.pow(d.radius, 2))
      found = clustersAtPosition.sort((a, b) => a.radius - b.radius).map(d => d.label)
    }
    return found
  }

  _applyFirst () {
    this._drawClusters()
    this._optimizeLayout()
    this._doApply = this._applyOthers
  }

  _applyOthers () {
    this._collideSimulation.stop()
    this._moveLayout().then(this._optimizeLayout)
  }

  _optimizeLayout () {
    const collisionForce = this._getCollisionForce()
    const { xForce, yForce } = this._getPositionForces()
    this._collideSimulation = d3.forceSimulation()
      .nodes(this.clusters)
      .force('collide', collisionForce)
      .force('x', xForce)
      .force('y', yForce)
      .on('tick', () => this._drawClusters())
  }

  _getCollisionForce () {
    return d3.forceCollide(n => n.radius * 0.8).strength(0.4)
  }

  _getPositionForces () {
    const initialPosition = this.clusters.map(n => [n.x, n.y])
    const xForce = d3.forceX((_, i) => initialPosition[i][0]).strength(0.1)
    const yForce = d3.forceY((_, i) => initialPosition[i][1]).strength(0.1)
    return { xForce, yForce }
  }

  _drawClusters () {
    this.circleRender.drawCircles()
    this.labelRender.displayLabels()
    this.axisRender.displayAxis()
  }

  _moveLayout () {
    this.axisRender.hideAxis()
    const circleTransition = this.circleRender.moveCircles()
    const labelTransition = this.labelRender.moveLabels()
    const then = (callback) => this._onLayoutMoved(circleTransition, labelTransition, callback)
    return { then }
  }

  _onLayoutMoved (circleTransition, labelTransition, callback) {
    const thisCallback = callback.bind(this)
    let n = 0
    const onStart = () => ++n
    const onEnd = () => --n || thisCallback()
    circleTransition.each(onStart).on('end', onEnd)
    labelTransition.each(onStart).on('end', onEnd)
  }
}

export function create (containerSelector, listeners, document) {
  const container = new Container(containerSelector, listeners, document)
  return new Bubbles(container)
}

export function resize (bubbles, document) {
  bubbles.container.resize()
  bubbles.apply(bubbles.projection)
}
