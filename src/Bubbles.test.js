const d3 = require('d3')
const jsdom = require('jsdom')
const bubbles = require('./Bubbles')
const ScaleHelper = require('./ScaleHelper').default
const NodeBuilder = require('./NodeBuilder').default

const Rect = { width: 957, height: 319 }
const Projection = [
  [3, 14, 3, 16],
  [12, 12, 8, 49],
  [7, 9, 12, 25]
]

test('draw nodes', () => {
  let bub = getBubbles()
  let nodes = new NodeBuilder(Projection).getNodes(bub.container)
  bub.nodes = nodes
  bub._drawNodes()
  let clusters = bub._getClusters()
  clusters.each(function () {
    let circle = d3.select(this)
    assertCircle(circle, nodes)
  })
  let labels = bub._getLabels()
  labels.each(function () {
    let label = d3.select(this)
    assertLabel(label, nodes)
  })
})

test('optimize layout', done => {
  let bub = getBubbles()
  let nodesBeforeCollision = applyOverlap(bub)
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
  let nodesBeforeMove = applyScramble(bub)
  applyOverlap(bub)
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

test('transition end', () => {
  let bub = getBubbles()
  let endReached = false
  bub._onLayoutMoved(fakeTransition(), fakeTransition(), () => { endReached = true })
  expect(endReached).toBe(true)
})

function fakeTransition () {
  let tr = {}
  let simulate = (cb) => {
    let i
    for (i = 0; i < 20; i++) {
      cb()
    }
    return tr
  }
  tr.each = (cb) => simulate(cb)
  tr.on = (ev, cb) => simulate(cb)
  return tr
}

function applyScramble (bub) {
  let nodesBeforeMove = new NodeBuilder(Projection).getNodes(bub.container)
  nodesBeforeMove = [nodesBeforeMove[0], nodesBeforeMove[2], nodesBeforeMove[1]]
  bub.nodes = nodesBeforeMove
  bub._applyFirst()
  return nodesBeforeMove
}

function applyOverlap (bub) {
  let projectionWithOverlap = moveAndOverlap()
  let nodesBeforeCollision = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  bub.apply(projectionWithOverlap)
  return nodesBeforeCollision
}

function assertCircle (circle, nodes) {
  let i = parseAttr(circle, 'data-label')
  expect(parseAttr(circle, 'cx')).toBe(nodes[i].x)
  expect(parseAttr(circle, 'cy')).toBe(nodes[i].y)
  expect(parseAttr(circle, 'r')).toBe(nodes[i].radius)
  expect(circle.attr('fill')).toBe(nodes[i].color)
}

function assertLabel (label, nodes) {
  let i = parseInt(label.text())
  expect(parseAttr(label, 'x')).toBe(nodes[i].x)
  expect(parseAttr(label, 'y')).toBe(nodes[i].y)
}

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
