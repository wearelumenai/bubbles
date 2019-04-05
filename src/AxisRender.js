import { AxisWidth, getXEndPoints, getYEndPoints } from './quantiles'

export class AxisRender {
  constructor (container, percentileFactory, builder) {
    this.percentileFactory = percentileFactory
    this.xAxisRender = new XAxisRender(container, percentileFactory, builder)
    this.yAxisRender = new YAxisRender(container, percentileFactory, builder)
  }

  displayAxis () {
    this.xAxisRender.displayXAxis()
    this.yAxisRender.displayYAxis()
  }
}

class XAxisRender {
  constructor (container, percentileFactory, builder) {
    this._container = container
    this._percentileFactory = percentileFactory
    if (typeof builder !== 'undefined') {
      this._clusters = builder.getNodes()
      this._xOrder = builder.orderX()
      this._xPercentiles = this._percentileFactory._getXPercentile(this._clusters, this._xOrder)
      this._label = builder.getDimensions().x
    }
  }

  displayXAxis () {
    const textLengths = this.getXValues().nodes().map(e => e.getComputedTextLength())
    const xLabels = this._xPercentiles.getAxisTicks(textLengths)
    if (xLabels.length > 0) {
      displayAxisValues(this.getXValues(), xLabels)
    }
    const xEndPoints = getXEndPoints(this._clusters, this._xOrder)
    if (xEndPoints.length > 0) {
      XAxisRender.displayXAxisLine(this.getXAxis(), xLabels)
    }
    XAxisRender.displayXLabel(this.getXLabel(), this._label)
    this._container.selectXAxis('*').style('display', 'block')
  }

  getXLabel () {
    return this._container.selectXAxis('.label')
  }

  getXValues () {
    return this._container.selectXAxis('.value')
  }

  getXAxis () {
    return this._container.selectXAxis('.axis')
  }

  static displayXAxisLine (values, ticks) {
    values = makeAxisPath(values, ticks)
    values.attr('d', (ep) => {
      return `M ${ep[0].x} ${AxisWidth} V 0 H ${ep[1].x} V 7`
    })
  }

  static displayXLabel (nodes, label) {
    nodes.data([label]).enter().append('text')
      .classed('label', true)
      .attr('x', '100%')
      .attr('dy', -AxisWidth)
      .attr('text-anchor', 'end')
      .merge(nodes)
      .text(label)
  }
}

export class YAxisRender {
  constructor (container, percentileFactory, builder) {
    this._container = container
    this._percentileFactory = percentileFactory
    if (typeof builder !== 'undefined') {
      this._clusters = builder.getNodes()
      this._yOrder = builder.orderY()
      this._yPercentiles = this._percentileFactory._getYPercentile(this._clusters, this._yOrder)
      this._label = builder.getDimensions().y
    }
  }

  displayYAxis () {
    const textHeights = this.getYValues().nodes().map(e => parseInt(window.getComputedStyle(e).fontSize, 10))
    const yLabels = this._yPercentiles.getAxisTicks(textHeights)
    if (yLabels.length > 0) {
      displayAxisValues(this.getYValues(), yLabels)
    }
    const yEndPoints = getYEndPoints(this._clusters, this._yOrder)
    if (yEndPoints.length > 0) {
      YAxisRender.displayYAxisLine(this.getYAxis(), yLabels)
    }
    YAxisRender.displayYLabel(this.getYLabel(), this._label)
    this._container.selectYAxis('*').style('display', 'block')
  }

  getYLabel () {
    return this._container.selectYAxis('.label')
  }

  getYValues () {
    return this._container.selectYAxis('.value')
  }

  getYAxis () {
    return this._container.selectYAxis('.axis')
  }

  static displayYAxisLine (values, ticks) {
    values = makeAxisPath(values, ticks).style('transform', 'translate(100%)')
    values.attr('d', (ep) => {
      return `M ${-AxisWidth} ${ep[0].y} H 0 V ${ep[1].y} H ${-AxisWidth}`
    })
  }

  static displayYLabel (nodes, label) {
    nodes.data([label]).enter().append('text')
      .classed('label', true)
      .merge(nodes)
      .attr('x', '100%')
      .attr('dx', -AxisWidth)
      .attr('dy', '-0.4em')
      .text(label)
  }
}

function displayAxisValues (nodes, values) {
  nodes.data(values).enter().append('text')
    .attr('data-label', d => d.label)
    .classed('value', true)
    .attr('text-anchor', d => d.anchor)
    .attr('fill', d => d.fill)
    .attr('dx', d => d.horizontalShift)
    .attr('dy', d => d.verticalShift)
    .merge(nodes)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .text(d => d.text)
}

function makeAxisPath (values, ticks) {
  let endPoints = [[ticks[0], ticks[ticks.length - 1]]]
  return values.data(endPoints).enter().append('path')
    .classed('axis', true)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', '3')
    .merge(values)
}
