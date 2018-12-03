export default class NodeBuilder {
  constructor (projection) {
    this.projection = projection
    let unzipped = this.projection[0].map((col, i) => this.projection.map(row => row[i]))
    this.x = unzipped[0]
    this.y = unzipped[1]
    this.colors = unzipped[2]
    this.areas = unzipped[3]
  }

  getNodes (container) {
    let scales = container.getScales(this.x, this.y, this.areas, this.colors)

    return this.projection.map((d, i) => {
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
}
