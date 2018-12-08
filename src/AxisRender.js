function getQuartiles (clusters, orederedIndex) {
  const range = orederedIndex.length - 1
  const quartiles = [ 0, Math.round(range / 4), Math.round(range / 2), Math.round(3 * range / 4), range ]
  return quartiles.map(i => clusters[orederedIndex[i]])
}

class Quantiles {
  getAxisTicks (values) {
    return []
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
      let y = 0
      let text = `${Math.round(d.data[0] * 100) / 100}(${d.label})`
      let anchor = i === 0 ? 'start' : i === 4 ? 'end' : 'middle'
      let align = 'text-before-edge'
      let fill = i % 2 === 1 ? 'Blue' : (i === 2 ? 'MidnightBlue' : 'DeepSkyBlue')
      return { label, x, y, text, anchor, align, fill }
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
      let align = i === 0 ? 'alphabetical' : i === 4 ? 'hanging' : 'central'
      let fill = i % 2 === 1 ? 'Blue' : (i === 2 ? 'MidnightBlue' : 'DeepSkyBlue')
      return { label, x, y, text, anchor, align, fill }
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

class QuantileFactory {
  _getXQuantile (clusters, xOrder) {
    if (xOrder.length > 4) {
      return new XQuartiles(clusters, xOrder)
    } else {
      return new Quantiles()
    }
  }

  _getYQuantile (clusters, yOrder) {
    if (yOrder.length > 4) {
      return new YQuartiles(clusters, yOrder)
    } else {
      return new Quantiles()
    }
  }
}

export default class AxisRender {
  constructor (container, axisRender) {
    this.container = container
    if (typeof axisRender !== 'undefined') {
    }
  }

  updateContainer (container) {
    return new AxisRender(container, this)
  }

  apply (builder) {
    this.clusters = builder.getNodes()
    this.xOrder = builder.orderX()
    this.yOrder = builder.orderY()
    const quantileFactory = new QuantileFactory()
    this._xQuantiles = quantileFactory._getXQuantile(this.clusters, this.xOrder)
    this._yQuantiles = quantileFactory._getYQuantile(this.clusters, this.yOrder)
  }

  hideAxis (builder) {
    this._getXAxis().style('display', 'none')
    this._getYAxis().style('display', 'none')
  }

  displayAxis () {
    this._displayXAxis()
    this._displayYAxis()
  }

  _displayXAxis () {
    const xClusters = this._xQuantiles.getAxisTicks(this._getXAxis())
    this._displayAxisValues(this._getXAxis(), xClusters)
    this._getXAxis().style('display', 'block')
  }

  _displayYAxis () {
    const yClusters = this._yQuantiles.getAxisTicks(this._getYAxis())
    this._displayAxisValues(this._getYAxis(), yClusters)
    this._getYAxis().style('display', 'block')
  }

  _getXAxis () {
    return this.container.selectXAxis('.value')
  }

  _getYAxis () {
    return this.container.selectYAxis('.value')
  }

  _displayAxisValues (values, clusters) {
    values.data(clusters).enter().append('text')
      .attr('data-label', d => d.label)
      .attr('class', 'value')
      .attr('text-anchor', d => d.anchor)
      .attr('fill', d => d.fill)
      .attr('alignment-baseline', d => d.align)
      .merge(values)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .text(d => d.text)
  }
}
