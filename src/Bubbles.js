'use strict'

import * as d3 from 'd3'
import Container from './Container.js'
import NodeBuilder from './NodeBuilder.js'

// class Circles {
//   constructor (clusters) {
//     this.clusters = clusters
//   }
// }

class Bubbles {
  constructor (container) {
    this.container = container
    this.container.onMouse((info, x, y) => this._displayInfo(info, x, y), (info) => this._hideInfo(info))
    this._doApply = this._applyFirst
  }

  apply (projection) {
    this.projection = projection
    const builder = new NodeBuilder(projection)
    this.clusters = builder.getNodes(this.container)
    this.xClusters = this._getAxisClusters(builder.orderX())
    this.yClusters = this._getAxisClusters(builder.orderY())
    this._doApply()
  }

  _hideAxis (builder) {
    this.container._xAxisElement.style('display', 'none')
    this.container._yAxisElement.style('display', 'none')
  }

  _displayAxis () {
    this._displayXAxis()
    this._displayYAxis()
  }

  _displayXAxis () {
    this.container._xAxisElement.style('display', 'block')
    let clusters = this.xClusters.map((d, i) => {
      let x = d.x + (i === 0 ? -1 : i === 4 ? 1 : 0) * d.radius
      let y = 0
      let text = `${Math.round(d.data[0] * 100) / 100}(${d.label})`
      let anchor = i === 0 ? 'start' : i === 4 ? 'end' : 'middle'
      let align = 'text-before-edge'
      let fill = i % 2 === 1 ? 'Blue' : (i === 2 ? 'MidnightBlue' : 'DeepSkyBlue')
      return { x, y, text, anchor, align, fill }
    })
    let values = this.container._xAxisElement.select('.x-axis').selectAll('.value')
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
    this.container._yAxisElement.style('display', 'block')
    let clusters = this.yClusters.map((d, i) => {
      let x = '50%'
      let y = d.y + (i === 0 ? 1 : i === 4 ? -1 : 0) * d.radius
      let text = `${Math.round(d.data[1] * 100) / 100}(${d.label})`
      let anchor = 'middle'
      let align = i === 0 ? 'alphabetical' : i === 4 ? 'hanging' : 'central'
      let fill = i % 2 === 1 ? 'Blue' : (i === 2 ? 'MidnightBlue' : 'DeepSkyBlue')
      return { x, y, text, anchor, align, fill }
    })
    let values = this.container._yAxisElement.select('.y-axis').selectAll('.value')
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
    const xClusters = xDistribution.filter((_, i) => (i === 0 ||
      i === Math.round(xEff / 4) ||
      i === Math.round(xEff / 2) ||
      i === Math.round(3 * xEff / 4) ||
      i === xEff - 1)).map(i => this.clusters[i])
    return xClusters
  }

  getClustersAtPosition (x, y) {
    let found = []
    if (this.clusters) {
      const clustersAtPosition = this.clusters
        .filter(d => (Math.pow(x - d.x, 2) + Math.pow(y - d.y, 2)) < Math.pow(d.radius, 2))
      found = clustersAtPosition.sort((a, b) => a.radius - b.radius).map(d => d.label)
    }
    return found
  }

  _applyFirst () {
    this._drawClusters()
    this._optimizeLayout()
    this._doApply = this._applyOthers
  }

  _applyOthers () {
    this._collideSimulation.stop()
    this._moveLayout().then(this._optimizeLayout)
  }

  _optimizeLayout () {
    const collisionForce = this._getCollisionForce()
    const { xForce, yForce } = this._getPositionForces()
    this._collideSimulation = d3.forceSimulation()
      .nodes(this.clusters)
      .force('collide', collisionForce)
      .force('x', xForce)
      .force('y', yForce)
      .on('tick', () => this._drawClusters())
  }

  _getCollisionForce () {
    return d3.forceCollide(n => n.radius * 0.8).strength(0.4)
  }

  _getPositionForces () {
    const initialPosition = this.clusters.map(n => [n.x, n.y])
    const xForce = d3.forceX((_, i) => initialPosition[i][0]).strength(0.1)
    const yForce = d3.forceY((_, i) => initialPosition[i][1]).strength(0.1)
    return { xForce, yForce }
  }

  _drawClusters () {
    this._drawCircles()
    this._displayLabels()
    this._displayAxis()
  }

  _drawCircles () {
    this._circles = this._getCircles()
    const circles = this._circles.data(this.clusters)
    let newCircles = circles.enter()
      .append('circle')
      .style('pointer-events', 'none')
      .attr('class', 'cluster')
      .attr('data-label', n => n.label)
    this._updateCircles(newCircles.merge(circles))
  }

  _getCircles () {
    return this.container.selectSVG('.cluster')
  }

  _displayLabels () {
    this._labels = this._getLabels()
    const labels = this._labels.data(this.clusters)
    let newLabels = labels.enter()
      .append('text')
      .style('pointer-events', 'none')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .text(i => i.label)
    Bubbles._updateLabels(newLabels.merge(labels))
  }

  _getLabels () {
    return this.container.selectSVG('.label')
  }

  _displayInfo (info, x, y) {
    let [label] = this.getClustersAtPosition(x, y)
    if (typeof label !== 'undefined') {
      const cluster = this.clusters[label]
      const infoText = `${cluster.label}: x=${cluster.data[0]}; y=${cluster.data[1]}; a=${cluster.data[3]}`
      info.text(infoText)
      info.style('display', 'block')
      const boundingRect = info.node().getBoundingClientRect()
      const left = this.container.boundX({ left: x - 15, width: boundingRect.width })
      const top = this.container.boundY({ top: y, height: boundingRect.height })
      info.style('left', left + 'px')
      info.style('top', top + 'px')
    } else {
      this._hideInfo(info)
    }
  }

  _hideInfo (info) {
    info.style('display', 'none')
  }

  _moveLayout () {
    this._hideAxis()
    const circleTransition = this._moveCircles()
    const labelTransition = this._moveLabels()
    const then = (callback) => this._onLayoutMoved(circleTransition, labelTransition, callback)
    return { then }
  }

  _moveCircles () {
    const circles = this._circles.data(this.clusters)
    circles.exit().remove()
    const circleTransition = Bubbles._makeTransition(circles)
    this._updateCircles(circleTransition)
    return circleTransition
  }

  _moveLabels () {
    const labels = this._labels.data(this.clusters)
    labels.exit().remove()
    const labelTransition = Bubbles._makeTransition(labels)
    Bubbles._updateLabels(labelTransition)
    return labelTransition
  }

  static _makeTransition (circles) {
    return circles.transition().ease(d3.easeLinear).duration(800)
  }

  _onLayoutMoved (circleTransition, labelTransition, callback) {
    const thisCallback = callback.bind(this)
    let n = 0
    const onStart = () => ++n
    const onEnd = () => --n || thisCallback()
    circleTransition.each(onStart).on('end', onEnd)
    labelTransition.each(onStart).on('end', onEnd)
  }

  _updateCircles (circles) {
    circles
      .attr('r', n => n.radius)
      .attr('fill', n => n.color)
      .attr('cx', n => {
        n.x = this.container.boundX(n)
        return n.x
      })
      .attr('cy', n => {
        n.y = this.container.boundY(n)
        return n.y
      })
  }

  static _updateLabels (labels) {
    labels
      .attr('x', n => n.x)
      .attr('y', n => n.y)
  }
}

export function create (containerSelector, listeners, document) {
  const container = new Container(containerSelector, listeners, document)
  return new Bubbles(container)
}

export function resize (bubbles, document) {
  bubbles.container.resize()
  bubbles.apply(bubbles.projection)
}
