'use strict'

import * as d3 from 'd3'
import ScaleHelper from './ScaleHelper'

export default class Container {
  constructor (containerSelector, listeners, document) {
    this.containerSelector = containerSelector
    this._containerElement = this._makeContainer(document)
    this._applyListeners(listeners)
    this.scaleHelper = new ScaleHelper(this._chartBoundingRect)
  }

  _makeContainer (document) {
    let container
    if (typeof document !== 'undefined') {
      container = d3.select(document).select(this.containerSelector)
    } else {
      container = d3.select(this.containerSelector)
    }
    container.style('position', 'relative').style('margin', '0')
    this._infoElement = this._makeInfo(container)
    this._chartElement = this._makeChart(container)
    this._chartBoundingRect = this._chartElement.node().getBoundingClientRect()
    return container
  }

  _makeInfo (container) {
    return container.append('p')
      .attr('class', 'info')
      .style('position', 'absolute')
      .style('width', '1em')
      .style('margin-left', '2em')
      .style('margin-bottom', '2em')
      .style('z-index', '100')
      .style('pointer-events', 'none')
  }

  _makeChart (container) {
    const chart = container.append('div')
      .style('position', 'absolute')
      .style('top', '0')
      .style('bottom', '2em')
      .style('left', '2em')
      .style('right', '0')
    chart.append('svg')
      .attr('class', 'chart')
      .style('height', '100%')
      .style('width', '100%')
    return chart
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

  selectSVG (selector) {
    return this._containerElement.select('svg').selectAll(selector)
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
}
