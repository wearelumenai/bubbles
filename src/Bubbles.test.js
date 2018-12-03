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

test('draw clusters', () => {
  let bub = getBubbles()
  let clusters = new NodeBuilder(Projection).getNodes(bub.container)
  bub.clusters = clusters
  bub._drawClusters()
  let circles = bub._getCircles()
  circles.each(function () {
    let circle = d3.select(this)
    assertCirdle(circle, clusters)
  })
  let labels = bub._getLabels()
  labels.each(function () {
    let label = d3.select(this)
    assertLabel(label, clusters)
  })
})

test('optimize layout', done => {
  let bub = getBubbles()
  let clustersBeforeCollision = applyOverlap(bub)
  setTimeout(() => {
    let clustersAfterCollision = bub.clusters
    expect(clustersAfterCollision[0].x).toBeCloseTo(clustersBeforeCollision[0].x, 1)
    expect(clustersAfterCollision[0].y).toBeCloseTo(clustersBeforeCollision[0].y, 1)
    expect(clustersAfterCollision[1].x).toBeCloseTo(clustersBeforeCollision[1].x, 1)
    expect(clustersAfterCollision[1].y).not.toBeCloseTo(clustersBeforeCollision[1].y, 1)
    expect(clustersAfterCollision[2].x).not.toBeCloseTo(clustersBeforeCollision[2].x, 1)
    expect(clustersAfterCollision[2].y).toBeCloseTo(clustersBeforeCollision[2].y, 1)
    done()
  }, 300)
})

test('move clusters', done => {
  let bub = getBubbles()
  let clustersBeforeMove = applyScramble(bub)
  applyOverlap(bub)
  setTimeout(() => {
    let clustersAfterMove = bub.clusters
    expect(clustersAfterMove[0].x).toBeCloseTo(clustersBeforeMove[0].x, 1)
    expect(clustersAfterMove[0].y).toBeCloseTo(clustersBeforeMove[0].y, 1)
    expect(clustersAfterMove[1].x).not.toBeCloseTo(clustersBeforeMove[1].x, 1)
    expect(clustersAfterMove[1].y).not.toBeCloseTo(clustersBeforeMove[1].y, 1)
    expect(clustersAfterMove[2].x).not.toBeCloseTo(clustersBeforeMove[2].x, 1)
    expect(clustersAfterMove[2].y).not.toBeCloseTo(clustersBeforeMove[2].y, 1)
    done()
  }, 300)
})

test('transition end', () => {
  let bub = getBubbles()
  let endReached = false
  bub._onLayoutMoved(fakeTransition(), fakeTransition(), () => { endReached = true })
  expect(endReached).toBe(true)
})

test('get clusters at position', () => {
  let bub = getBubbles()
  let projectionWithOverlap = makeOverlap()
  bub.clusters = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  let clusters = bub.getClustersAtPosition(800, 200)
  expect(clusters).toEqual([2, 1])
})

test('get infos', () => {
  let bub = getBubbles()
  let projectionWithOverlap = makeOverlap()
  bub.clusters = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  bub._displayInfo(800, 200)
  let info = bub._getInfo()
  expect(info.empty()).toBe(false)
  expect(info.style('display')).toBe('block')
})

test('no infos when no cluster', () => {
  let bub = getBubbles()
  let projectionWithOverlap = makeOverlap()
  bub.clusters = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  bub._displayInfo(150, 180)
  let info = bub._getInfo()
  expect(info.empty()).toBe(false)
  expect(info.style('display')).toBe('none')
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
  let clustersBeforeMove = new NodeBuilder(Projection).getNodes(bub.container)
  clustersBeforeMove = [clustersBeforeMove[0], clustersBeforeMove[2], clustersBeforeMove[1]]
  bub.clusters = clustersBeforeMove
  bub._applyFirst()
  return clustersBeforeMove
}

function applyOverlap (bub) {
  let projectionWithOverlap = makeOverlap()
  let clustersBeforeCollision = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  bub.apply(projectionWithOverlap)
  return clustersBeforeCollision
}

function makeOverlap () {
  let projectionWithOverlap = Projection.slice()
  projectionWithOverlap[1][1] = 10
  projectionWithOverlap[2][0] = 11
  return projectionWithOverlap
}

function assertCirdle (circle, clusters) {
  let i = parseAttr(circle, 'data-label')
  expect(parseAttr(circle, 'cx')).toBe(clusters[i].x)
  expect(parseAttr(circle, 'cy')).toBe(clusters[i].y)
  expect(parseAttr(circle, 'r')).toBe(clusters[i].radius)
  expect(circle.attr('fill')).toBe(clusters[i].color)
}

function assertLabel (label, clusters) {
  let i = parseInt(label.text())
  expect(parseAttr(label, 'x')).toBe(clusters[i].x)
  expect(parseAttr(label, 'y')).toBe(clusters[i].y)
}

function parseAttr (element, name) {
  return parseFloat(element.attr(name))
}

function getBubbles () {
  let document = new jsdom.JSDOM('<body><div id="bubble-chart"></div></body>').window.document
  let bub = bubbles.create('#bubble-chart', document)
  // Tweak because JSDOM do not implement getClientBoundingRect
  bub.container.boundingClientRect = Rect
  bub.container.scaleHelper = new ScaleHelper(Rect)
  return bub
}
