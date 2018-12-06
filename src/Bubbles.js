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
    this.axisRender = new AxisRender(this.container.asAxisContainer())
    this.circleRender = new CircleRender(this.container.asChartContainer())
    this.labelRender = new LabelRender(this.container.asChartContainer())
    this.infoRender = new InfoRender(this.container.asToolTipContainer(), this.circleRender)
    this._doApply = this._applyFirst
  }

  apply (projection) {
    this.projection = projection
    const builder = new NodeBuilder(projection, this.container)
    this.clusters = builder.getNodes()
    this._applyRender(builder)
    this._doApply()
  }

  getClustersAtPosition (x, y) {
    return this.circleRender.getClustersAtPosition(x, y)
  }

  _applyRender (builder) {
    this.axisRender.apply(builder)
    this.circleRender.apply(builder)
    this.labelRender.apply(builder)
    this.infoRender.apply(builder)
  }

  _applyFirst () {
    this._drawClusters()
    this._optimizeLayout()
    this._doApply = this._applyThen
  }

  _applyThen () {
    this._collideSimulation.stop()
    this._moveLayout().then(this._optimizeLayout)
  }

  _optimizeLayout () {
    const collisionForce = this._getCollisionForce()
    const { xForce, yForce } = this._getPositionForces()
    this._collideSimulation = d3.forceSimulation()
      .alphaTarget(0.0005) // runs longer
      .nodes(this.clusters)
      .force('collide', collisionForce)
      .force('x', xForce)
      .force('y', yForce)
      .on('tick', () => this._drawClusters())
  }

  _getCollisionForce () {
    return d3.forceCollide(n => n.radius).strength(0.6)
  }

  _getPositionForces () {
    const initialPosition = this.clusters.map(n => [n.x, n.y])
    const xForce = d3.forceX((_, i) => initialPosition[i][0]).strength(0.3)
    const yForce = d3.forceY((_, i) => initialPosition[i][1]).strength(0.3)
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

export function create (containerSelector, listeners, document, rect) {
  const container = new Container(containerSelector, listeners, document, rect)
  return new Bubbles(container)
}

export function resize (bubbles, document, rect) {
  bubbles.container.resize()
  bubbles.apply(bubbles.projection)
}
