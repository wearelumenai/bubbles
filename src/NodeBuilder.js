export class XYNodeBuilder {
  constructor (projection, container) {
    this.container = container
    this.projection = projection
    const unzipped = this.projection[0].map((col, i) => this.projection.map(row => row[i]))
    this.x = unzipped[0]
    this.y = unzipped[1]
    this.colors = unzipped[2]
    this.areas = unzipped[3]

    return this._makeNodes()
  }

  updateContainer (container) {
    return new XYNodeBuilder(this.projection, container)
  }

  _makeNodes () {
    const scales = this.container.getScales(this.x, this.y, this.areas, this.colors)
    this.nodes = this.projection.map((d, i) => {
      return {
        label: i,
        x: scales.xScale(i),
        y: scales.yScale(i),
        radius: scales.radiusScale(i),
        color: scales.colorScale(i),
        data: d
      }
    })
  }

  getNodes () {
    return this.nodes
  }

  orderX () {
    return XYNodeBuilder._order(this.x)
  }

  orderY () {
    return XYNodeBuilder._order(this.y)
  }

  static _order (array) {
    return array.map((_, i) => i).sort((a, b) => array[a] - array[b])
  }
}
