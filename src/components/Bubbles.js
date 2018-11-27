'use strict'

import * as d3 from 'd3'
import * as container from './Container.js'

class Bubbles {
  constructor (containerSelector) {
    this.container = container.create(containerSelector)
    this._doApply = this._applyFirst
  }

  _applyFirst () {
    this._optimizeLayout()
    this._doApply = this._applyOthers
  }

  _applyOthers () {
    this._collideSimulation.stop()
    this._moveLayout().then(this._optimizeLayout)
  }

  apply (projection) {
    this.nodes = this.container.getNodes(projection)
    this._doApply()
  }

  _optimizeLayout () {
    let collisionForce = d3.forceCollide(n => n.radius)
    this._collideSimulation = d3.forceSimulation()
      .nodes(this.nodes)
      .force('collide', collisionForce)
      .on('tick', () => this._drawNodes())
  }

  _drawNodes () {
    this._drawCircles()
    this._displayLabels()
  }

  _drawCircles () {
    this._clusters = this.container.selectAll('.cluster')
    let clusterNodes = this._clusters.data(this.nodes)
    clusterNodes.enter()
      .append('circle')
      .attr('class', 'cluster')
      .attr('data-label', n => n.label)
      .attr('r', n => n.radius)
    this._updateClusterNodes(clusterNodes)
  }

  _displayLabels () {
    this._labels = this.container.selectAll('.label')
    let labelNodes = this._labels.data(this.nodes)
    labelNodes.enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .text(i => i.label)
    Bubbles._updateLabelNodes(labelNodes)
  }

  _moveLayout () {
    let clusterTransition = this._moveCircles()
    let labelTransition = this._moveLabels()
    let then = (callback) => this._onLayoutMoved(clusterTransition, labelTransition, callback)
    return {then}
  }

  _moveCircles () {
    let clusterNodes = this._clusters.data(this.nodes)
    clusterNodes.exit().remove()
    let clusterTransitions = Bubbles._makeTransition(clusterNodes)
    this._updateClusterNodes(clusterTransitions)
    return clusterTransitions
  }

  _moveLabels () {
    let labelNodes = this._labels.data(this.nodes)
    labelNodes.exit().remove()
    let labelTransition = Bubbles._makeTransition(labelNodes)
    Bubbles._updateLabelNodes(labelTransition)
    return labelTransition
  }

  static _makeTransition (clusters) {
    return clusters.transition().ease(d3.easeLinear).duration(800)
  }

  _onLayoutMoved (clusterTransition, labelTransition, callback) {
    let thisCallback = callback.bind(this)
    let n = 0
    let onStart = () => ++n
    let onEnd = () => --n || thisCallback()
    clusterTransition.each(onStart).on('end', onEnd)
    labelTransition.each(onStart).on('end', onEnd)
  }

  _updateClusterNodes (clusterNodes) {
    clusterNodes
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

export function create (container) {
  return new Bubbles(container)
}
