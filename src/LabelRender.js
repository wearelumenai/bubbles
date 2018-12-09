import * as d3 from 'd3'

export default class LabelRender {
  constructor (container, builder, labelRender) {
    this.container = container
    if (typeof labelRender !== 'undefined') {
      this.clusters = labelRender.clusters
    }
    if (typeof builder !== 'undefined') {
      this._apply(builder)
    }
  }

  update (builder, container) {
    return new LabelRender(container, builder, this)
  }

  _apply (builder) {
    this.clusters = builder.getNodes()
  }

  displayLabels () {
    const labels = this._getLabels().data(this.clusters)
    let newLabels = labels.enter()
      .append('text')
      .style('pointer-events', 'none')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
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
