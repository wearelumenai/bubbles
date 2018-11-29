'use strict'

import * as d3 from 'd3'

class RangeHelper {
  constructor (boundingRect) {
    this.boundingRect = boundingRect
  }

  generate (x, y, area, color) {
    let radiusRange = this._getRadiusRange(area)
    let xRange = this._getXRange(x, radiusRange)
    let yRange = this._getYRange(y, radiusRange)
    let colorRange = this._getColorRange(color)
    return { colorRange, xRange, yRange, radiusRange }
  }

  _getRadiusRange (area) {
    let ratio = this._getAreaRatio(area)
    let domain = RangeHelper._getDomainRange(area)
    let minArea = domain[0] * ratio
    let maxArea = domain[1] * ratio
    let range = d3.scaleLinear().domain(domain).range([minArea, maxArea])
    return (i) => Math.sqrt(range(area[i]) / Math.PI)
  }

  _getXRange (x, radiusRange) {
    let { lowerRadius, upperRadius } = RangeHelper._getBoundRadius(x, radiusRange)
    let domain = RangeHelper._getDomainRange(x)
    let range = d3.scaleLinear().domain(domain).range([lowerRadius, this.boundingRect.width - upperRadius])
    return (i) => range(x[i])
  }

  _getYRange (y, radiusRange) {
    let { lowerRadius, upperRadius } = RangeHelper._getBoundRadius(y, radiusRange)
    let domain = RangeHelper._getDomainRange(y)
    let range = d3.scaleLinear().domain(domain).range([this.boundingRect.height - upperRadius, lowerRadius])
    return (i) => range(y[i])
  }

  _getColorRange (color) {
    let domain = RangeHelper._getDomainRange(color)
    let range = d3.scaleLinear().domain(domain).range(['orange', 'red'])
    return (i) => range(color[i])
  }

  static _getDomainRange (domainValues) {
    let minValue = d3.min(domainValues)
    let maxValue = d3.max(domainValues)
    return [minValue, maxValue]
  }

  _getAreaRatio (area) {
    let boundingRectArea = this.boundingRect.width * this.boundingRect.height
    let totalArea = d3.sum(area)
    return boundingRectArea / totalArea * 0.3
  }

  static _getBoundRadius (values, radiusRange) {
    let { argmin, argmax } = RangeHelper._argRange(values)
    let lowerRadius = radiusRange(argmin)
    let upperRadius = radiusRange(argmax)
    return { lowerRadius, upperRadius }
  }

  static _argRange (values) {
    let minmax = [0, 0]

    values.forEach((value, i) => {
      if (values[minmax[0]] > value) { minmax[0] = i }
      if (values[minmax[1]] < value) { minmax[1] = i }
    })

    return { argmin: minmax[0], argmax: minmax[1] }
  }
}

class NodeBuilder {
  constructor (projection) {
    this.projection = projection
    let unzipped = this.projection.map((col, i) => this.projection.map(row => row[i]))
    this.x = unzipped[0]
    this.y = unzipped[1]
    this.area = unzipped[2]
    this.color = unzipped[3]
  }

  getNodes (rangeHelper) {
    let ranges = rangeHelper.generate(this.x, this.y, this.area, this.color)

    return this.projection.map((d, i) => {
      return {
        label: i,
        x: ranges.xRange(i),
        y: ranges.yRange(i),
        radius: ranges.radiusRange(i),
        color: ranges.colorRange(i),
        data: d
      }
    })
  }
}

class Container {
  constructor (containerSelector, document) {
    this.containerSelector = containerSelector
    this.container = this._getContainer(document)
    this.boundingClientRect = this.container.node().getBoundingClientRect()
    this.rangeHelper = new RangeHelper(this.boundingClientRect)
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
    return new NodeBuilder(projection).getNodes(this.rangeHelper)
  }
}

export function create (containerSelector, document) {
  return new Container(containerSelector, document)
}
