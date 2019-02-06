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

class Percentiles {
  getAxisTicks (values) {
    return []
  }

  static canHandle (order) {
    return true
  }
}

class XRange extends Percentiles {
  constructor (clusters, order) {
    super()
    this.xClusters = getRange(clusters, order)
  }

  getAxisTicks (values) {
    return this.xClusters.map((d, i) => {
      let label = d.label
      let x = d.x
      let y = '1em'
      let text = `${Math.round(d.data[0] * 100) / 100}`
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

class XQuartiles extends Percentiles {
  constructor (clusters, order) {
    super()
    this.xClusters = getQuartiles(clusters, order)
  }

  getAxisTicks (values) {
    let clusters = this.xClusters.map((d, i) => {
      let label = d.label
      let x = d.x
      let y = '1em'
      let text = `${Math.round(d.data[0] * 100) / 100}`
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

class YRange extends Percentiles {
  constructor (clusters, order) {
    super()
    this.yClusters = getRange(clusters, order)
  }

  getAxisTicks (values) {
    let clusters = this.yClusters.map((d, i) => {
      let label = d.label
      let x = '50%'
      let y = d.y
      let text = `${Math.round(d.data[1] * 100) / 100}`
      let anchor = 'middle'
      let verticalShift = '0.4em'
      let fill = 'DeepSkyBlue'
      return { label, x, y, text, anchor, verticalShift, fill }
    })
    return clusters
  }

  static canHandle (order) {
    return order >= 2
  }
}

class YQuartiles extends Percentiles {
  constructor (clusters, order) {
    super()
    this.yClusters = getQuartiles(clusters, order)
  }

  getAxisTicks (values) {
    let clusters = this.yClusters.map((d, i) => {
      let label = d.label
      let x = '50%'
      let y = d.y
      let text = `${Math.round(d.data[1] * 100) / 100}`
      let anchor = 'middle'
      let verticalShift = '0.4em'
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

  static canHandle (order) {
    return order >= 4
  }
}

class PercentileFactory {
  constructor (xPercentiles, yPercentiles) {
    this.xPercentiles = xPercentiles
    this.yPercentiles = yPercentiles
  }

  _getXPercentile (clusters, xOrder) {
    for (var i = 0; i < this.xPercentiles.length; i++) {
      if (this.xPercentiles[i].canHandle(xOrder.length)) {
        return new (this.xPercentiles[i])(clusters, xOrder)
      }
    }
  }

  _getYPercentile (clusters, yOrder) {
    for (var i = 0; i < this.yPercentiles.length; i++) {
      if (this.yPercentiles[i].canHandle(yOrder.length)) {
        return new (this.yPercentiles[i])(clusters, yOrder)
      }
    }
  }
}

export class AxisRender {
  constructor (container, percentileFactory, builder) {
    this.container = container
    this.percentileFactory = percentileFactory || factoryWithRange()
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
    const xLabels = this._xPercentiles.getAxisTicks(this._getXLabels())
    if (xLabels.length > 0) {
      this._displayAxisValues(this._getXLabels(), xLabels)
    }
    const xEndPoints = getXEndPoints(this.clusters, this.xOrder)
    if (xEndPoints.length > 0) {
      this._displayXAxisLine(this._getXAxis(), xLabels)
    }
    this.container.selectXAxis('*').style('display', 'block')
  }

  _displayYAxis () {
    const yLabels = this._yPercentiles.getAxisTicks(this._getYLabels())
    if (yLabels.length > 0) {
      this._displayAxisValues(this._getYLabels(), yLabels)
    }
    const yEndPoints = getYEndPoints(this.clusters, this.yOrder)
    if (yEndPoints.length > 0) {
      this._displayYAxisLine(this._getYAxis(), yLabels)
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

  _displayAxisValues (values, ticks) {
    values.data(ticks).enter().append('text')
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

  _displayXAxisLine (values, ticks) {
    values = this.makePath(values, ticks)
    values.attr('d', (ep) => {
      return `M ${ep[0].x} ${AxisWidth} V 0 H ${ep[1].x} V 7`
    })
  }

  _displayYAxisLine (values, ticks) {
    values = this.makePath(values, ticks)
    values.attr('d', (ep) => {
      let yAxisWidth = this.container.getYAxisWidth()
      return `M ${yAxisWidth - 7} ${ep[0].y} H ${yAxisWidth} V ${ep[1].y} H ${yAxisWidth - 7}`
    })
  }

  makePath (values, ticks) {
    let endPoints = [[ticks[0], ticks[ticks.length - 1]]]
    return values.data(endPoints).enter().append('path')
      .classed('axis', true)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', '3')
      .merge(values)
  }
}

export function factoryWithQuartiles () {
  return new PercentileFactory([XQuartiles, Percentiles], [YQuartiles, Percentiles])
}

export function factoryWithRange () {
  return new PercentileFactory([XRange, Percentiles], [YRange, Percentiles])
}
