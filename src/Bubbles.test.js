import { XYNodeBuilder } from './NodeBuilder'

const bubbles = require('./Bubbles')
const common = require('./common-test')
const update = require('./apply-test').update

test('optimizeThenDraw layout', done => {
  const chart = getBubbles()
  const start = update(chart, common.makeOverlap())
  setTimeout(() => {
    const collided = start.updated.clusters
    assertPlacement(start.nodes, collided)
    done()
  }, 300)
})

test('move clusters', done => {
  const chart = getBubbles()
  const start = update(chart, common.makeScramble())
  update(chart, common.makeOverlap())
  setTimeout(() => {
    const moved = start.updated.clusters
    assertPlacement(start.nodes, moved)
    done()
  }, 300)
})

test('resize', () => {
  const chart = getBubbles()
  bubbles.resize(chart)
  const start = update(chart, common.Projection)
  const resized = bubbles.resize(start.updated)
  expect(resized).not.toBe(chart)
})

test('cluster position', () => {
  const chart = getBubbles()
  const start = update(chart, common.Projection)
  const x = start.updated.clusters[0].x
  const y = start.updated.clusters[0].y
  const pos0 = start.updated.getClustersAtPosition(x, y)
  expect(pos0).toEqual([0])
})

test('apply', () => {
  const chart = getBubbles()
  const updated = bubbles.update(chart, XYNodeBuilder, common.Projection)
  expect(updated).not.toBe(chart)
})

function assertPlacement (clustersBefore, clustersAfter) {
  expect(clustersAfter[0].x).toBeCloseTo(clustersBefore[0].x, -0.7)
  expect(clustersAfter[0].y).toBeCloseTo(clustersBefore[0].y, -0.7)
  expect(
    clustersAfter[1].x !== clustersBefore[1].x ||
    clustersAfter[1].y !== clustersBefore[1].y ||
    clustersAfter[2].x !== clustersBefore[2].x ||
    clustersAfter[2].y !== clustersBefore[2].y
  ).toBeTruthy()
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
  return bubbles.create('#bubble-chart', XYNodeBuilder, {}, common.document)
}
