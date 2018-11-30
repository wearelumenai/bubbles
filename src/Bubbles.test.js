const d3 = require('d3')
const jsdom = require('jsdom')
const bubbles = require('./Bubbles')
const ScaleHelper = require('./ScaleHelper').default
const NodeBuilder = require('./NodeBuilder').default

const Rect = { width: 957, height: 319 }
const Projection = [
  [3, 14, 16, 3],
  [12, 12, 49, 8],
  [7, 9, 25, 12]
]

test('draw nodes', () => {
  let bub = getBubbles()
  let nodes = new NodeBuilder(Projection).getNodes(bub.container)
  bub.nodes = nodes
  bub._drawNodes()
  let clusters = bub._getClusters()
  clusters.each(function () {
    let element = d3.select(this)
    let i = parseAttr(element, 'data-label')
    expect(parseAttr(element, 'cx')).toBe(nodes[i].x)
    expect(parseAttr(element, 'cy')).toBe(nodes[i].y)
    expect(parseAttr(element, 'r')).toBe(nodes[i].radius)
    expect(element.attr('fill')).toBe(nodes[i].color)
  })
})

test('optimize layout', done => {
  let bub = getBubbles()
  let projectionWithOverlap = moveAndOverlap()
  let nodesBeforeCollision = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  bub.apply(projectionWithOverlap)
  setTimeout(() => {
    let nodesAfterCollision = bub.nodes
    expect(nodesAfterCollision[0].x).toBeCloseTo(nodesBeforeCollision[0].x, 1)
    expect(nodesAfterCollision[0].y).toBeCloseTo(nodesBeforeCollision[0].y, 1)
    expect(nodesAfterCollision[1].x).toBeCloseTo(nodesBeforeCollision[1].x, 1)
    expect(nodesAfterCollision[1].y).not.toBeCloseTo(nodesBeforeCollision[1].y, 1)
    expect(nodesAfterCollision[2].x).not.toBeCloseTo(nodesBeforeCollision[2].x, 1)
    expect(nodesAfterCollision[2].y).toBeCloseTo(nodesBeforeCollision[2].y, 1)
    done()
  }, 300)
})

test('move clusters', done => {
  let bub = getBubbles()
  let nodesBeforeMove = new NodeBuilder(Projection).getNodes(bub.container)
  nodesBeforeMove = [nodesBeforeMove[0], nodesBeforeMove[2], nodesBeforeMove[1]]
  bub.nodes = nodesBeforeMove
  bub._applyFirst()
  let projectionWithOverlap = moveAndOverlap()
  bub.apply(projectionWithOverlap)
  setTimeout(() => {
    let nodesAfterMove = bub.nodes
    expect(nodesAfterMove[0].x).toBeCloseTo(nodesBeforeMove[0].x, 1)
    expect(nodesAfterMove[0].y).toBeCloseTo(nodesBeforeMove[0].y, 1)
    expect(nodesAfterMove[1].x).not.toBeCloseTo(nodesBeforeMove[1].x, 1)
    expect(nodesAfterMove[1].y).not.toBeCloseTo(nodesBeforeMove[1].y, 1)
    expect(nodesAfterMove[2].x).not.toBeCloseTo(nodesBeforeMove[2].x, 1)
    expect(nodesAfterMove[2].y).not.toBeCloseTo(nodesBeforeMove[2].y, 1)
    done()
  }, 300)
})

function parseAttr (element, name) {
  return parseFloat(element.attr(name))
}

function moveAndOverlap () {
  let projectionWithOverlap = Projection.slice()
  projectionWithOverlap[1][1] = 10
  projectionWithOverlap[2][0] = 11
  return projectionWithOverlap
}

function getBubbles () {
  let document = new jsdom.JSDOM('<body><div id="bubble-chart"></div></body>').window.document
  let bub = bubbles.create('#bubble-chart', document)
  // Tweak because JSDOM do not implement getClientBoundingRect
  bub.container.boundingClientRect = Rect
  bub.container.scaleHelper = new ScaleHelper(Rect)
  return bub
}
