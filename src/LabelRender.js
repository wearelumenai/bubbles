import * as d3 from 'd3'

export class LabelRender {
  constructor (container, builder) {
    this.container = container
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
      .text(i => i.label)
    LabelRender._updateLabels(newLabels.merge(labels))
  }

  moveLabels () {
    const labels = this._getLabels().data(this.clusters)
    labels.exit().remove()
    const labelTransition = LabelRender._makeTransition(labels)
    LabelRender._updateLabels(labelTransition)
    return labelTransition
  }

  _getLabels () {
    return this.container.selectChart('.label')
  }

  static _makeTransition (labels) {
    return labels.transition().ease(d3.easeLinear).duration(800)
  }

  static _updateLabels (labels) {
    labels
      .attr('x', n => n.x)
      .attr('y', n => n.y)
  }
}
