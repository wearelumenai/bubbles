'use strict'

import {AxisRender} from './AxisRender.js'
import {CircleRender} from './CircleRender.js'
import {LabelRender} from './LabelRender.js'
import {InfoRender, simpleInfoText} from './InfoRender.js'
import {factoryWithRange} from './quantiles'
import {getTransition, optimizeLayout} from './optimize'

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
    this._collideSimulation = optimizeLayout(this.clusters, this.container)
    this.container.transition(() => {
      this._drawClusters()
    })
    return this
  }

  optimizeThenMove () {
    this._collideSimulation = optimizeLayout(this.clusters, this.container)
    this._moveClusters()
    return this
  }

  _drawClusters () {
    this.circleRender.drawCircles()
    this.labelRender.displayLabels()
    this.axisRender.displayAxis()
  }

  _moveClusters () {
    this.circleRender.moveCircles(getTransition())
    this.labelRender.moveLabels(getTransition())
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
