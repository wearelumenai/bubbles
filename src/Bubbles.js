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
    this.container.transition(() => {
      this._drawClusters()
    })
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
    for (let i = 0; i < n; i++) {
      this._collideSimulation.tick()
      this.circleRender.progressiveBound(i)
    }
  }

  static _getCollisionForce () {
    return d3.forceCollide(n => n.radius).strength(0.6)
  }

  _getPositionForces () {
    const xForce = d3.forceX((_, i) => this.clusters[i].xTarget).strength(0.01)
    const yForce = d3.forceY((_, i) => this.clusters[i].yTarget).strength(0.01)
    return { xForce, yForce }
  }

  _drawClusters () {
    this.circleRender.drawCircles()
    this.labelRender.displayLabels()
    this.axisRender.displayAxis()
  }

  _moveLayout () {
    this.circleRender.moveCircles()
    this.labelRender.moveLabels()
    this.axisRender.displayAxis()
  }
}

export function create (containerSelector, listeners, document) {
  const container = new containers.XContainer(containerSelector, listeners, document)
  return init(container)
}

export function reset (bubbles) {
  return init(bubbles.container)
}

function init (container) {
  const axisRender = new AxisRender(container.asAxisContainer(), factoryWithRange())
  const circleRender = new CircleRender(container.asChartContainer())
  const labelRender = new LabelRender(container.asChartContainer(), circleRender)
  const infoRender = new InfoRender(container.asToolTipContainer(), circleRender, simpleInfoText)
  return new Bubbles(container, axisRender, circleRender, labelRender, infoRender)
}

export function apply (bubbles, builder) {
  const container = builder.getContainer()
  const { updatedBuilder, exactlyTheSame } = tryUpdate(bubbles, builder)
  const updated = update(container, bubbles, updatedBuilder)
  if (!exactlyTheSame && bubbles.stopIfSimulation()) {
    return updated.optimizeThenMove()
  } else {
    return updated.optimizeThenDraw()
  }
}

function tryUpdate (bubbles, builder) {
  let quiteTheSame = false
  let currentBuilder = bubbles.builder
  let updatedBuilder = builder
  if (builder.samePosition(currentBuilder)) {
    if (builder.getContainer().same(currentBuilder.getContainer())) {
      if (builder.sameRadius(currentBuilder)) {
        quiteTheSame = true
        updatedBuilder = currentBuilder.updateColors(builder)
      } else {
        updatedBuilder = currentBuilder.updateRadiusAndColor(builder)
      }
    } else {
      updatedBuilder = currentBuilder.updateScales(builder)
    }
  }
  return { updatedBuilder, exactlyTheSame: quiteTheSame }
}

function update (container, bubbles, builder) {
  const axisRender = new AxisRender(container.asAxisContainer(), bubbles.axisRender.percentileFactory, builder)
  const circleRender = new CircleRender(container.asChartContainer(), builder)
  const labelRender = new LabelRender(container.asChartContainer(), circleRender, builder)
  const infoRender = new InfoRender(container.asToolTipContainer(), circleRender, bubbles.infoRender.getInfoText, builder)
  return new Bubbles(container, axisRender, circleRender, labelRender, infoRender, builder)
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
