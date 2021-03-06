import * as d3 from 'd3'

const areaRatioTarget = 0.0625
const totalAreaRatio = 0.1
const xScaleExponent = 0.5
const yScaleExponent = 0.5
const colorScaleExponent = 0.05

export class ScaleHelper {
  constructor (boundingRect) {
    this.boundingRect = boundingRect
  }

  generate (x, y, area, color) {
    const radiusScale = this._getRadiusScale(area)
    const xScale = this._getXScale(x, radiusScale)
    const yScale = this._getYScale(y, radiusScale)
    const colorScale = this._getColorScale(color)
    const textColorScale = this._getTextColorScale(color)
    return { colorScale, textColorScale, xScale, yScale, radiusScale }
  }

  _getRadiusScale (area) {
    const { domain, positiveArea } = this._ensurePositiveArea(area)
    const ratio = this._getAreaRatio(positiveArea)
    const minArea = domain[0] * ratio
    const maxArea = domain[1] * ratio
    const scale = d3.scaleLinear().domain(domain).range([minArea, maxArea])
    return (i) => area[i] === 0 ? 0 : Math.sqrt(scale(positiveArea[i]) / Math.PI)
  }

  _getXScale (x, radiusScale) {
    const { lowerRadius, upperRadius } = ScaleHelper._getBoundRadius(x, radiusScale)
    const domain = ScaleHelper._range(x)
    const scale = d3.scalePow().exponent(xScaleExponent).domain(domain).range([lowerRadius, this.boundingRect.width - upperRadius])
    return (i) => scale(x[i])
  }

  _getYScale (y, radiusScale) {
    const { lowerRadius, upperRadius } = ScaleHelper._getBoundRadius(y, radiusScale)
    const domain = ScaleHelper._range(y)
    const scale = d3.scalePow().exponent(yScaleExponent).domain(domain).range([this.boundingRect.height - lowerRadius, upperRadius])
    return (i) => scale(y[i])
  }

  _getColorScale (color) {
    let domain = ScaleHelper._range(color)
    domain = [domain[0], (domain[0] + domain[1]) / 2, domain[1]]
    // const scale = d3.scalePow().exponent(colorScaleExponent).domain(domain).range(['green', 'yellow', 'red'])
    // const scale = d3.scalePow().exponent(colorScaleExponent).domain(domain).range(['#87E990', '#FEF86C', '#FF6347'])
    // const scale = d3.scalePow().exponent(colorScaleExponent).domain(domain).range(['#87E990', '#CECECE', '#BD33A4'])
    // const scale = d3.scalePow().exponent(colorScaleExponent).domain(domain).range(['#D8BFD8', '#DA70D6', '#BD33A4'])
    // const scale = d3.scalePow().exponent(colorScaleExponent).domain(domain).range(['#00C493', '#00C4B6', '#00B0C4'])
    const scale = d3.scalePow().exponent(colorScaleExponent).domain(domain).range(['#FF8CB7', '#EB3660', '#AE32B8'])
    return (i) => scale(color[i])
  }

  _getTextColorScale (color) {
    let domain = ScaleHelper._range(color)
    domain = [domain[0], (domain[0] + domain[1]) / 2, domain[1]]
    const preScale = d3.scalePow().exponent(colorScaleExponent).domain(domain).range([0, 0.5, 1])
    const scale = d3.scaleThreshold().domain([0.25, 0.75]).range(['black', 'black', 'black'])
    return (i) => scale(preScale(color[i]))
  }

  static _range (domainValues) {
    const minValue = d3.min(domainValues)
    const maxValue = d3.max(domainValues)
    return [minValue, maxValue]
  }

  _ensurePositiveArea (area) {
    let positiveArea = area
    let domain = ScaleHelper._range(area)
    const minArea = domain[1] * areaRatioTarget
    if (domain[0] < minArea) {
      positiveArea = area.map(a => a - domain[0] + minArea)
      domain = [minArea, domain[1] - domain[0] + minArea]
    }
    return { domain, positiveArea }
  }

  _getAreaRatio (area) {
    const boundingRectArea = this.boundingRect.width * this.boundingRect.height
    const totalArea = d3.sum(area)
    return boundingRectArea / totalArea * totalAreaRatio
  }

  static _getBoundRadius (values, radiusScale) {
    const { argmin, argmax } = ScaleHelper._argrange(values)
    let upperRadius = radiusScale(argmax)
    if (upperRadius < 12) {
      upperRadius = 12
    }
    let lowerRadius = radiusScale(argmin)
    if (lowerRadius < 12) {
      lowerRadius = 12
    }
    return { lowerRadius, upperRadius }
  }

  static _argrange (values) {
    const minmax = [0, 0]

    values.forEach((value, i) => {
      if (values[minmax[0]] > value) {
        minmax[0] = i
      }
      if (values[minmax[1]] < value) {
        minmax[1] = i
      }
    })

    return { argmin: minmax[0], argmax: minmax[1] }
  }
}
