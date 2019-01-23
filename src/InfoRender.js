export class InfoRender {
  constructor (container, circleRender, builder) {
    this.container = container
    this.circleRender = circleRender
    this.container.onMouse((info, x, y) => this._displayInfo(info, x, y), (info) => this._hideInfo(info))
    if (typeof builder !== 'undefined') {
      this.clusters = builder.getNodes()
    }
  }

  _displayInfo (info, x, y) {
    let [label] = this.circleRender.getClustersAtPosition(x, y)
    if (typeof label !== 'undefined') {
      const cluster = this.clusters[label]
      this._setText(cluster, info)
      this._setPosition(info, x, y)
      info.style('display', 'block')
    } else {
      this._hideInfo(info)
    }
  }

  _setText (cluster, info) {
    const infoText = `${cluster.label}: x=${this._round2(cluster.data[0])}; ` +
      `y=${this._round2(cluster.data[1])}; ` +
      `a=${this._round2(cluster.data[3])}`
    info.text(infoText)
  }

  _setPosition (info, x, y) {
    const boundingRect = info.node().getBoundingClientRect()
    const left = this.container.boundX({ left: x - 40, width: boundingRect.width })
    const top = this.container.boundY({ top: y, height: boundingRect.height })
    info.style('left', left + 'px')
    info.style('top', top + 'px')
  }

  _round2 (number) {
    return Math.round(number * 100) / 100
  }

  _hideInfo (info) {
    info.style('display', 'none')
  }
}
