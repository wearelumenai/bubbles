const d3 = require('d3')
const Container = require('./Container').default
const LabelRender = require('./LabelRender').default
const common = require('./common-test')
const apply = require('./apply-test').apply

test('draw clusters', () => {
  const labelRender = getLabelRender()
  const labelsAtFixedPosition = apply(labelRender, common.Projection)
  const labels = labelRender._getLabels()
  labels.each(function () {
    const label = d3.select(this)
    const i = parseInt(label.text())
    expect(common.parseAttr(label, 'x')).toBe(labelsAtFixedPosition[i].x)
    expect(common.parseAttr(label, 'y')).toBe(labelsAtFixedPosition[i].y)
  })
})

test('move labels', () => {
  const labelRender = getLabelRender()
  const labelsBeforeMove = apply(labelRender, common.Projection)
  labelRender.displayLabels()
  apply(labelRender, common.makeScramble())
  labelRender.moveLabels()
  setTimeout(() => {
    const circles = labelRender._getLabels()
    circles.each(function () {
      const label = d3.select(this)
      const i = common.parseAttr(label, 'data-label')
      if (i !== 0) {
        expect(common.parseAttr(label, 'x')).not.toBe(labelsBeforeMove[i].x)
        expect(common.parseAttr(label, 'y')).not.toBe(labelsBeforeMove[i].y)
      }
    })
  }, 500)
})

function getLabelRender () {
  const container = new Container('#bubble-chart', {}, common.document, common.Rect)
  return new LabelRender(container)
}