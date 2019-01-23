'use strict'

import * as d3 from 'd3'
import * as containers from './Container.js'
import { AxisRender, factoryWithRange } from './AxisRender.js'
import { CircleRender } from './CircleRender.js'
import LabelRender from './LabelRender.js'
import { InfoRender } from './InfoRender.js'

class Bubbles {
  constructor (container, builder, bubbles) {
    this._container = container
    if (typeof bubbles === 'undefined') {
      this._init()
    } else {
      this._copy(bubbles, builder)
    }
    if (typeof builder !== 'undefined') {
      this._apply(builder)
    }
  }

  _init () {
    this.axisRender = new AxisRender(this._container.asAxisContainer(), factoryWithRange())
    this.circleRender = new CircleRender(this._container.asChartContainer())
    this.labelRender = new LabelRender(this._container.asChartContainer())
    this.infoRender = new InfoRender(this._container.asToolTipContainer(), this.circleRender)
  }

  _copy (bubbles, builder) {
    this.axisRender = new AxisRender(this._container.asAxisContainer(), bubbles.axisRender.percentileFactory, builder)
    this.circleRender = new CircleRender(this._container.asChartContainer(), builder)
    this.labelRender = bubbles.labelRender.update(builder, this._container.asChartContainer())
    this.infoRender = new InfoRender(this._container.asToolTipContainer(), this.circleRender, builder)
    this._collideSimulation = bubbles._collideSimulation
  }

  _apply (builder) {
    this.builder = builder
    this.clusters = this.builder.getNodes()
    this.labelRender._apply(this.builder)
    if (typeof this._collideSimulation === 'undefined') {
      this._applyFirst()
    } else {
      this._applyThen()
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

  _applyFirst () {
    this._drawClusters()
    this._optimizeLayout()
  }

  _applyThen () {
    this._collideSimulation.stop()
    this._moveLayout().then(this._optimizeLayout)
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
  return new Bubbles(container)
}

export function apply (bubbles, builder) {
  return bubbles.update(builder)
}

export function resize (bubbles) {
  if (typeof bubbles.builder !== 'undefined') {
    const container = bubbles._container.resize()
    const builder = bubbles.builder.updateContainer(container)
    return bubbles.update(builder)
  }
}
