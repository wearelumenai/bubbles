import * as d3 from 'd3'

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
    return this.container.selectSVG('.cluster')
  }

  static _makeTransition (circles) {
    return circles.transition().ease(d3.easeLinear).duration(800)
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
}
