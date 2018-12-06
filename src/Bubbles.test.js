const jsdom = require('jsdom')
const bubbles = require('./Bubbles')
const NodeBuilder = require('./NodeBuilder').default
const common = require('./common-test')

test('optimize layout', done => {
  const bub = getBubbles()
  const clustersBeforeCollision = applyProjection(bub, common.makeOverlap())
  setTimeout(() => {
    const clustersAfterCollision = bub.clusters
    assertPlacement(clustersBeforeCollision, clustersAfterCollision)
    done()
  }, 300)
})

test('move clusters', done => {
  const bub = getBubbles()
  const clustersBeforeMove = applyProjection(bub, common.makeScramble())
  applyProjection(bub, common.makeOverlap())
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

test('resize', () => {
  const bub = getBubbles()
  bub.apply(common.Projection)
  bubbles.resize(bub)
  // because jsdom does not have getBoundingClientRect, chart is 0x0
  expect(bub.clusters[0].x).toBeCloseTo(0, 1)
  expect(bub.clusters[1].x).toBeCloseTo(0, 1)
  expect(bub.clusters[2].x).toBeCloseTo(0, 1)
})

test('cluster position', () => {
  const bub = getBubbles()
  bub.apply(common.Projection)
  const pos0 = bub.getClustersAtPosition(bub.clusters[0].x, bub.clusters[0].y)
  expect(pos0).toEqual([0])
})

export function applyProjection (render, projection) {
  const builder = new NodeBuilder(projection, render.container)
  render.apply(projection)
  return builder.getNodes()
}

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

function getBubbles () {
  const document = new jsdom.JSDOM('<body><div id="bubble-chart"></div></body>').window.document
  const bub = bubbles.create('#bubble-chart', {}, document, common.Rect)
  bub.axisRender.displayAxis = () => {} // TODO: separate render tests
  return bub
}
