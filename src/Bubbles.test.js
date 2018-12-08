const bubbles = require('./Bubbles')
const common = require('./common-test')
const apply = require('./apply-test').apply

test('optimize layout', done => {
  const chart = getBubbles()
  const start = apply(chart, common.makeOverlap())
  setTimeout(() => {
    const clustersAfterCollision = start.updatedChart.clusters
    assertPlacement(start.nodes, clustersAfterCollision)
    done()
  }, 300)
})

test('move clusters', done => {
  const chart = getBubbles()
  const start = apply(chart, common.makeScramble())
  const move = apply(start.updatedChart, common.makeOverlap())
  setTimeout(() => {
    assertPlacement(start.nodes, move.updatedChart.clusters)
    done()
  }, 300)
})

test('transition end', () => {
  const chart = getBubbles()
  let endReached = false
  chart._onLayoutMoved(fakeTransition(), fakeTransition(), () => { endReached = true })
  expect(endReached).toBe(true)
})

test('resize', () => {
  const chart = getBubbles()
  bubbles.resize(chart)
  const start = apply(chart, common.Projection)
  const resized = bubbles.resize(start.updatedChart)
  // because jsdom does not have getBoundingClientRect, chart is 0x0
  expect(resized.clusters[0].x).toBeCloseTo(0, 1)
  expect(resized.clusters[1].x).toBeCloseTo(0, 1)
  expect(resized.clusters[2].x).toBeCloseTo(0, 1)
})

test('cluster position', () => {
  const chart = getBubbles()
  const start = apply(chart, common.Projection)
  const x = start.updatedChart.clusters[0].x
  const y = start.updatedChart.clusters[0].y
  const pos0 = start.updatedChart.getClustersAtPosition(x, y)
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
