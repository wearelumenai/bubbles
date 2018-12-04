import * as d3 from 'd3'

export default class LabelRender {
  constructor (container) {
    this.container = container
  }

  apply (clusters) {
    this.clusters = clusters
  }

  displayLabels () {
    this._labels = this._getLabels()
    const labels = this._labels.data(this.clusters)
    let newLabels = labels.enter()
      .append('text')
      .style('pointer-events', 'none')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .text(i => i.label)
    LabelRender._updateLabels(newLabels.merge(labels))
  }

  moveLabels () {
    const labels = this._labels.data(this.clusters)
    labels.exit().remove()
    const labelTransition = LabelRender._makeTransition(labels)
    LabelRender._updateLabels(labelTransition)
    return labelTransition
  }

  _getLabels () {
    return this.container.selectSVG('.label')
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
