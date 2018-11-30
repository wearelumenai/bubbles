'use strict'

import * as d3 from 'd3'
import ScaleHelper from './ScaleHelper'

class NodeBuilder {
  constructor (projection) {
    this.projection = projection
    let unzipped = this.projection.map((col, i) => this.projection.map(row => row[i]))
    this.x = unzipped[0]
    this.y = unzipped[1]
    this.area = unzipped[2]
    this.color = unzipped[3]
  }

  getNodes (scaleHelper) {
    let scales = scaleHelper.generate(this.x, this.y, this.area, this.color)

    return this.projection.map((d, i) => {
      return {
        label: i,
        x: scales.xScale(i),
        y: scales.yScale(i),
        radius: scales.radiusScale(i),
        color: scales.colorScale(i),
        data: d
      }
    })
  }
}

export default class Container {
  constructor (containerSelector, document) {
    this.containerSelector = containerSelector
    this.container = this._getContainer(document)
    this.boundingClientRect = this.container.node().getBoundingClientRect()
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

  selectAll (selector) {
    return this.container.selectAll(selector)
  }

  boundX (node) {
    return Math.max(node.radius, Math.min(this.boundingClientRect.width - node.radius, node.x))
  }

  boundY (node) {
    return Math.max(node.radius, Math.min(this.boundingClientRect.height - node.radius, node.y))
  }

  getNodes (projection) {
    return new NodeBuilder(projection).getNodes(this.scaleHelper)
  }
}
