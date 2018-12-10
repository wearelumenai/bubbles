'use strict'

import * as d3 from 'd3'
import ScaleHelper from './ScaleHelper'

class Container {
  constructor (container, listeners, document) {
    if (typeof container === 'string') {
      this._initContainer(container, document)
    } else if (container instanceof Container) {
      this._copyContainer(container)
    } else {
      throw new TypeError('unable to build container')
    }
    this._applyListeners(listeners)
    this._initScales()
  }

  resize () {
    return new XYContainer(this, {}, undefined)
  }

  _initContainer (containerSelector, document) {
    this.containerSelector = containerSelector
    this._containerElement = this._setupContainer(containerSelector, document)
    this._infoElement = this._makeToolTip(this._containerElement)
    this._chartElement = this._makeChart(this._containerElement, this._getYAxisWidth())
    this._xAxisElement = this._makeXAxis(this._containerElement)
    this._yAxisElement = this._makeYAxis(this._containerElement, this._getYAxisWidth())
  }

  _setupContainer (containerSelector, document) {
    let element
    if (typeof document !== 'undefined') {
      element = d3.select(document).select(containerSelector)
    } else {
      element = d3.select(containerSelector)
    }
    return element.style('position', 'relative').style('margin', '0')
  }

  _copyContainer (container) {
    this.containerSelector = container.containerSelector
    this._containerElement = container._containerElement
    this._infoElement = this._setupTooltip(container._infoElement)
    this._chartElement = this._setupChart(container._chartElement, this._getYAxisWidth())
    this._xAxisElement = this._setupXAxis(container._xAxisElement, this._getYAxisWidth())
    this._yAxisElement = this._setupYAxis(container._yAxisElement, this._getYAxisWidth())
  }

  _initScales () {
    this._chartBoundingRect = this._chartElement.node().getBoundingClientRect()
    this.scaleHelper = new ScaleHelper(this._chartBoundingRect)
  }

  _makeToolTip (container) {
    return this._setupTooltip(container.append('p'))
  }

  _setupTooltip (tooltip) {
    return tooltip
      .classed('info', true)
      .style('position', 'absolute')
      .style('width', '1em')
      .style('margin-left', '7em')
      .style('margin-bottom', '2em')
      .style('z-index', '100')
      .style('pointer-events', 'none')
  }

  _makeChart (container, left) {
    let chart = this._setupChart(container.append('div'), left)
    chart.append('svg')
      .classed('chart', true)
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('height', '100%')
      .style('width', '100%')
    return chart
  }

  _setupChart (chart, left) {
    return chart
      .classed('chart', true)
      .style('position', 'absolute')
      .style('top', '0')
      .style('bottom', '2em')
      .style('left', left)
      .style('right', '0')
  }

  _makeXAxis (container, left) {
    let xAxis = this._setupXAxis(container.append('div'), left)
    xAxis.append('svg')
      .classed('x-axis', true)
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('height', '100%')
      .style('width', '100%')
    return xAxis
  }

  _setupXAxis (xAxis, left) {
    return xAxis
      .classed('x-axis', true)
      .style('position', 'absolute')
      .style('height', '2em')
      .style('bottom', '0')
      .style('left', left)
      .style('right', '0')
  }

  _makeYAxis (container, width) {
    let yAxis = this._setupYAxis(container.append('div'), width)
    yAxis.append('svg')
      .classed('y-axis', true)
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0')
      .style('height', '100%')
      .style('width', '100%')
    return yAxis
  }

  _setupYAxis (yAxis, width) {
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

  getShape () {
    return this._chartBoundingRect
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

export class XYContainer extends Container {
  _getYAxisWidth () {
    return '7em'
  }
}

export class XContainer extends Container {
  _getYAxisWidth () {
    return '0'
  }
}
