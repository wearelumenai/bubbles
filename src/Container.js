'use strict'

import * as d3 from 'd3'
import ScaleHelper from './ScaleHelper'

export default class Container {
  constructor (containerSelector, listeners, document) {
    this.containerSelector = containerSelector
    this._containerElement = this._makeContainer(document)
    this._applyListeners(listeners)
    this.resize()
  }

  _makeContainer (document) {
    let container
    if (typeof document !== 'undefined') {
      container = d3.select(document).select(this.containerSelector)
    } else {
      container = d3.select(this.containerSelector)
    }
    container.style('position', 'relative').style('margin', '0')
    this._infoElement = this._makeToolTip(container)
    this._chartElement = this._makeChart(container)
    this._xAxisElement = this._makeXAxis(container)
    this._yAxisElement = this._makeYAxis(container)
    return container
  }

  _makeToolTip (container) {
    return container.append('p')
      .attr('class', 'info')
      .style('position', 'absolute')
      .style('width', '1em')
      .style('margin-left', '7em')
      .style('margin-bottom', '2em')
      .style('z-index', '100')
      .style('pointer-events', 'none')
  }

  _makeChart (container) {
    let chart = container.append('div')
      .style('position', 'absolute')
      .style('top', '0')
      .style('bottom', '2em')
      .style('left', '7em')
      .style('right', '0')
    chart.append('svg')
      .attr('class', 'chart')
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('height', '100%')
      .style('width', '100%')
    return chart
  }

  _makeXAxis (container) {
    let xAxis = container.append('div')
      .style('position', 'absolute')
      .style('height', '2em')
      .style('bottom', '0')
      .style('left', '7em')
      .style('right', '0')
    xAxis.append('svg')
      .attr('class', 'x-axis')
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('height', '100%')
      .style('width', '100%')
    return xAxis
  }

  _makeYAxis (container) {
    let yAxis = container.append('div')
      .style('position', 'absolute')
      .style('top', '0')
      .style('bottom', '2em')
      .style('left', '0')
      .style('width', '7em')
    yAxis.append('svg')
      .attr('class', 'y-axis')
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('height', '100%')
      .style('width', '100%')
    return yAxis
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

  resize () {
    this._chartBoundingRect = this._chartElement.node().getBoundingClientRect()
    this.scaleHelper = new ScaleHelper(this._chartBoundingRect)
  }

  onMouse (onMove, onOut) {
    this._applyListeners({
      'mousemove': () => {
        const [x, y] = this.getMousePosition()
        onMove(this._infoElement, x, y)
      },
      'mouseout': () => onOut(this._infoElement)
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

  boundX (node) {
    if ('radius' in node) {
      return Math.max(node.radius, Math.min(this._chartBoundingRect.width - node.radius, node.x))
    }
    if ('width' in node) {
      return Math.min(this._chartBoundingRect.width - node.width, node.left)
    }
    throw new TypeError('unable to bound node')
  }

  boundY (node) {
    if ('radius' in node) {
      return Math.max(node.radius, Math.min(this._chartBoundingRect.height - node.radius, node.y))
    }
    if ('height' in node) {
      return Math.min(this._chartBoundingRect.height - node.height, node.top)
    }
    throw new TypeError('unable to bound node')
  }

  asChartContainer () {
    return {
      selectChart: (selector) => this.selectChart(selector),
      boundX: (selector) => this.boundX(selector),
      boundY: (selector) => this.boundY(selector)
    }
  }

  asToolTipContainer () {
    return {
      onMouse: (onMove, onOut) => this.onMouse(onMove, onOut),
      boundX: (selector) => this.boundX(selector),
      boundY: (selector) => this.boundY(selector)
    }
  }

  asAxisContainer () {
    return {
      selectXAxis: (selector) => this.selectXAxis(selector),
      selectYAxis: (selector) => this.selectYAxis(selector)
    }
  }
}
