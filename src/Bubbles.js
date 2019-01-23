'use strict'

import * as d3 from 'd3'
import * as containers from './Container.js'
import { AxisRender, factoryWithRange } from './AxisRender.js'
import { CircleRender } from './CircleRender.js'
import { LabelRender } from './LabelRender.js'
import { InfoRender } from './InfoRender.js'

class Bubbles {
  constructor (container, axisRender, circleRender, labelRender, infoRender, builder) {
    this._container = container
    this.axisRender = axisRender
    this.circleRender = circleRender
    this.labelRender = labelRender
    this.infoRender = infoRender
    this.builder = builder
    if (typeof builder !== 'undefined') {
      this.clusters = builder.getNodes()
    }
  }

  update (builder) {
    return new Bubbles(builder.getContainer(), builder, this)
  }

  getContainer () {
    return this._container
  }

  getClustersAtPosition (x, y) {
    return this.circleRender.getClustersAtPosition(x, y)
  }

  stopIfSimulation () {
    if (typeof this._collideSimulation !== 'undefined') {
      this._collideSimulation.stop()
      return true
    } else {
      return false
    }
  }

  drawThenOptimize () {
    this._drawClusters()
    this._optimizeLayout()
    return this
  }

  moveThenOptimize () {
    this._moveLayout().then(this._optimizeLayout)
    return this
  }

  _optimizeLayout () {
    const collisionForce = Bubbles._getCollisionForce()
    const { xForce, yForce } = this._getPositionForces()
    this._collideSimulation = d3.forceSimulation()
      .alphaTarget(0.0005) // runs longer
      .nodes(this.clusters)
      .force('collide', collisionForce)
      .force('x', xForce)
      .force('y', yForce)
      .on('tick', () => this._drawClusters())
  }

  static _getCollisionForce () {
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

export function create (containerSelector, listeners, document) {
  const container = new containers.XYContainer(containerSelector, listeners, document)
  const axisRender = new AxisRender(container.asAxisContainer(), factoryWithRange())
  const circleRender = new CircleRender(container.asChartContainer())
  const labelRender = new LabelRender(container.asChartContainer())
  const infoRender = new InfoRender(container.asToolTipContainer(), circleRender)
  return new Bubbles(container, axisRender, circleRender, labelRender, infoRender)
}

export function apply (bubbles, builder) {
  const container = builder.getContainer()
  const axisRender = new AxisRender(container.asAxisContainer(), bubbles.axisRender.percentileFactory, builder)
  const circleRender = new CircleRender(container.asChartContainer(), builder)
  const labelRender = new LabelRender(container.asChartContainer(), builder)
  const infoRender = new InfoRender(container.asToolTipContainer(), circleRender, builder)
  const updated = new Bubbles(container, axisRender, circleRender, labelRender, infoRender, builder)
  updated._collideSimulation = bubbles._collideSimulation
  if (bubbles.stopIfSimulation()) {
    return updated.moveThenOptimize()
  } else {
    return updated.drawThenOptimize()
  }
}

export function resize (bubbles) {
  if (typeof bubbles.builder !== 'undefined') {
    const container = bubbles._container.resize()
    const builder = bubbles.builder.updateContainer(container)
    return apply(bubbles, builder)
  }
}
