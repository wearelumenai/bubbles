import {XYContainer, XContainer} from './Container'

class NodeBuilder {
  constructor (projection, container) {
    this.container = container
    this.projection = projection
    const unzipped = this.projection[0].map((col, i) => this.projection.map(row => row[i]))
    this.x = unzipped[0]
    this.y = unzipped[1]
    this.colors = unzipped[2]
    this.areas = unzipped[3]
  }

  getContainer () {
    return this.container
  }

  updateRadiusAndColor (builder) {
    const otherNodes = builder.getNodes()
    const thisNodes = this.getNodes()
    for (let i = 0; i < thisNodes.length; i++) {
      thisNodes[i].radius = otherNodes[i].radius
      thisNodes[i].color = otherNodes[i].color
      thisNodes[i].textColor = otherNodes[i].textColor
      thisNodes[i].xTarget = otherNodes[i].x
      thisNodes[i].yTarget = otherNodes[i].y
      thisNodes[i].data = otherNodes[i].data
    }
    this.colors = builder.colors
    this.areas = builder.areas
    this.projection = builder.projection
    return this
  }

  updateColors (builder) {
    const otherNodes = builder.getNodes()
    const thisNodes = this.getNodes()
    for (let i = 0; i < thisNodes.length; i++) {
      thisNodes[i].color = otherNodes[i].color
      thisNodes[i].textColor = otherNodes[i].textColor
      thisNodes[i].xTarget = thisNodes[i].x
      thisNodes[i].yTarget = thisNodes[i].y
      thisNodes[i].data = otherNodes[i].data
    }
    this.colors = builder.colors
    this.projection = builder.projection
    return this
  }

  updateScales (builder) {
    const otherNodes = builder.getNodes()
    const thisNodes = this.getNodes()
    const heightRatio = builder.container.getShape().height / this.container.getShape().height
    const widthRatio = builder.container.getShape().width / this.container.getShape().width
    for (let i = 0; i < thisNodes.length; i++) {
      otherNodes[i].x = thisNodes[i].x * widthRatio
      otherNodes[i].y = thisNodes[i].y * heightRatio
    }
    return builder
  }

  getNodes () {
    if (typeof this.nodes === 'undefined') {
      this.nodes = this._makeNodes()
    }
    return this.nodes
  }

  sameRadius (builder) {
    if (builder.x.length !== this.x.length) {
      return false
    }
    for (let i = 0; i < this.x.length; i++) {
      if (builder.areas[i] !== this.areas[i]) {
        return false
      }
    }
    return true
  }

  orderX () {
    return NodeBuilder._order(this.x)
  }

  orderY () {
    return NodeBuilder._order(this.y)
  }

  static _order (array) {
    return array.map((_, i) => i).sort((a, b) => array[a] - array[b])
  }
}

export class XYNodeBuilder extends NodeBuilder {
  constructor (projection, container) {
    super(projection, new XYNodeBuilder.Container(container))
  }

  updateContainer (container) {
    return new XYNodeBuilder(this.projection, container)
  }

  samePosition (builder) {
    if (!(builder instanceof XYNodeBuilder) ||
      builder.x.length !== this.x.length) {
      return false
    }
    for (let i = 0; i < this.x.length; i++) {
      if (builder.x[i] !== this.x[i] || builder.y[i] !== this.y[i]) {
        return false
      }
    }
    return true
  }

  _makeNodes () {
    const scales = this.container.getScales(this.x, this.y, this.areas, this.colors)
    return this.projection.map((d, i) => ({
      label: i,
      x: scales.xScale(i),
      xTarget: scales.xScale(i),
      y: scales.yScale(i),
      yTarget: scales.yScale(i),
      radius: scales.radiusScale(i),
      color: scales.colorScale(i),
      textColor: scales.textColorScale(i),
      data: d,
      info: function () {
        return `x=${_round2(this.data[0])} y=${_round2(this.data[1])}`
      },
      infoWithArea: function () {
        return `${this.info()} a=${this.data[3]}`
      }
    }))
  }

  static get Container () {
    return XYContainer
  }
}

export class XNodeBuilder extends NodeBuilder {
  constructor (projection, container) {
    super(projection, new XNodeBuilder.Container(container))
  }

  updateContainer (container) {
    return new XNodeBuilder(this.projection, container)
  }

  samePosition (builder) {
    if (!(builder instanceof XNodeBuilder) ||
      builder.x.length !== this.x.length) {
      return false
    }
    for (let i = 0; i < this.x.length; i++) {
      if (builder.x[i] !== this.x[i]) {
        return false
      }
    }
    return true
  }

  _makeNodes () {
    const scales = this.container.getScales(this.x, this.y, this.areas, this.colors)
    return this.projection.map((d, i) => ({
      label: i,
      x: scales.xScale(i),
      xTarget: scales.xScale(i),
      fx: scales.xScale(i),
      y: this.container.getShape().height / 2,
      yTarget: this.container.getShape().height / 2,
      vy: 1,
      radius: scales.radiusScale(i),
      color: scales.colorScale(i),
      textColor: scales.textColorScale(i),
      data: d,
      info: function () {
        return `${_round2(this.data[0])}`
      },
      infoWithArea: function () {
        return `${this.info()} a=${this.data[3]}`
      }
    }))
  }

  orderY () {
    return []
  }

  static get Container () {
    return XContainer
  }
}

function _round2 (number) {
  return Math.round(number * 100) / 100
}
