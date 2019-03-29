export class LabelRender {
  constructor (container, builder) {
    this.container = container
    this.builder = builder
    this.container.onClick((x, y) => this._emphasis(x, y))
    if (typeof builder !== 'undefined') {
      this.clusters = builder.getNodes()
    }
  }

  displayLabels (transition, labels) {
    if (typeof labels === 'undefined') {
      labels = this._getLabels().data(this.clusters)
      labels.exit().remove()
    }
    let newLabels = labels.enter()
      .append('text')
      .style('pointer-events', 'none')
      .classed('label', true)
      .style('opacity', 0)
      .attr('data-label', n => n.label)
      .attr('id', n => `label${n.label}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.4em')
      .attr('x', n => n.x)
      .attr('y', n => n.y)
      .attr('fill', n => n.textColor)
      .text(i => i.label)
    LabelRender._updateLabels(transition(newLabels.merge(labels)))
  }

  moveLabels (transition) {
    const labels = this._getLabels().data(this.clusters)
    transition(labels.exit()).style('opacity', 0).remove()
    this.displayLabels(transition, labels)
  }

  _getLabels () {
    let group = this._getGroup()
    return group.selectAll('.label')
  }

  _getGroup () {
    let group = this.container.selectChart('.labelRender').data([1])
    group = group.enter().append('g').classed('labelRender', true).merge(group)
    return group
  }

  _emphasis (x, y) {
    if (this.clusters) {
      const [sel] = this.builder.getNodesAtPosition(x, y)
      const labels = this._getLabels()
      labels
        .classed('selected', d => typeof sel !== 'undefined' && d.label === sel)
        .classed('not-selected', d => typeof sel !== 'undefined' && d.label !== sel)
    }
  }

  static _updateLabels (labels) {
    labels
      .style('opacity', null)
      .attr('x', n => n.x)
      .attr('y', n => n.y)
      .attr('fill', n => n.textColor)
  }
}
