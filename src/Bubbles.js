'use strict'

import * as d3 from 'd3'
import { AxisRender } from './AxisRender.js'
import { CircleRender } from './CircleRender.js'
import { LabelRender } from './LabelRender.js'
import { InfoRender, simpleInfoText } from './InfoRender.js'
import { factoryWithRange } from './quantiles'

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
    this._collideSimulation = this._optimizeLayout(this.clusters, this.container)
    this.container.transition(() => {
      this._drawClusters()
    })
    return this
  }

  optimizeThenMove () {
    this._collideSimulation = this._optimizeLayout(this.clusters, this.container)
    this._moveLayout()
    return this
  }

  _optimizeLayout (clusters, container) {
    const collisionForce = ActiveBubbles._getCollisionForce()
    const { xForce, yForce } = ActiveBubbles._getPositionForces()
    const collideSimulation = d3.forceSimulation()
      .alphaTarget(0.0005) // runs longer
      .nodes(clusters)
      .force('collide', collisionForce)
      .force('x', xForce)
      .force('y', yForce)
      .stop()
    this._simulate(clusters, collideSimulation, container)
    return collideSimulation
  }

  _simulate (clusters, collideSimulation, container) {
    const n = Math.ceil(Math.log(collideSimulation.alphaMin()) /
      Math.log(1 - collideSimulation.alphaDecay()))
    for (let i = 0; i < n; i++) {
      collideSimulation.tick()
      CircleRender.progressiveBound(i, clusters, container)
    }
  }

  static _getCollisionForce () {
    return d3.forceCollide(n => n.radius).strength(0.6)
  }

  static _getPositionForces () {
    const xForce = d3.forceX(n => n.xTarget).strength(0.01)
    const yForce = d3.forceY(n => n.yTarget).strength(0.01)
    return { xForce, yForce }
  }

  _drawClusters () {
    this.circleRender.drawCircles()
    this.labelRender.displayLabels()
    this.axisRender.displayAxis()
  }

  _moveLayout () {
    this.circleRender.moveCircles(this._getTransition(o => this.circleRender.drawCircles(o)))
    this.labelRender.moveLabels(this._getTransition(o => this.labelRender.displayLabels(o)))
    this.axisRender.displayAxis()
  }

  _getTransition (onTransitionEnd) {
    return o => o.transition().ease(d3.easeExpOut).duration(2000)
      .on('end', () => onTransitionEnd(o))
  }

  static create (container, builder, percentileFactory, getInfoText) {
    const axisRender = new AxisRender(container.asAxisContainer(), percentileFactory, builder)
    const circleRender = new CircleRender(container.asChartContainer(), builder)
    const labelRender = new LabelRender(container.asChartContainer(), circleRender, builder)
    const infoRender = new InfoRender(container.asToolTipContainer(), circleRender, getInfoText, builder)
    return new ActiveBubbles(container, axisRender, circleRender, labelRender, infoRender, builder)
  }
}

export function create (containerSelector, Builder, listeners) {
  let container = Builder.Container(containerSelector, listeners)
  return new Bubbles(container)
}

export function resize (bubbles) {
  if (typeof bubbles.builder !== 'undefined') {
    const container = bubbles.container.resize()
    if (container.same(bubbles.container)) {
      return bubbles
    }
    const builder = bubbles.builder.updateContainer(container)
    return updateBubbles(bubbles, builder)
  }
}

export function update (bubbles, Builder, data) {
  const builder = new Builder(data, bubbles.getContainer())
  return updateBubbles(bubbles, builder)
}

function updateBubbles (bubbles, builder) {
  const container = builder.getContainer()
  const updatedBuilder = tryUpdateBuilder(bubbles, builder)
  const updated = bubbles.update(container, updatedBuilder)
  if (bubbles.isActive()) {
    bubbles.stop()
    return updated.optimizeThenMove()
  } else {
    return updated.optimizeThenDraw()
  }
}

function tryUpdateBuilder (bubbles, builder) {
  let currentBuilder = bubbles.builder
  let updatedBuilder = builder
  if (builder.samePosition(currentBuilder)) {
    if (builder.getContainer().same(currentBuilder.getContainer())) {
      if (builder.sameRadius(currentBuilder)) {
        updatedBuilder = currentBuilder.updateColors(builder)
      } else {
        updatedBuilder = currentBuilder.updateRadiusAndColor(builder)
      }
    } else {
      updatedBuilder = currentBuilder.updateScales(builder)
    }
  }
  return updatedBuilder
}
