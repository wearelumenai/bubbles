export default class InfoRender {
  constructor (container, circleRender) {
    this.container = container
    this.circleRender = circleRender
    this.container.onMouse((info, x, y) => this._displayInfo(info, x, y), (info) => this._hideInfo(info))
  }

  apply (builder) {
    this.clusters = builder.getNodes()
  }

  _displayInfo (info, x, y) {
    let [label] = this.circleRender.getClustersAtPosition(x, y)
    if (typeof label !== 'undefined') {
      const cluster = this.clusters[label]
      const infoText = `${cluster.label}: x=${cluster.data[0]}; y=${cluster.data[1]}; a=${cluster.data[3]}`
      info.text(infoText)
      info.style('display', 'block')
      const boundingRect = info.node().getBoundingClientRect()
      const left = this.container.boundX({ left: x - 15, width: boundingRect.width })
      const top = this.container.boundY({ top: y, height: boundingRect.height })
      info.style('left', left + 'px')
      info.style('top', top + 'px')
    } else {
      this._hideInfo(info)
    }
  }

  _hideInfo (info) {
    info.style('display', 'none')
  }
}