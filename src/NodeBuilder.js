import { XYContainer, XContainer } from './Container'

class NodeBuilder {
  constructor (projection, container) {
    this.container = container
    this.projection = projection
    const unzipped = this.projection[0].map((col, i) => this.projection.map(row => row[i]))
    this.x = unzipped[0]
    this.y = unzipped[1]
    this.colors = unzipped[2]
    this.areas = unzipped[3]

    this.nodes = this._makeNodes()
  }

  getContainer () {
    return this.container
  }

  getNodes () {
    return this.nodes
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
    super(projection, new XYContainer(container))
  }

  updateContainer (container) {
    return new XYNodeBuilder(this.projection, container)
  }

  _makeNodes () {
    const scales = this.container.getScales(this.x, this.y, this.areas, this.colors)
    return this.projection.map((d, i) => ({
      label: i,
      x: scales.xScale(i),
      y: scales.yScale(i),
      radius: scales.radiusScale(i),
      color: scales.colorScale(i),
      data: d,
      info: function () {
        return `x=${_round2(this.data[0])} y=${_round2(this.data[1])}`
      },
      infoWithArea: function () {
        return `${this.info()} a=${this.data[3]}`
      }
    }))
  }
}

export class XNodeBuilder extends NodeBuilder {
  constructor (projection, container) {
    super(projection, new XContainer(container))
  }

  updateContainer (container) {
    return new XNodeBuilder(this.projection, container)
  }

  _makeNodes () {
    const scales = this.container.getScales(this.x, this.y, this.areas, this.colors)
    return this.projection.map((d, i) => ({
      label: i,
      x: scales.xScale(i),
      fx: scales.xScale(i),
      y: this.container.getShape().height / 2,
      vy: 1,
      radius: scales.radiusScale(i),
      color: scales.colorScale(i),
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
}

function _round2 (number) {
  return Math.round(number * 100) / 100
}
