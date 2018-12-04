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
  const bub = getBubbles()
  const clusters = new NodeBuilder(Projection).getNodes(bub.container)
  bub.clusters = clusters
  bub._drawClusters()
  const circles = bub._getCircles()
  circles.each(function () {
    const circle = d3.select(this)
    assertCirdle(circle, clusters)
  })
  const labels = bub._getLabels()
  labels.each(function () {
    const label = d3.select(this)
    assertLabel(label, clusters)
  })
})

test('optimize layout', done => {
  const bub = getBubbles()
  const clustersBeforeCollision = applyOverlap(bub)
  setTimeout(() => {
    const clustersAfterCollision = bub.clusters
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
  const bub = getBubbles()
  const clustersBeforeMove = applyScramble(bub)
  applyOverlap(bub)
  setTimeout(() => {
    const clustersAfterMove = bub.clusters
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
  const bub = getBubbles()
  let endReached = false
  bub._onLayoutMoved(fakeTransition(), fakeTransition(), () => { endReached = true })
  expect(endReached).toBe(true)
})

test('get clusters at position', () => {
  const bub = getBubbles()
  const projectionWithOverlap = makeOverlap()
  bub.clusters = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  const clusters = bub.getClustersAtPosition(800, 200)
  expect(clusters).toEqual([2, 1])
})

test('display infos', () => {
  const bub = getBubbles()
  const projectionWithOverlap = makeOverlap()
  bub.clusters = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  const info = bub.container.getInfo()
  bub._displayInfo(info, 800, 200)
  expect(info.empty()).toBe(false)
  expect(info.style('display')).toBe('block')
})

test('hide info when no cluster', () => {
  const bub = getBubbles()
  const projectionWithOverlap = makeOverlap()
  bub.clusters = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  const info = bub.container.getInfo()
  bub._displayInfo(info, 150, 180)
  expect(info.empty()).toBe(false)
  expect(info.style('display')).toBe('none')
})

test('display infos on mouse move', done => {
  const bub = getBubbles()
  const projectionWithOverlap = makeOverlap()
  bub.clusters = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  bub.container.getMousePosition = () => [800, 200]
  bub.container.containerElement.dispatch('mousemove')
  done()
  const info = bub.container.getInfo()
  expect(info.style('display')).toBe('block')
})

test('hide infos on mouse out', done => {
  const bub = getBubbles()
  const projectionWithOverlap = makeOverlap()
  bub.clusters = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  bub.container.containerElement.dispatch('mouseout')
  done()
  const info = bub.container.getInfo()
  expect(info.style('display')).toBe('none')
})

function fakeTransition () {
  const tr = {}
  const simulate = (cb) => {
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
  const projectionWithOverlap = makeOverlap()
  const clustersBeforeCollision = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  bub.apply(projectionWithOverlap)
  return clustersBeforeCollision
}

function makeOverlap () {
  const projectionWithOverlap = Projection.slice()
  projectionWithOverlap[1][1] = 10
  projectionWithOverlap[2][0] = 11
  return projectionWithOverlap
}

function assertCirdle (circle, clusters) {
  const i = parseAttr(circle, 'data-label')
  expect(parseAttr(circle, 'cx')).toBe(clusters[i].x)
  expect(parseAttr(circle, 'cy')).toBe(clusters[i].y)
  expect(parseAttr(circle, 'r')).toBe(clusters[i].radius)
  expect(circle.attr('fill')).toBe(clusters[i].color)
}

function assertLabel (label, clusters) {
  const i = parseInt(label.text())
  expect(parseAttr(label, 'x')).toBe(clusters[i].x)
  expect(parseAttr(label, 'y')).toBe(clusters[i].y)
}

function parseAttr (element, name) {
  return parseFloat(element.attr(name))
}

function getBubbles () {
  const document = new jsdom.JSDOM('<body><div id="bubble-chart"></div></body>').window.document
  const bub = bubbles.create('#bubble-chart', {}, document)
  // Tweak because JSDOM do not implement getClientBoundingRect
  bub.container.boundingClientRect = Rect
  bub.container.scaleHelper = new ScaleHelper(Rect)
  return bub
}
