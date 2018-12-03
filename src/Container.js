'use strict'

import * as d3 from 'd3'
import ScaleHelper from './ScaleHelper'

export default class Container {
  constructor (containerSelector, document) {
    this.containerSelector = containerSelector
    this.containerElement = this._getContainer(document)
    this.boundingClientRect = this.containerElement.select('svg').node().getBoundingClientRect()
    this.scaleHelper = new ScaleHelper(this.boundingClientRect)
  }

  _getContainer (document) {
    let container
    if (typeof document !== 'undefined') {
      container = d3.select(document).select(this.containerSelector)
    } else {
      container = d3.select(this.containerSelector)
    }
    container.style('position', 'relative').style('margin', '0')
    container.append('svg').style('position', 'absolute').style('top', '0').style('left', '0').style('height', '100%').style('width', '100%')
    container.append('p').attr('class', 'info').style('position', 'absolute').style('width', '7em')
    return container
  }

  mouse () {
    return d3.mouse(this.containerElement.node())
  }

  getScales (x, y, areas, colors) {
    return this.scaleHelper.generate(x, y, areas, colors)
  }

  selectSVG (selector) {
    return this.containerElement.select('svg').selectAll(selector)
  }

  boundX (node) {
    return Math.max(node.radius, Math.min(this.boundingClientRect.width - node.radius, node.x))
  }

  boundY (node) {
    return Math.max(node.radius, Math.min(this.boundingClientRect.height - node.radius, node.y))
  }
}
