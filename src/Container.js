'use strict'

import * as d3 from 'd3'
import ScaleHelper from './ScaleHelper'

class Container {
  constructor (container, listeners) {
    if (typeof container === 'string') {
      this._initContainer(container, listeners)
    } else {
      this._copyContainer(container)
    }
    this._applyListeners(listeners)
    this._initScales()
  }

  _initContainer (containerSelector, listeners) {
    this.containerSelector = containerSelector
    this._containerElement = Container._setupContainer(containerSelector)
    this._listeners = listeners
    this._infoElement = Container._makeToolTip(this._containerElement, this._getYAxisWidth())
    this._chartElement = Container._makeChart(this._containerElement, this._getYAxisWidth())
    this._xAxisElement = Container._makeXAxis(this._containerElement, this._getYAxisWidth())
    this._yAxisElement = Container._makeYAxis(this._containerElement, this._getYAxisWidth())
    this._init = true
  }

  static _setupContainer (containerSelector) {
    let element = d3.select(containerSelector)
    element.selectAll('*').remove()
    return element.style('position', 'relative').style('margin', '0')
  }

  _copyContainer (container) {
    this.containerSelector = container.containerSelector
    this._containerElement = container._containerElement
    this._listeners = container._listeners
    this._infoElement = Container._setupTooltip(container._infoElement, this._getYAxisWidth())
    this._chartElement = Container._setupChart(container._chartElement, this._getYAxisWidth())
    this._xAxisElement = Container._setupXAxis(container._xAxisElement, this._getYAxisWidth())
    this._yAxisElement = Container._setupYAxis(container._yAxisElement, this._getYAxisWidth())
    this._init = container._init
  }

  _initScales () {
    this._chartBoundingRect = this._chartElement.node().getBoundingClientRect()
    this.scaleHelper = new ScaleHelper(this._chartBoundingRect)
  }

  static _makeToolTip (container, marginLeft) {
    return Container._setupTooltip(container.append('p'), marginLeft)
  }

  static _setupTooltip (tooltip, marginLeft) {
    return tooltip
      .classed('info', true)
      .style('position', 'absolute')
      .style('width', '1em')
      .style('padding-left', marginLeft)
      .style('margin-bottom', '2em')
      .style('z-index', '100')
      .style('pointer-events', 'none')
  }

  static _makeChart (container, left) {
    let chart = Container._setupChart(container.append('div'), left)
    chart.append('svg')
      .classed('chart', true)
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('height', '100%')
      .style('width', '100%')
    return chart
  }

  static _setupChart (chart, left) {
    return chart
      .classed('chart', true)
      .style('position', 'absolute')
      .style('top', '0')
      .style('bottom', '2em')
      .style('left', left)
      .style('right', '0')
  }

  static _makeXAxis (container, left) {
    let xAxis = Container._setupXAxis(container.append('div'), left)
    xAxis.append('svg')
      .classed('x-axis', true)
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('height', '100%')
      .style('width', '100%')
    return xAxis
  }

  static _setupXAxis (xAxis, left) {
    return xAxis
      .classed('x-axis', true)
      .style('position', 'absolute')
      .style('height', '2em')
      .style('bottom', '0')
      .style('left', left)
      .style('right', '0')
  }

  static _makeYAxis (container, width) {
    let yAxis = Container._setupYAxis(container.append('div'), width)
    yAxis.append('svg')
      .classed('y-axis', true)
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('height', '100%')
      .style('width', '100%')
    return yAxis
  }

  static _setupYAxis (yAxis, width) {
    return yAxis
      .classed('y-axis', true)
      .style('position', 'absolute')
      .style('top', '0')
      .style('bottom', '2em')
      .style('left', '0')
      .style('width', width)
  }

  _applyListeners (listeners) {
    if (listeners) {
      Object.entries(listeners).forEach(
        ([event, handler]) => {
          this._chartElement.on(event, handler)
        }
      )
    }
  }

  _getYAxisWidth () {
    return '0'
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

  getShape () {
    return this._chartBoundingRect
  }

  onClick (action) {
    if (typeof this._clickActions === 'undefined' && this._listeners.hasOwnProperty('click')) {
      this._clickActions = [this._listeners['click'], action]
    } else if (typeof this._clickActions === 'undefined') {
      this._clickActions = [action]
    } else {
      this._clickActions.push(action)
    }
    this._applyListeners({
      'click': () => {
        const [x, y] = this.getMousePosition()
        this._doClick(x, y)
      }
    })
  }

  _doClick (x, y) {
    for (let i = 0; i < this._clickActions.length; i++) {
      this._clickActions[i](x, y)
    }
  }

  onMouse (onMove, onOut) {
    this._applyListeners({
      'mousemove': () => {
        const [x, y] = this.getMousePosition()
        onMove(x, y)
      },
      'mouseout': () => onOut()
    })
  }

  getMousePosition () {
    return d3.mouse(this._chartElement.node())
  }

  getScales (x, y, areas, colors) {
    return this.scaleHelper.generate(x, y, areas, colors)
  }

  selectChart (selector) {
    return this._containerElement.select('svg').selectAll(selector)
  }

  selectXAxis (selector) {
    return this._xAxisElement.select('.x-axis').selectAll(selector)
  }

  selectYAxis (selector) {
    return this._yAxisElement.select('.y-axis').selectAll(selector)
  }

  getInfo () {
    return this._infoElement
  }

  boundX (node) {
    if ('radius' in node) {
      return Math.max(node.radius + 1, Math.min(
        this._chartBoundingRect.width - node.radius - 1, node.x))
    }
    if ('width' in node) {
      return Math.max(1, Math.min(
        this._chartBoundingRect.width + this._chartBoundingRect.left - node.width - 1, node.left))
    }
    throw new TypeError('unable to bound node')
  }

  boundY (node) {
    if ('radius' in node) {
      return Math.max(node.radius + 2, Math.min(
        this._chartBoundingRect.height - node.radius - 2, node.y))
    }
    if ('height' in node) {
      return Math.max(2, Math.min(
        this._chartBoundingRect.height - node.height - 2, node.top))
    }
    throw new TypeError('unable to bound node')
  }

  getYAxisWidth () {
    const yRect = this._yAxisElement.node().getBoundingClientRect()
    return typeof yRect !== 'undefined' ? yRect.width : 0
  }

  asChartContainer () {
    return {
      onClick: (action) => this.onClick(action),
      selectChart: (selector) => this.selectChart(selector),
      boundX: (selector) => this.boundX(selector),
      boundY: (selector) => this.boundY(selector)
    }
  }

  asToolTipContainer () {
    return {
      onMouse: (onMove, onOut) => this.onMouse(onMove, onOut),
      boundX: (selector) => this.boundX(selector),
      boundY: (selector) => this.boundY(selector),
      getInfo: () => this.getInfo()
    }
  }

  asAxisContainer () {
    return {
      selectXAxis: (selector) => this.selectXAxis(selector),
      selectYAxis: (selector) => this.selectYAxis(selector),
      getYAxisWidth: () => this.getYAxisWidth()
    }
  }

  sameBoundingRect (container) {
    return container._chartBoundingRect.x === this._chartBoundingRect.x &&
      container._chartBoundingRect.y === this._chartBoundingRect.y &&
      container._chartBoundingRect.width === this._chartBoundingRect.width &&
      container._chartBoundingRect.height === this._chartBoundingRect.height
  }
}

export class XYContainer extends Container {
  reset () {
    return new XYContainer(this.containerSelector, this._listeners)
  }

  resize () {
    return new XYContainer(this, {}, undefined)
  }

  same (container) {
    return container instanceof XYContainer && this.sameBoundingRect(container)
  }

  _getYAxisWidth () {
    return '84px'
  }
}

export class XContainer extends Container {
  reset () {
    return new XContainer(this.containerSelector, this._listeners)
  }

  resize () {
    return new XContainer(this, {}, undefined)
  }

  same (container) {
    return container instanceof XContainer && this.sameBoundingRect(container)
  }
}
