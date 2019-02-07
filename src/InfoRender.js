export class InfoRender {
  constructor (container, getInfoText, builder) {
    this.container = container
    this.builder = builder
    this.getInfoText = getInfoText
    this.container.onMouse((x, y) => this._displayInfo(x, y), () => this._hideInfo())
    if (typeof builder !== 'undefined') {
      this.clusters = builder.getNodes()
    }
  }

  _displayInfo (x, y) {
    const info = this.container.getInfo()
    let [label] = this.builder.getNodesAtPosition(x, y)
    if (typeof label !== 'undefined') {
      const cluster = this.clusters[label]
      this._setText(cluster, info)
      this._setPosition(info, x, y)
    } else {
      this._hideInfo(info)
    }
  }

  _setText (cluster, info) {
    const infoText = this.getInfoText(cluster)
    info.text(infoText).style('white-space', 'pre')
  }

  _setPosition (info, x, y) {
    info.style('display', 'block')
    const boundingRect = info.node().getBoundingClientRect()
    const left = this.container.boundX({ left: x - boundingRect.width - 5, width: boundingRect.width })
    const top = this.container.boundY({ top: y - 5, height: boundingRect.height })
    info.style('left', `${left}px`).style('top', `${top}px`)
  }

  _hideInfo () {
    this.container.getInfo().style('display', 'none')
  }
}

export function simpleInfoText (cluster) {
  return `${cluster.info()}`
}

export function advancedInfoText (cluster) {
  return `${cluster.infoWithArea()}`
}
