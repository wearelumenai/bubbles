'use strict'

import * as d3 from 'd3'
import * as containers from './Container.js'
import { AxisRender, factoryWithRange } from './AxisRender.js'
import { CircleRender } from './CircleRender.js'
import { LabelRender } from './LabelRender.js'
import { InfoRender, simpleInfoText } from './InfoRender.js'

class Bubbles {
  constructor (container, axisRender, circleRender, labelRender, infoRender, builder) {
    this.container = container
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
    return this.container
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

  optimizeThenDraw () {
    this._optimizeLayout()
    this._drawClusters()
    return this
  }

  optimizeThenMove () {
    this._optimizeLayout()
    this._moveLayout()
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
      .stop()
    this._simulate()
  }

  _simulate () {
    const n = Math.ceil(Math.log(this._collideSimulation.alphaMin()) /
      Math.log(1 - this._collideSimulation.alphaDecay()))
    for (let i = 0; i < n; ++i) {
      this._collideSimulation.tick()
      this.clusters.forEach(c => {
        c.x = CircleRender._progressiveBound(c.x, this.container.boundX(c), i, [10, 290])
        c.y = CircleRender._progressiveBound(c.y, this.container.boundY(c), i, [10, 290])
      })
    }
  }

  static _getCollisionForce () {
    return d3.forceCollide(n => n.radius).strength(0.9)
  }

  _getPositionForces () {
    const xForce = d3.forceX((_, i) => this.clusters[i].xTarget).strength(0.03)
    const yForce = d3.forceY((_, i) => this.clusters[i].yTarget).strength(0.03)
    return { xForce, yForce }
  }

  _drawClusters () {
    this.circleRender.drawCircles()
    this.labelRender.displayLabels()
    this.axisRender.displayAxis()
  }

  _moveLayout () {
    this.axisRender.hideAxis()
    this.circleRender.moveCircles()
    this.labelRender.moveLabels()
  }
}

export function create (containerSelector, listeners, document) {
  const container = new containers.XContainer(containerSelector, listeners, document)
  const axisRender = new AxisRender(container.asAxisContainer(), factoryWithRange())
  const circleRender = new CircleRender(container.asChartContainer())
  const labelRender = new LabelRender(container.asChartContainer(), circleRender)
  const infoRender = new InfoRender(container.asToolTipContainer(), circleRender, simpleInfoText)
  return new Bubbles(container, axisRender, circleRender, labelRender, infoRender)
}

export function apply (bubbles, builder) {
  const container = builder.getContainer()
  let exactlyTheSame = false
  if (builder.samePosition(bubbles.builder)) {
    if (container.same(bubbles.container)) {
      exactlyTheSame = true
      builder = bubbles.builder.updateColors(builder)
    } else {
      builder = bubbles.builder.updateScales(builder)
    }
  }
  const axisRender = new AxisRender(container.asAxisContainer(), bubbles.axisRender.percentileFactory, builder)
  const circleRender = new CircleRender(container.asChartContainer(), builder)
  const labelRender = new LabelRender(container.asChartContainer(), circleRender, builder)
  const infoRender = new InfoRender(container.asToolTipContainer(), circleRender, bubbles.infoRender.getInfoText, builder)
  const updated = new Bubbles(container, axisRender, circleRender, labelRender, infoRender, builder)
  if (!exactlyTheSame && bubbles.stopIfSimulation()) {
    return updated.optimizeThenMove()
  } else {
    return updated.optimizeThenDraw()
  }
}

export function resize (bubbles) {
  if (typeof bubbles.builder !== 'undefined') {
    const container = bubbles.container.resize()
    if (container.same(bubbles.container)) {
      return bubbles
    }
    const builder = bubbles.builder.updateContainer(container)
    return apply(bubbles, builder)
  }
}
