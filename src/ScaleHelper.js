import * as d3 from 'd3'

export default class ScaleHelper {
  constructor (boundingRect) {
    this.boundingRect = boundingRect
  }

  generate (x, y, area, color) {
    let radiusScale = this._getRadiusScale(area)
    let xScale = this._getXScale(x, radiusScale)
    let yScale = this._getYScale(y, radiusScale)
    let colorScale = this._getColorScale(color)
    return { colorScale, xScale, yScale, radiusScale }
  }

  _getRadiusScale (area) {
    let ratio = this._getAreaRatio(area)
    let domain = ScaleHelper._range(area)
    let minArea = domain[0] * ratio
    let maxArea = domain[1] * ratio
    let scale = d3.scaleLinear().domain(domain).range([minArea, maxArea])
    return (i) => Math.sqrt(scale(area[i]) / Math.PI)
  }

  _getXScale (x, radiusScale) {
    let { lowerRadius, upperRadius } = ScaleHelper._getBoundRadius(x, radiusScale)
    let domain = ScaleHelper._range(x)
    let scale = d3.scaleLinear().domain(domain).range([lowerRadius, this.boundingRect.width - upperRadius])
    return (i) => scale(x[i])
  }

  _getYScale (y, radiusScale) {
    let { lowerRadius, upperRadius } = ScaleHelper._getBoundRadius(y, radiusScale)
    let domain = ScaleHelper._range(y)
    let scale = d3.scaleLinear().domain(domain).range([this.boundingRect.height - upperRadius, lowerRadius])
    return (i) => scale(y[i])
  }

  _getColorScale (color) {
    let domain = ScaleHelper._range(color)
    let scale = d3.scaleLinear().domain(domain).range(['orange', 'red'])
    return (i) => scale(color[i])
  }

  static _range (domainValues) {
    let minValue = d3.min(domainValues)
    let maxValue = d3.max(domainValues)
    return [minValue, maxValue]
  }

  _getAreaRatio (area) {
    let boundingRectArea = this.boundingRect.width * this.boundingRect.height
    let totalArea = d3.sum(area)
    return boundingRectArea / totalArea * 0.3
  }

  static _getBoundRadius (values, radiusScale) {
    let { argmin, argmax } = ScaleHelper._argrange(values)
    let lowerRadius = radiusScale(argmin)
    let upperRadius = radiusScale(argmax)
    return { lowerRadius, upperRadius }
  }

  static _argrange (values) {
    let minmax = [0, 0]

    values.forEach((value, i) => {
      if (values[minmax[0]] > value) { minmax[0] = i }
      if (values[minmax[1]] < value) { minmax[1] = i }
    })

    return { argmin: minmax[0], argmax: minmax[1] }
  }
}
