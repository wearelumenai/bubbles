export class LabelRender {
  constructor (container, circleRender, builder) {
    this.container = container
    this.circleRender = circleRender
    this.container.onClick((x, y) => this._emphasis(x, y))
    if (typeof builder !== 'undefined') {
      this.clusters = builder.getNodes()
    }
  }

  displayLabels () {
    const labels = this._getLabels().data(this.clusters)
    let newLabels = labels.enter()
      .append('text')
      .style('pointer-events', 'none')
      .classed('label', true)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.4em')
      .attr('data-label', n => n.label)
      .attr('id', n => `label${n.label}`)
      .text(i => i.label)
    LabelRender._updateLabels(newLabels.merge(labels))
    labels.exit().remove()
  }

  moveLabels (transition) {
    const labels = this._getLabels().data(this.clusters)
    labels.exit().remove()
    const labelTransition = transition(labels)
    LabelRender._updateLabels(labelTransition)
  }

  _getLabels () {
    let group = this.container.selectChart('.labelRender').data([1])
    group = group.enter().append('g').classed('labelRender', true).merge(group)
    return group.selectAll('.label')
  }

  _emphasis (x, y) {
    if (this.clusters) {
      const [sel] = this.circleRender.getClustersAtPosition(x, y)
      const labels = this._getLabels()
      labels
        .classed('selected', d => typeof sel !== 'undefined' && d.label === sel)
        .classed('not-selected', d => typeof sel !== 'undefined' && d.label !== sel)
    }
  }

  static _updateLabels (labels) {
    labels
      .attr('x', n => n.x)
      .attr('y', n => n.y)
      .attr('fill', n => n.textColor)
  }
}
