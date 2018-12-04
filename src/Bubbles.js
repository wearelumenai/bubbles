'use strict'

import * as d3 from 'd3'
import Container from './Container.js'
import NodeBuilder from './NodeBuilder.js'

class Bubbles {
  constructor (container) {
    this.container = container
    this.container.onMouse((info, x, y) => this._displayInfo(info, x, y), (info) => this._hideInfo(info))
    this._doApply = this._applyFirst
  }

  apply (projection, listeners) {
    this.clusters = new NodeBuilder(projection).getNodes(this.container)
    this.listeners = listeners
    this._applyListeners(this.container.containerElement)
    this._doApply()
  }

  _applyListeners (resource) {
    if (this.listeners) {
      Object.entries(this.listeners).forEach(
        ([event, handler]) => {
          resource = resource.on(event, handler)
        }
      )
    }
    return resource
  }

  getClustersAtPosition (x, y) {
    const clustersAtPosition = this.clusters
      .filter(d => (Math.pow(x - d.x, 2) + Math.pow(y - d.y, 2)) < Math.pow(d.radius, 2))
    return clustersAtPosition.sort((a, b) => a.radius - b.radius).map(d => d.label)
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
    let labels = this.getClustersAtPosition(x, y)
    if (labels.length > 0) {
      let cluster = this.clusters[labels[0]]
      let infoText = `${cluster.label}: x=${cluster.data[0]}; y=${cluster.data[1]}; a=${cluster.data[3]}`
      info.text(infoText)
      info.style('display', 'block')
      info.style('left', (x + 15) + 'px')
      info.style('top', (y + 5) + 'px')
    } else {
      this._hideInfo(info)
    }
  }

  _hideInfo (info) {
    info.style('display', 'none')
  }

  _moveLayout () {
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

export function create (containerSelector, document) {
  const container = new Container(containerSelector, document)
  return new Bubbles(container)
}
