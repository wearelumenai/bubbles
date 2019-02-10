'use strict'

import { AxisRender } from './AxisRender.js'
import { CircleRender } from './CircleRender.js'
import { LabelRender } from './LabelRender.js'
import { InfoRender, simpleInfoText } from './InfoRender.js'
import { factoryWithRange } from './quantiles'
import { getTransition, optimizeLayout } from './optimize'

export function create (containerSelector, Builder, listeners) {
  let container = Builder.Container(containerSelector, listeners)
  return new Bubbles(container)
}

export function resize (bubbles) {
  if (typeof bubbles.builder !== 'undefined') {
    const container = bubbles.container.resize()
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
  return bubbles.update(container, updatedBuilder)
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

class Bubbles {
  constructor (container) {
    this.container = container
  }

  getContainer () {
    return this.container
  }

  update (container, builder) {
    const percentileFactory = factoryWithRange()
    const getInfoText = simpleInfoText
    const updated = ActiveBubbles.create(container, builder, percentileFactory, getInfoText)
    return updated.optimizeThenDraw()
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

  update (container, builder) {
    this.stop()
    const percentileFactory = this.axisRender.percentileFactory
    const getInfoText = this.infoRender.getInfoText
    const updated = ActiveBubbles.create(container, builder, percentileFactory, getInfoText)
    return updated.optimizeThenMove()
  }

  getClustersAtPosition (x, y) {
    return this.builder.getNodesAtPosition(x, y)
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
    const labelRender = new LabelRender(container.asChartContainer(), builder)
    const infoRender = new InfoRender(container.asToolTipContainer(), getInfoText, builder)
    return new ActiveBubbles(container, axisRender, circleRender, labelRender, infoRender, builder)
  }
}
