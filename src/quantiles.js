export const AxisWidth = 7

export function factoryWithQuartiles () {
  return new PercentileFactory([XQuartiles, Percentiles], [YQuartiles, Percentiles])
}

export function factoryWithRange () {
  return new PercentileFactory([XRange, Percentiles], [YRange, Percentiles])
}

export function getXEndPoints (clusters, orderedIndexes) {
  return getRange(clusters, orderedIndexes).map((d) => {
    return d.x
  })
}

export function getYEndPoints (clusters, orderedIndexes) {
  return getRange(clusters, orderedIndexes).map((d) => {
    return d.y
  })
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

class Percentiles {
  getAxisTicks (values) {
    return []
  }

  static canHandle () {
    return true
  }
}

class XRange extends Percentiles {
  constructor (clusters, order) {
    super()
    this.xClusters = getRange(clusters, order)
  }

  getAxisTicks (textLengths) {
    return this.xClusters.map((d, i) => {
      let label = d.label
      let x = d.x + d.radius * (i === 0 ? -1 : 1)
      let y = '1em'
      let text = `${Math.round(d.data[0] * 100) / 100}`
      let anchor = i === 0 ? 'start' : 'end'
      let horizontalShift = 0
      let verticalShift = AxisWidth
      let fill = 'DeepSkyBlue'
      return { label, x, y, text, anchor, horizontalShift, verticalShift, fill }
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

  getAxisTicks (textLengths) {
    let clusters = this.xClusters.map((d, i) => {
      let label = d.label
      let x = d.x * (i === 0 ? 1 : (i === 4 ? -1 : 0))
      let y = '1em'
      let text = `${Math.round(d.data[0] * 100) / 100}`
      let anchor = i === 0 ? 'start' : i === 4 ? 'end' : 'middle'
      let horizontalShift = 0
      let verticalShift = AxisWidth
      let fill = i % 2 === 1 ? 'Blue' : (i === 2 ? 'MidnightBlue' : 'DeepSkyBlue')
      return { label, x, y, text, anchor, horizontalShift, verticalShift, fill }
    })
    return XQuartiles._collideXAxis(textLengths, clusters)
  }

  static _collideXAxis (textLengths, clusters) {
    if (textLengths.length > 0) {
      if (clusters[2].x - textLengths[2] / 2 < clusters[0].x + textLengths[0]) {
        clusters[2].x = clusters[0].x + textLengths[0] + textLengths[2] / 2
      }
      if (clusters[2].x + textLengths[2] / 2 > clusters[4].x) {
        clusters[2].x = clusters[4].x - textLengths[2] / 2
      }
      if (clusters[1].x + textLengths[1] / 2 > clusters[2].x - textLengths[2] / 2) {
        clusters[1].y = '2em'
      }
      if (clusters[1].x - textLengths[1] / 2 < clusters[0].x + textLengths[0]) {
        clusters[1].y = '2em'
      }
      if (clusters[3].x - textLengths[3] / 2 < clusters[2].x + textLengths[2] / 2) {
        clusters[3].y = '2em'
      }
      if (clusters[3].x + textLengths[3] / 2 > clusters[4].x - textLengths[4]) {
        clusters[3].y = '2em'
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

  getAxisTicks (textHeights) {
    return this.yClusters.map((d, i) => {
      let label = d.label
      let x = '100%'
      let y = d.y + d.radius * (i === 0 ? 1 : -1)
      let text = `${Math.round(d.data[1] * 100) / 100}`
      let anchor = 'end'
      let horizontalShift = -AxisWidth
      let verticalShift = i === 0 ? '-0.2em' : '0.8em'
      let fill = 'DeepSkyBlue'
      return { label, x, y, text, anchor, horizontalShift, verticalShift, fill }
    })
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

  getAxisTicks (textHeights) {
    let clusters = this.yClusters.map((d, i) => {
      let label = d.label
      let x = '100%'
      let y = d.y + d.radius * (i === 0 ? 1 : (i === 4 ? -1 : 0))
      let text = `${Math.round(d.data[1] * 100) / 100}`
      let anchor = 'end'
      let horizontalShift = -AxisWidth
      let verticalShift = '0.4em'
      let fill = i % 2 === 1 ? 'Blue' : (i === 2 ? 'MidnightBlue' : 'DeepSkyBlue')
      return { label, x, y, text, anchor, horizontalShift, verticalShift, fill }
    })
    return YQuartiles._collideYAxis(textHeights, clusters)
  }

  static _collideYAxis (textHeights, clusters) {
    const offset = Math.max(...textHeights)
    for (let i = 0; i < 5; i++) {
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
    }
    return clusters
  }

  static canHandle (order) {
    return order >= 4
  }
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
