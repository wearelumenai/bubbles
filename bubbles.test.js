const d3 = require('d3');
const bub = require('esm')(module)('./Bubbles.mjs');

const data = [[10,3,5,20], [15, 2, 9, 15], [12, 8, 8, 10]];

test('module bubbles', () => {
    d3.select("body").append("div").attr("id", "chart");
    let bubbles = bub.create(d3, "#chart");
    bubbles.apply(data);
    let testSelection = d3.selectAll(".cluster");
    expect(testSelection.nodes().length).toBe(3);
});

test('argMinMax', () => {
    let {argmin, argmax} = bub.argMinMax(data[0]);
    expect(argmin).toBe(1);
    expect(argmax).toBe(3);
});