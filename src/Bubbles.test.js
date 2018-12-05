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
  bub.apply(Projection)
  const circles = bub.circleRender._getCircles()
  circles.each(function () {
    const circle = d3.select(this)
    assertCirdle(circle, bub.clusters)
  })
  const labels = bub.labelRender._getLabels()
  labels.each(function () {
    const label = d3.select(this)
    assertLabel(label, bub.clusters)
  })
})

test('optimize layout', done => {
  const bub = getBubbles()
  const clustersBeforeCollision = applyOverlap(bub)
  setTimeout(() => {
    const clustersAfterCollision = bub.clusters
    assertPlacement(clustersBeforeCollision, clustersAfterCollision)
    done()
  }, 300)
})

test('move clusters', done => {
  const bub = getBubbles()
  const clustersBeforeMove = applyScramble(bub)
  applyOverlap(bub)
  setTimeout(() => {
    const clustersAfterMove = bub.clusters
    assertPlacement(clustersBeforeMove, clustersAfterMove)
    done()
  }, 300)
})

test('transition end', () => {
  const bub = getBubbles()
  let endReached = false
  bub._onLayoutMoved(fakeTransition(), fakeTransition(), () => { endReached = true })
  expect(endReached).toBe(true)
})

test('two clusters at position', () => {
  const bub = getBubbles()
  const projectionWithOverlap = makeOverlap()
  bub.circleRender.clusters = new NodeBuilder(projectionWithOverlap, bub.container).getNodes()
  const clusters = bub.getClustersAtPosition(800, 200)
  expect(clusters).toEqual([2, 1])
})

test('no cluster at position', () => {
  const bub = getBubbles()
  const projectionWithOverlap = makeOverlap()
  bub.circleRender.clusters = new NodeBuilder(projectionWithOverlap, bub.container).getNodes()
  const clusters = bub.getClustersAtPosition(180, 180)
  expect(clusters).toEqual([])
})

test('get position with uninitialized clusters', () => {
  const bub = getBubbles()
  const clusters = bub.getClustersAtPosition(180, 180)
  expect(clusters).toEqual([])
})

test('resize', () => {
  const bub = getBubbles()
  bub.apply(Projection)
  bubbles.resize(bub)
  // because jsdom does not have getBoundingClientRect, chart is 0x0
  expect(bub.clusters[0].x).toBeCloseTo(0, 1)
  expect(bub.clusters[1].x).toBeCloseTo(0, 1)
  expect(bub.clusters[2].x).toBeCloseTo(0, 1)
})

function assertPlacement (clustersBefore, clustersAfter) {
  expect(clustersAfter[0].x).toBeCloseTo(clustersBefore[0].x, 1)
  expect(clustersAfter[0].y).toBeCloseTo(clustersBefore[0].y, 1)
  expect(clustersAfter[1].x).not.toBeCloseTo(clustersBefore[1].x, 1)
  expect(clustersAfter[1].y).not.toBeCloseTo(clustersBefore[1].y, 1)
  expect(clustersAfter[2].x).not.toBeCloseTo(clustersBefore[2].x, 1)
  expect(clustersAfter[2].y).not.toBeCloseTo(clustersBefore[2].y, 1)
}

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
  const scrampledProjection = [Projection[0], Projection[2], Projection[1]]
  bub.apply(scrampledProjection)
  return bub.clusters
}

function applyOverlap (bub) {
  const projectionWithOverlap = makeOverlap()
  const clustersBeforeCollision = new NodeBuilder(projectionWithOverlap, bub.container).getNodes()
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
  // Tweak because JSDOM do not implement getBoundingClientRect
  bub.container._chartBoundingRect = Rect
  bub.container.scaleHelper = new ScaleHelper(Rect)
  bub.axisRender.displayAxis = () => {} // TODO: separate render tests
  return bub
}
