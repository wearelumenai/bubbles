const AxisWidth = 7

function getXEndPoints (clusters, orderedIndexes) {
  return getRange(clusters, orderedIndexes).map((d) => {
    return d.x
  })
}

function getYEndPoints (clusters, orderedIndexes) {
  return getRange(clusters, orderedIndexes).map((d) => {
    return d.y
  })
}

function getRange (clusters, orderedIndex) {
  if (orderedIndex.length === 0) {
    return []
  }
  const last = orderedIndex.length - 1
  const range = [0, last]
  return range.map(i => clusters[orderedIndex[i]])
}

function getQuartiles (clusters, orderedIndex) {
  if (orderedIndex.length === 0) {
    return []
  }
  const last = orderedIndex.length - 1
  const quartiles = [0, Math.round(last / 4), Math.round(last / 2), Math.round(3 * last / 4), last]
  return quartiles.map(i => clusters[orderedIndex[i]])
}

class Quantiles {
  getAxisTicks (values) {
    return []
  }

  static canHandle (order) {
    return true
  }
}

class XRange extends Quantiles {
  constructor (clusters, order) {
    super()
    this.xClusters = getRange(clusters, order)
  }

  getAxisTicks (values) {
    return this.xClusters.map((d, i) => {
      let label = d.label
      let x = d.x + (i === 0 ? -1 : 1) * d.radius
      let y = '1em'
      let text = `${Math.round(d.data[0] * 100) / 100}(${d.label})`
      let anchor = i === 0 ? 'start' : 'end'
      let verticalShift = AxisWidth
      let fill = 'DeepSkyBlue'
      return { label, x, y, text, anchor, verticalShift, fill }
    })
  }

  static canHandle (order) {
    return order >= 2
  }
}

class XQuartiles extends Quantiles {
  constructor (clusters, order) {
    super()
    this.xClusters = getQuartiles(clusters, order)
  }

  getAxisTicks (values) {
    let clusters = this.xClusters.map((d, i) => {
      let label = d.label
      let x = d.x + (i === 0 ? -1 : i === 4 ? 1 : 0) * d.radius
      let y = '1em'
      let text = `${Math.round(d.data[0] * 100) / 100}(${d.label})`
      let anchor = i === 0 ? 'start' : i === 4 ? 'end' : 'middle'
      let verticalShift = AxisWidth
      let fill = i % 2 === 1 ? 'Blue' : (i === 2 ? 'MidnightBlue' : 'DeepSkyBlue')
      return { label, x, y, text, anchor, verticalShift, fill }
    })
    return this._collideXAxis(values, clusters)
  }

  _collideXAxis (values, clusters) {
    if (values.size() > 0) {
      const textLengths = values.nodes().map(e => e.getComputedTextLength())
      if (clusters[2].x - textLengths[2] / 2 < clusters[0].x + textLengths[0]) {
        clusters[2].x = clusters[0].x + textLengths[0] + textLengths[2] / 2
      }
      if (clusters[2].x + textLengths[2] / 2 > clusters[4].x) {
        clusters[2].x = clusters[4].x - textLengths[2] / 2
      }
      if (clusters[1].x + textLengths[1] / 2 > clusters[2].x - textLengths[2] / 2) {
        clusters[1].y = '1em'
      }
      if (clusters[1].x - textLengths[1] / 2 < clusters[0].x + textLengths[0]) {
        clusters[1].y = '1em'
      }
      if (clusters[3].x - textLengths[3] / 2 < clusters[2].x + textLengths[2] / 2) {
        clusters[3].y = '1em'
      }
      if (clusters[3].x + textLengths[3] / 2 > clusters[4].x - textLengths[4]) {
        clusters[3].y = '1em'
      }
      if (clusters[1].x + textLengths[1] / 2 > clusters[3].x - textLengths[3] / 2) {
        clusters[3].x = clusters[1].x + textLengths[1] / 2 + textLengths[3] / 2
      }
    }
    return clusters
  }

  static canHandle (order) {
    return order >= 4
  }
}

class YRange extends Quantiles {
  constructor (clusters, order) {
    super()
    this.yClusters = getRange(clusters, order)
  }

  getAxisTicks (values) {
    let clusters = this.yClusters.map((d, i) => {
      let label = d.label
      let x = '50%'
      let y = d.y + (i === 0 ? 1 : -1) * d.radius
      let text = `${Math.round(d.data[1] * 100) / 100}(${d.label})`
      let anchor = 'middle'
      let verticalShift = i === 0 ? '-0.2em' : '0.8em'
      let fill = 'DeepSkyBlue'
      return { label, x, y, text, anchor, verticalShift, fill }
    })
    return clusters
  }

  static canHandle (order) {
    return order >= 2
  }
}

class YQuartiles extends Quantiles {
  constructor (clusters, order) {
    super()
    this.yClusters = getQuartiles(clusters, order)
  }

  getAxisTicks (values) {
    let clusters = this.yClusters.map((d, i) => {
      let label = d.label
      let x = '50%'
      let y = d.y + (i === 0 ? 1 : i === 4 ? -1 : 0) * d.radius
      let text = `${Math.round(d.data[1] * 100) / 100}(${d.label})`
      let anchor = 'middle'
      let verticalShift = i === 0 ? '-0.2em' : i === 4 ? '0.8em' : '0.5em'
      let fill = i % 2 === 1 ? 'Blue' : (i === 2 ? 'MidnightBlue' : 'DeepSkyBlue')
      return { label, x, y, text, anchor, verticalShift, fill }
    })
    return this._collideYAxis(values, clusters)
  }

  _collideYAxis (values, clusters) {
    const offset = 16
    if (clusters[1].y < clusters[2].y + offset) {
      clusters[1].y = clusters[2].y + offset
    }
    if (clusters[3].y > clusters[2].y - offset) {
      clusters[3].y = clusters[2].y - offset
    }
    if (clusters[1].y > clusters[0].y - offset) {
      clusters[1].y = clusters[0].y - offset
    }
    if (clusters[3].y < clusters[4].y + offset) {
      clusters[3].y = clusters[4].y + offset
    }
    if (clusters[2].y > clusters[1].y - offset) {
      clusters[2].y = clusters[1].y - offset
    }
    if (clusters[2].y < clusters[3].y + offset) {
      clusters[2].y = clusters[3].y + offset
    }
    return clusters
  }
}

export class QuantileFactory {
  constructor (quartiles) {
    if (typeof quartiles === 'undefined') {
      this.quartiles = false
    } else {
      this.quartiles = quartiles
    }
  }

  _getXQuantile (clusters, xOrder) {
    if (xOrder.length >= 4 && this.quartiles) {
      return new XQuartiles(clusters, xOrder)
    } else if (xOrder.length >= 2) {
      return new XRange(clusters, xOrder)
    } else {
      return new Quantiles()
    }
  }

  _getYQuantile (clusters, yOrder) {
    if (yOrder.length >= 4 && this.quartiles) {
      return new YQuartiles(clusters, yOrder)
    } else if (yOrder.length >= 2) {
      return new YRange(clusters, yOrder)
    } else {
      return new Quantiles()
    }
  }
}

export class AxisRender {
  constructor (container, quantileFactory, builder, axisRender) {
    this.container = container
    this.quantileFactory = quantileFactory || new QuantileFactory(false)
    if (typeof axisRender !== 'undefined') {
    }

    if (typeof builder !== 'undefined') {
      this._apply(builder)
    }
  }

  update (builder, container) {
    return new AxisRender(container, this.quantileFactory, builder, this)
  }

  _apply (builder) {
    this.clusters = builder.getNodes()
    this.xOrder = builder.orderX()
    this.yOrder = builder.orderY()
    this._xQuantiles = this.quantileFactory._getXQuantile(this.clusters, this.xOrder)
    this._yQuantiles = this.quantileFactory._getYQuantile(this.clusters, this.yOrder)
  }

  hideAxis () {
    this.container.selectXAxis('*').style('display', 'none')
    this.container.selectYAxis('*').style('display', 'none')
  }

  displayAxis () {
    this._displayXAxis()
    this._displayYAxis()
  }

  _displayXAxis () {
    const xLabels = this._xQuantiles.getAxisTicks(this._getXLabels())
    if (xLabels.length > 0) {
      this._displayAxisValues(this._getXLabels(), xLabels)
    }
    const xEndPoints = getXEndPoints(this.clusters, this.xOrder)
    if (xEndPoints.length > 0) {
      this._displayAxisLine(this._getXAxis(), { x: xEndPoints })
    }
    this.container.selectXAxis('*').style('display', 'block')
  }

  _displayYAxis () {
    const yLabels = this._yQuantiles.getAxisTicks(this._getYLabels())
    if (yLabels.length > 0) {
      this._displayAxisValues(this._getYLabels(), yLabels)
    }
    const yEndPoints = getYEndPoints(this.clusters, this.yOrder)
    if (yEndPoints.length > 0) {
      this._displayAxisLine(this._getYAxis(), { y: yEndPoints })
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

  _displayAxisValues (values, clusters) {
    values.data(clusters).enter().append('text')
      .attr('data-label', d => d.label)
      .classed('value', true)
      .attr('text-anchor', d => d.anchor)
      .attr('fill', d => d.fill)
      .attr('dy', d => d.verticalShift)
      .merge(values)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .text(d => d.text)
  }

  _displayAxisLine (values, endPoints) {
    values = values.data([endPoints]).enter().append('path')
      .classed('axis', true)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', '3')
      .merge(values)
    values.attr('d', (ep) => {
      let yAxisWidth = this.container.getYAxisWidth()
      return ep.hasOwnProperty('x')
        ? `M ${ep.x[0]} ${AxisWidth} V 0 H ${ep.x[1]} V 7`
        : `M ${yAxisWidth - 7} ${ep.y[0]} H ${yAxisWidth} V ${ep.y[1]} H ${yAxisWidth - 7}`
    })
  }
}
