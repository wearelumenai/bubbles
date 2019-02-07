'use strict'

import * as d3 from 'd3'
import { ScaleHelper } from './ScaleHelper'
import { ContainerEvents } from './ContainerEvents'
import * as layout from './layout'

export class Bounded {
  boundX (node) {
    if ('radius' in node) {
      return Math.max(node.radius, Math.min(
        this.getShape().width - node.radius, node.x))
    }
    if ('width' in node) {
      return Math.max(0, Math.min(
        this.getShape().width + this.getShape().left - node.width, node.left))
    }
    throw new TypeError('unable to bound node')
  }

  boundY (node) {
    if ('radius' in node) {
      return Math.max(node.radius, Math.min(
        this.getShape().height - node.radius, node.y))
    }
    if ('height' in node) {
      return Math.max(0, Math.min(
        this.getShape().height - node.height, node.top))
    }
    throw new TypeError('unable to bound node')
  }

  progressiveBound (nodes, tick) {
    nodes.forEach(c => {
      c.x = this.progressiveBoundX(c, tick)
      c.y = this.progressiveBoundY(c, tick)
    })
  }

  progressiveBoundX (c, tick) {
    return Container._progressiveBound(c.x, this.boundX(c), tick, [10, 290])
  }

  progressiveBoundY (c, tick) {
    return Container._progressiveBound(c.y, this.boundY(c), tick, [10, 290])
  }

  static _progressiveBound (current, bound, tick, [t0, t1]) {
    if (tick >= t1) {
      return bound
    } else if (tick > t0) {
      return current + (bound - current) / (t1 - t0) * (tick - t0)
    } else {
      return current
    }
  }

  getShape () {
  }
}

class Container extends Bounded {
  constructor (container, listeners) {
    super()
    if (container instanceof Container) {
      this._copy(container)
    } else {
      this._init(container, listeners)
    }
    this._initScales()
  }

  _init (containerSelector, listeners) {
    this.containerSelector = containerSelector
    this._containerElement = Container._setupContainer(containerSelector)
    this._chartElement = layout._makeChart(this._containerElement, this._getYAxisWidth())
    this._infoElement = layout._makeToolTip(this._chartElement, 0)
    this._xAxisElement = layout._makeXAxis(this._containerElement, this._getYAxisWidth())
    this._yAxisElement = layout._makeYAxis(this._containerElement, this._getYAxisWidth())
    this._containerEvents = new ContainerEvents(listeners, this._chartElement)
    this._init = true
  }

  static _setupContainer (containerSelector) {
    let element = d3.select(containerSelector)
    element.selectAll('*').remove()
    return element.style('position', 'relative').style('margin', '0')
  }

  _copy (container) {
    this.containerSelector = container.containerSelector
    this._containerElement = container._containerElement
    this._chartElement = layout._setupChart(container._chartElement, this._getYAxisWidth())
    this._infoElement = layout._setupTooltip(container._infoElement, 0)
    this._xAxisElement = layout._setupXAxis(container._xAxisElement, this._getYAxisWidth())
    this._yAxisElement = layout._setupYAxis(container._yAxisElement, this._getYAxisWidth())
    this._containerEvents = new ContainerEvents(container._containerEvents, this._chartElement)
    this._init = container._init
  }

  _initScales () {
    this._chartBoundingRect = this._chartElement.node().getBoundingClientRect()
    this.scaleHelper = new ScaleHelper(this._chartBoundingRect)
  }

  _getYAxisWidth () {
    return '0'
  }

  getShape () {
    return this._chartBoundingRect
  }

  getScales (x, y, areas, colors) {
    return this.scaleHelper.generate(x, y, areas, colors)
  }

  onClick (action) {
    this._containerEvents.on('click', action)
  }

  onMouse (onMove, onOut) {
    this._containerEvents.on('mousemove', onMove)
    this._containerEvents.on('mouseout', onOut)
  }

  transition (fn) {
    if (this._init) {
      this._containerElement.style('opacity', 0)
    }
    fn()
    if (this._init) {
      this._containerElement.transition().duration(800).ease(d3.easeCircleIn).style('opacity', 1)
      this._init = false
    }
  }

  sameBoundingRect (container) {
    return container._chartBoundingRect.x === this._chartBoundingRect.x &&
      container._chartBoundingRect.y === this._chartBoundingRect.y &&
      container._chartBoundingRect.width === this._chartBoundingRect.width &&
      container._chartBoundingRect.height === this._chartBoundingRect.height
  }

  asChartContainer () {
    return {
      selectChart: (selector) => this._containerElement.select('svg').selectAll(selector),
      onClick: (action) => this.onClick(action),
      boundX: (selector) => this.boundX(selector),
      boundY: (selector) => this.boundY(selector)
    }
  }

  asToolTipContainer () {
    return {
      getInfo: () => this._infoElement,
      onMouse: (onMove, onOut) => this.onMouse(onMove, onOut),
      boundX: (selector) => this.boundX(selector),
      boundY: (selector) => this.boundY(selector)
    }
  }

  asAxisContainer () {
    return {
      selectXAxis: (selector) => this._xAxisElement.select('.x-axis').selectAll(selector),
      selectYAxis: (selector) => this._yAxisElement.select('.y-axis').selectAll(selector)
    }
  }
}

export class XYContainer extends Container {
  resize () {
    return new XYContainer(this, {})
  }

  same (container) {
    return container instanceof XYContainer && this.sameBoundingRect(container)
  }

  _getYAxisWidth () {
    return '84px'
  }
}

export class XContainer extends Container {
  resize () {
    return new XContainer(this, {})
  }

  same (container) {
    return container instanceof XContainer && this.sameBoundingRect(container)
  }
}
