import { AxisWidth, getXEndPoints, getYEndPoints } from './quantiles'

export class AxisRender {
  constructor (container, percentileFactory, builder) {
    this.container = container
    this.percentileFactory = percentileFactory
    if (typeof builder !== 'undefined') {
      this.clusters = builder.getNodes()
      this.xOrder = builder.orderX()
      this.yOrder = builder.orderY()
      this._xPercentiles = this.percentileFactory._getXPercentile(this.clusters, this.xOrder)
      this._yPercentiles = this.percentileFactory._getYPercentile(this.clusters, this.yOrder)
    }
  }

  displayAxis () {
    this._displayXAxis()
    this._displayYAxis()
  }

  _displayXAxis () {
    const textLengths = this._getXLabels().nodes().map(e => e.getComputedTextLength())
    const xLabels = this._xPercentiles.getAxisTicks(textLengths)
    if (xLabels.length > 0) {
      AxisRender._displayAxisValues(this._getXLabels(), xLabels)
    }
    const xEndPoints = getXEndPoints(this.clusters, this.xOrder)
    if (xEndPoints.length > 0) {
      AxisRender._displayXAxisLine(this._getXAxis(), xLabels)
    }
    this.container.selectXAxis('*').style('display', 'block')
  }

  _displayYAxis () {
    const textHeights = this._getYLabels().nodes().map(e => parseInt(window.getComputedStyle(e).fontSize, 10))
    const yLabels = this._yPercentiles.getAxisTicks(textHeights)
    if (yLabels.length > 0) {
      AxisRender._displayAxisValues(this._getYLabels(), yLabels)
    }
    const yEndPoints = getYEndPoints(this.clusters, this.yOrder)
    if (yEndPoints.length > 0) {
      AxisRender._displayYAxisLine(this._getYAxis(), yLabels)
    }
    this.container.selectYAxis('*').style('display', 'block')
  }

  _getXLabels () {
    return this.container.selectXAxis('.value')
  }

  _getXAxis () {
    return this.container.selectXAxis('.axis')
  }

  _getYLabels () {
    return this.container.selectYAxis('.value')
  }

  _getYAxis () {
    return this.container.selectYAxis('.axis')
  }

  static _displayAxisValues (values, ticks) {
    values.data(ticks).enter().append('text')
      .attr('data-label', d => d.label)
      .classed('value', true)
      .attr('text-anchor', d => d.anchor)
      .attr('fill', d => d.fill)
      .attr('dx', d => d.horizontalShift)
      .attr('dy', d => d.verticalShift)
      .merge(values)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .text(d => d.text)
  }

  static _displayXAxisLine (values, ticks) {
    values = AxisRender.makePath(values, ticks)
    values.attr('d', (ep) => {
      return `M ${ep[0].x} ${AxisWidth} V 0 H ${ep[1].x} V 7`
    })
  }

  static _displayYAxisLine (values, ticks) {
    values = AxisRender.makePath(values, ticks).style('transform', 'translate(100%)')
    values.attr('d', (ep) => {
      return `M ${-AxisWidth} ${ep[0].y} H 0 V ${ep[1].y} H ${-AxisWidth}`
    })
  }

  static makePath (values, ticks) {
    let endPoints = [[ticks[0], ticks[ticks.length - 1]]]
    return values.data(endPoints).enter().append('path')
      .classed('axis', true)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', '3')
      .merge(values)
  }
}
