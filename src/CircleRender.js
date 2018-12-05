import * as d3 from 'd3'

const progressiveTimeLine = [10, 290]

export default class CircleRender {
  constructor (container) {
    this.container = container
  }

  apply (builder) {
    this.clusters = builder.getNodes()
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

  drawCircles () {
    this._circles = this._getCircles()
    const circles = this._circles.data(this.clusters)
    let newCircles = circles.enter()
      .append('circle')
      .style('pointer-events', 'none')
      .attr('class', 'cluster')
      .attr('data-label', n => n.label)
    this._updateCircles(newCircles.merge(circles))
  }

  moveCircles () {
    const circles = this._circles.data(this.clusters)
    circles.exit().remove()
    const circleTransition = CircleRender._makeTransition(circles)
    this._updateCircles(circleTransition)
    return circleTransition
  }

  _getCircles () {
    return this.container.selectChart('.cluster')
  }

  static _makeTransition (circles) {
    return circles.transition().ease(d3.easeLinear).duration(800)
  }

  _updateCircles (circles) {
    circles
      .each(n => {
        n.tick = n.tick ? n.tick + 1 : 1
      })
      .attr('r', n => n.radius)
      .attr('fill', n => n.color)
      .attr('cx', n => {
        n.x = this._progressiveBound(n.x, this.container.boundX(n), n.tick, progressiveTimeLine)
        return n.x
      })
      .attr('cy', n => {
        n.y = this._progressiveBound(n.y, this.container.boundY(n), n.tick, progressiveTimeLine)
        return n.y
      })
  }

  _progressiveBound (current, bound, tick, [t0, t1]) {
    if (tick > t1) {
      return bound
    } else if (tick > t0) {
      return current + (bound - current) / (t1 - t0) * (tick - t0)
    } else {
      return current
    }
  }
}