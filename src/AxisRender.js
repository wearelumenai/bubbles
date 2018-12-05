export default class AxisRender {
  constructor (container) {
    this.container = container
  }

  apply (builder) {
    this.clusters = builder.getNodes()
    this.xClusters = this._getAxisClusters(builder.orderX())
    this.yClusters = this._getAxisClusters(builder.orderY())
  }

  hideAxis (builder) {
    this.container.selectXAxis('.value').style('display', 'none')
    this.container.selectYAxis('.value').style('display', 'none')
  }

  displayAxis () {
    this._displayXAxis()
    this._displayYAxis()
  }

  _displayXAxis () {
    this.container.selectXAxis('.value').style('display', 'block')
    let clusters = this.xClusters.map((d, i) => {
      let x = d.x + (i === 0 ? -1 : i === 4 ? 1 : 0) * d.radius
      let y = 0
      let text = `${Math.round(d.data[0] * 100) / 100}(${d.label})`
      let anchor = i === 0 ? 'start' : i === 4 ? 'end' : 'middle'
      let align = 'text-before-edge'
      let fill = i % 2 === 1 ? 'Blue' : (i === 2 ? 'MidnightBlue' : 'DeepSkyBlue')
      return { x, y, text, anchor, align, fill }
    })
    let values = this.container.selectXAxis('.value')
    this._collideXAxis(values, clusters)
    this._displayAxisValues(values, clusters)
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
  }

  _displayYAxis () {
    this.container.selectYAxis('.value').style('display', 'block')
    let clusters = this.yClusters.map((d, i) => {
      let x = '50%'
      let y = d.y + (i === 0 ? 1 : i === 4 ? -1 : 0) * d.radius
      let text = `${Math.round(d.data[1] * 100) / 100}(${d.label})`
      let anchor = 'middle'
      let align = i === 0 ? 'alphabetical' : i === 4 ? 'hanging' : 'central'
      let fill = i % 2 === 1 ? 'Blue' : (i === 2 ? 'MidnightBlue' : 'DeepSkyBlue')
      return { x, y, text, anchor, align, fill }
    })
    let values = this.container.selectYAxis('.value')
    this._collideYAxis(values, clusters)
    this._displayAxisValues(values, clusters)
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
  }

  _displayAxisValues (values, clusters) {
    values.data(clusters).enter().append('text').attr('class', 'value')
      .attr('text-anchor', d => d.anchor)
      .attr('fill', d => d.fill)
      .attr('alignment-baseline', d => d.align)
      .merge(values)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .text(d => d.text)
  }

  _getAxisClusters (xDistribution) {
    const xEff = xDistribution.length
    const xIdx = [ 0, Math.round(xEff / 4), Math.round(xEff / 2), Math.round(3 * xEff / 4), xEff - 1 ]
    return xIdx.map(i => this.clusters[xDistribution[i]])
  }
}
