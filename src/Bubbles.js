'use strict'

import * as d3 from 'd3'
import Container from './Container.js'
import NodeBuilder from './NodeBuilder.js'

class Bubbles {
  constructor (container) {
    this.container = container
    this._doApply = this._applyFirst
  }

  apply (projection) {
    this.clusters = new NodeBuilder(projection).getNodes(this.container)
    this._doApply()
  }

  getClustersAtPosition (x, y) {
    let clustersAtPosition = this.clusters
      .filter(d => Math.pow(x - d.x, 2) + Math.pow(y - d.y, 2) < Math.pow(d.radius, 2))
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
    let collisionForce = this._getCollisionForce()
    let { xForce, yForce } = this._getPositionForces()
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
    let initialPosition = this.clusters.map(n => [n.x, n.y])
    let xForce = d3.forceX((_, i) => initialPosition[i][0]).strength(0.1)
    let yForce = d3.forceY((_, i) => initialPosition[i][1]).strength(0.1)
    return { xForce, yForce }
  }

  _drawClusters () {
    this._drawCircles()
    this._displayLabels()
  }

  _drawCircles () {
    this._circles = this._getCircles()
    let circles = this._circles.data(this.clusters)
    let newCircles = circles.enter()
      .append('circle')
      .attr('class', 'cluster')
      .attr('data-label', n => n.label)
    this._updateCircles(newCircles.merge(circles))
  }

  _getCircles () {
    return this.container.selectAll('.cluster')
  }

  _displayLabels () {
    this._labels = this._getLabels()
    let labelNodes = this._labels.data(this.clusters)
    let newLabelNodes = labelNodes.enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .text(i => i.label)
    Bubbles._updateLabelNodes(newLabelNodes.merge(labelNodes))
  }

  _getLabels () {
    return this.container.selectAll('.label')
  }

  _moveLayout () {
    let circleTransition = this._moveCircles()
    let labelTransition = this._moveLabels()
    let then = (callback) => this._onLayoutMoved(circleTransition, labelTransition, callback)
    return { then }
  }

  _moveCircles () {
    let circles = this._circles.data(this.clusters)
    circles.exit().remove()
    let circleTransition = Bubbles._makeTransition(circles)
    this._updateCircles(circleTransition)
    return circleTransition
  }

  _moveLabels () {
    let labelNodes = this._labels.data(this.clusters)
    labelNodes.exit().remove()
    let labelTransition = Bubbles._makeTransition(labelNodes)
    Bubbles._updateLabelNodes(labelTransition)
    return labelTransition
  }

  static _makeTransition (circles) {
    return circles.transition().ease(d3.easeLinear).duration(800)
  }

  _onLayoutMoved (circleTransition, labelTransition, callback) {
    let thisCallback = callback.bind(this)
    let n = 0
    let onStart = () => ++n
    let onEnd = () => --n || thisCallback()
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

  static _updateLabelNodes (labelNodes) {
    labelNodes
      .attr('x', n => n.x)
      .attr('y', n => n.y)
  }
}

export function create (containerSelector, document) {
  let container = new Container(containerSelector, document)
  return new Bubbles(container)
}
