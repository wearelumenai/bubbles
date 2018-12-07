const bubbles = require('./Bubbles')
const common = require('./common-test')
const apply = require('./apply-test').apply

test('optimize layout', done => {
  const bub = getBubbles()
  const clustersBeforeCollision = apply(bub, common.makeOverlap())
  setTimeout(() => {
    const clustersAfterCollision = bub.clusters
    assertPlacement(clustersBeforeCollision, clustersAfterCollision)
    done()
  }, 300)
})

test('move clusters', done => {
  const bub = getBubbles()
  const clustersBeforeMove = apply(bub, common.makeScramble())
  apply(bub, common.makeOverlap())
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
  apply(bub, common.Projection)
  const newBub = bubbles.resize(bub)
  // because jsdom does not have getBoundingClientRect, chart is 0x0
  expect(newBub.clusters[0].x).toBeCloseTo(0, 1)
  expect(newBub.clusters[1].x).toBeCloseTo(0, 1)
  expect(newBub.clusters[2].x).toBeCloseTo(0, 1)
})

test('cluster position', () => {
  const bub = getBubbles()
  apply(bub, common.Projection)
  const pos0 = bub.getClustersAtPosition(bub.clusters[0].x, bub.clusters[0].y)
  expect(pos0).toEqual([0])
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

function getBubbles () {
  return bubbles.create('#bubble-chart', {}, common.document, common.Rect)
}
