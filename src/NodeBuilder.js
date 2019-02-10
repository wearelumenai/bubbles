import { XContainer, XYContainer } from './Container'

class NodeBuilder {
  constructor (projection, container, nodes) {
    this.container = container
    this.projection = projection
    const unzipped = this.projection[0].map((col, i) => this.projection.map(row => row[i]))
    this.x = unzipped[0]
    this.y = unzipped[1]
    this.colors = unzipped[2]
    this.areas = unzipped[3]
    this.nodes = nodes
  }

  getContainer () {
    return this.container
  }

  updateRadiusAndColor (builder) {
    const otherNodes = builder.getNodes()
    const thisNodes = this.getNodes()
    const updatedNodes = thisNodes.map((n, i) => {
      const radiusUpdate = {
        radius: otherNodes[i].radius,
        color: otherNodes[i].color,
        textColor: otherNodes[i].textColor,
        xTarget: otherNodes[i].x,
        yTarget: otherNodes[i].y,
        data: otherNodes[i].data
      }
      return Object.assign({}, n, radiusUpdate)
    })
    return builder._updateNodes(updatedNodes)
  }

  updateColors (builder) {
    const otherNodes = builder.getNodes()
    const thisNodes = this.getNodes()
    const updatedNodes = thisNodes.map((n, i) => {
      const colorUpdate = {
        color: otherNodes[i].color,
        textColor: otherNodes[i].textColor,
        xTarget: n.x,
        yTarget: n.y,
        data: otherNodes[i].data
      }
      return Object.assign({}, n, colorUpdate)
    })
    return builder._updateNodes(updatedNodes)
  }

  updateScales (builder) {
    const otherNodes = builder.getNodes()
    const thisNodes = this.getNodes()
    const heightRatio = builder.container.getShape().height / this.container.getShape().height
    const widthRatio = builder.container.getShape().width / this.container.getShape().width
    const updatedNodes = otherNodes.map((n, i) => {
      const updated = {
        x: thisNodes[i].x * widthRatio,
        y: thisNodes[i].y * heightRatio
      }
      return Object.assign({}, n, updated)
    })
    return builder._updateNodes(updatedNodes)
  }

  _updateNodes (updatedNodes) {
    const clone = Object.create(Object.getPrototypeOf(this))
    return Object.assign(clone, this, { nodes: updatedNodes })
  }

  getNodes () {
    if (typeof this.nodes === 'undefined') {
      this.nodes = this._makeNodes()
    }
    return this.nodes
  }

  sameRadius (builder) {
    if (builder.areas.length !== this.areas.length) {
      return false
    }
    for (let i = 0; i < this.areas.length; i++) {
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

  getNodesAtPosition (x, y) {
    let found = []
    const nodes = this.getNodes()
    if (nodes) {
      const nodesAtPosition = nodes
        .filter(d => (Math.pow(x - d.x, 2) + Math.pow(y - d.y, 2)) < Math.pow(d.radius, 2))
      found = nodesAtPosition.sort((a, b) => a.radius - b.radius).map(d => d.label)
    }
    return found
  }

  _makeNodes () {
  }

  static _order (array) {
    return array.map((_, i) => i).sort((a, b) => array[a] - array[b])
  }
}

export class XYNodeBuilder extends NodeBuilder {
  constructor (projection, container, nodes) {
    super(projection, XYNodeBuilder.Container(container), nodes)
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
    return this.projection.map((d, i) => (makeXYNode(d, i, scales)))
  }

  static Container (...args) {
    return new XYContainer(...args)
  }
}

export class XNodeBuilder extends NodeBuilder {
  constructor (projection, container, nodes) {
    super(projection, new XContainer(container), nodes)
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
    return this.projection.map((d, i) => makeXNode(d, i, scales, this.container.getShape()))
  }

  orderY () {
    return []
  }

  static Container (...args) {
    return new XContainer(...args)
  }
}

function makeXYNode (nodeData, nodeIndex, scales) {
  return {
    label: nodeIndex,
    x: scales.xScale(nodeIndex),
    xTarget: scales.xScale(nodeIndex),
    y: scales.yScale(nodeIndex),
    yTarget: scales.yScale(nodeIndex),
    radius: scales.radiusScale(nodeIndex),
    color: scales.colorScale(nodeIndex),
    textColor: scales.textColorScale(nodeIndex),
    data: nodeData,
    info: function () {
      return `x=${_round2(this.data[0])}\ny=${_round2(this.data[1])}`
    },
    infoWithArea: function () {
      return `${this.info()}\na=${this.data[3]}`
    }
  }
}

function makeXNode (nodeData, nodeIndex, scales, shape) {
  const node = makeXYNode(nodeData, nodeIndex, scales)
  node.fx = scales.xScale(nodeIndex)
  node.y = shape.height / 2
  node.yTarget = shape.height / 2
  node.vy = 1
  node.info = function () {
    return `${_round2(this.data[0])}`
  }
  return node
}

function _round2 (number) {
  return Math.round(number * 100) / 100
}
