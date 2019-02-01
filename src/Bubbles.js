'use strict'

import * as d3 from 'd3'
import * as containers from './Container.js'
import { AxisRender, factoryWithRange } from './AxisRender.js'
import { CircleRender } from './CircleRender.js'
import { LabelRender } from './LabelRender.js'
import { InfoRender, simpleInfoText } from './InfoRender.js'

class Bubbles {
  constructor (container) {
    this.container = container
  }

  getContainer () {
    return this.container
  }

  isActive () {
    return false
  }

  update (container, builder) {
    const percentileFactory = factoryWithRange()
    const getInfoText = simpleInfoText
    return ActiveBubbles.create(container, builder, percentileFactory, getInfoText)
  }
}

class ActiveBubbles extends Bubbles {
  constructor (container, axisRender, circleRender, labelRender, infoRender, builder) {
    super(container)
    this.axisRender = axisRender
    this.circleRender = circleRender
    this.labelRender = labelRender
    this.infoRender = infoRender
    this.builder = builder
    if (typeof builder !== 'undefined') {
      this.clusters = builder.getNodes()
    }
  }

  isActive () {
    return true
  }

  update (container, builder) {
    const percentileFactory = this.axisRender.percentileFactory
    const getInfoText = this.infoRender.getInfoText
    return ActiveBubbles.create(container, builder, percentileFactory, getInfoText)
  }

  getClustersAtPosition (x, y) {
    return this.circleRender.getClustersAtPosition(x, y)
  }

  stop () {
    this._collideSimulation.stop()
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
    const collisionForce = ActiveBubbles._getCollisionForce()
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

  static create (container, builder, percentileFactory, getInfoText) {
    const axisRender = new AxisRender(container.asAxisContainer(), percentileFactory, builder)
    const circleRender = new CircleRender(container.asChartContainer(), builder)
    const labelRender = new LabelRender(container.asChartContainer(), circleRender, builder)
    const infoRender = new InfoRender(container.asToolTipContainer(), circleRender, getInfoText, builder)
    return new ActiveBubbles(container, axisRender, circleRender, labelRender, infoRender, builder)
  }
}

export function create (container, listeners, document) {
  if (typeof container === 'string') {
    container = new containers.XContainer(container, listeners, document)
  } else {
    container = container.reset()
  }
  return new Bubbles(container)
}

export function apply (bubbles, builder) {
  const container = builder.getContainer()
  const { updatedBuilder, quiteTheSame } = tryUpdateBuilder(bubbles, builder)
  const updated = bubbles.update(container, updatedBuilder)
  if (!quiteTheSame && bubbles.isActive()) {
    bubbles.stop()
    return updated.optimizeThenMove()
  } else {
    return updated.optimizeThenDraw()
  }
}

function tryUpdateBuilder (bubbles, builder) {
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
  return { updatedBuilder, quiteTheSame: quiteTheSame }
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
