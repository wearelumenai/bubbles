export class CircleRender {
  constructor (container, builder) {
    this.container = container
    this.builder = builder
    this.container.onClick((x, y) => this._emphasis(x, y))
    if (typeof builder !== 'undefined') {
      this.clusters = builder.getNodes()
    }
  }

  drawCircles (transition, circles) {
    if (typeof circles === 'undefined') {
      circles = this._getCircles().data(this.clusters)
      circles.exit().remove()
    }
    let newCircles = circles.enter()
      .append('circle')
      .style('pointer-events', 'none')
      .classed('cluster', true)
      .style('opacity', 0)
      .attr('data-label', n => n.label)
      .attr('id', n => `cluster${n.label}`)
      .attr('r', n => n.radius)
      .attr('fill', n => n.color)
      .attr('cx', n => n.x)
      .attr('cy', n => n.y)
    CircleRender._updateCircles(transition(newCircles.merge(circles)))
  }

  moveCircles (transition) {
    const circles = this._getCircles().data(this.clusters)
    transition(circles.exit()).style('opacity', 0).remove()
    this.drawCircles(transition, circles)
  }

  _getCircles () {
    return this._getGroup().selectAll('.cluster')
  }

  _getGroup () {
    let group = this.container.selectChart('.circleRender').data([1])
    return group.enter().append('g').classed('circleRender', true).merge(group)
  }

  _emphasis (x, y) {
    if (this.clusters) {
      const [sel] = this.builder.getNodesAtPosition(x, y)
      const circles = this._getCircles()
      circles
        .classed('selected', d => typeof sel !== 'undefined' && d.label === sel)
        .classed('not-selected', d => typeof sel !== 'undefined' && d.label !== sel)
      let use = this._getGroup().selectAll('use').data([1])
      use.enter().append('use').merge(use).attr('xlink:href', `#cluster${sel}`)
    }
  }

  static _updateCircles (circles) {
    circles
      .each(n => {
        n.tick = n.tick ? n.tick + 1 : 1
      })
      .style('opacity', 1)
      .attr('r', n => n.radius)
      .attr('fill', n => n.color)
      .attr('cx', n => n.x)
      .attr('cy', n => n.y)
  }
}
