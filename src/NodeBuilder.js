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
      data: d
    }))
  }
}

export class XNodeBuilder extends NodeBuilder {
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
      data: d
    }))
  }

  orderY () {
    return []
  }
}
