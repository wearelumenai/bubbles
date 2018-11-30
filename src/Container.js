'use strict'

import * as d3 from 'd3'
import ScaleHelper from './ScaleHelper'

export default class Container {
  constructor (containerSelector, document) {
    this.containerSelector = containerSelector
    this.containerElement = this._getContainer(document)
    this.boundingClientRect = this.containerElement.node().getBoundingClientRect()
    this.scaleHelper = new ScaleHelper(this.boundingClientRect)
  }

  _getContainer (document) {
    let container
    if (typeof document !== 'undefined') {
      container = d3.select(document).select(this.containerSelector)
    } else {
      container = d3.select(this.containerSelector)
    }
    return container.append('svg').style('width', '100%').style('height', '100%')
  }

  getScales (x, y, areas, colors) {
    return this.scaleHelper.generate(x, y, areas, colors)
  }

  selectAll (selector) {
    return this.containerElement.selectAll(selector)
  }

  boundX (node) {
    return Math.max(node.radius, Math.min(this.boundingClientRect.width - node.radius, node.x))
  }

  boundY (node) {
    return Math.max(node.radius, Math.min(this.boundingClientRect.height - node.radius, node.y))
  }
}
