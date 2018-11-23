"use strict";

class RangeHelper {

    constructor(d3, boundingRect) {
        this.d3 = d3;
        this.boundingRect = boundingRect;
    }

    generate(x, y, area, color) {
        let radiusRange = this._getRadiusRange(area);
        let xRange = this._getXRange(x, radiusRange);
        let yRange = this._getYRange(y, radiusRange);
        let colorRange = this._getColorRange(color);
        return {colorRange, xRange, yRange, radiusRange};
    }

    _getRadiusRange(area) {
        let ratio = this._getAreaRatio(area);
        let domain = this._getDomainRange(area);
        let minRadius = Math.sqrt(domain[0] * ratio);
        let maxRadius = Math.sqrt(domain[1] * ratio);
        let range = this.d3.scalePow().exponent(.5).domain(domain).range([minRadius, maxRadius]);
        return (i) => range(area[i]);
    }

    _getXRange(x, radiusRange) {
        let {mostLeftRadius, mostRightRadius} = RangeHelper._getSideRadius(x, radiusRange);
        let domain = this._getDomainRange(x);
        let range = this.d3.scaleLinear().domain(domain).range([mostLeftRadius, this.boundingRect.width - mostRightRadius]);
        return (i) => range(x[i]);
    }

    _getYRange(y, radiusRange) {
        let {mostLeftRadius, mostRightRadius} = RangeHelper._getSideRadius(y, radiusRange);
        let domain = this._getDomainRange(y);
        let range = this.d3.scaleLinear().domain(domain).range([mostLeftRadius, this.boundingRect.height - mostRightRadius]);
        return (i) => range(y[i]);
    }

    _getColorRange(color) {
        let domain = this._getDomainRange(color);
        let range = this.d3.scaleLinear().domain(domain).range(['orange', 'red']);
        return (i) => range(color[i]);
    }

    _getDomainRange(domainValues) {
        let minValue = this.d3.min(domainValues);
        let maxValue = this.d3.max(domainValues);
        return [minValue, maxValue];
    }

    _getAreaRatio(area) {
        let boundingRectArea = this.boundingRect.width * this.boundingRect.height;
        let totalArea = this.d3.sum(area) * Math.PI;
        return .3 * boundingRectArea / totalArea;
    }

    static _getSideRadius(values, radiusRange) {
        let {argmin, argmax} = argMinMax(values);
        let mostLeftRadius = radiusRange(argmin);
        let mostRightRadius = radiusRange(argmax);
        return {mostLeftRadius, mostRightRadius};
    }
}

class NodeBuilder {
    constructor(projection) {
        this.projection = projection;
        let unzipped = this.projection.map((col, i) => this.projection.map(row => row[i]));
        this.x = unzipped[0];
        this.y = unzipped[1];
        this.area = unzipped[2];
        this.color = unzipped[3];
    }

    getNodes(rangeHelper) {
        let ranges = rangeHelper.generate(this.x, this.y, this.area, this.color);

        return this.projection.map((d, i) => {
            return {
                label: i,
                x: ranges.xRange(i),
                y: ranges.yRange(i),
                radius: ranges.radiusRange(i),
                color: ranges.colorRange(i),
                data: d
            }
        });
    }
}

class Container {
    constructor(d3, containerSelector) {
        this.d3 = d3;
        this.containerSelector = containerSelector;
        this.container = this._getContainer();
        this.boundingClientRect = this.container.node().getBoundingClientRect();
        this.rangeHelper = new RangeHelper(this.d3, this.boundingClientRect);
    }

    _getContainer() {
        let container = this.d3.select(this.containerSelector);
        return container.append("svg").style("width", "100%").style("height", "100%");
    }

    selectAll(selector) {
        return this.container.selectAll(selector)
    }

    boundX(node) {
        return Math.max(node.radius, Math.min(this.boundingClientRect.width - node.radius, node.x));
    }

    boundY(node) {
        return Math.max(node.radius, Math.min(this.boundingClientRect.height - node.radius, node.y));
    }

    getNodes(projection) {
        return new NodeBuilder(projection).getNodes(this.rangeHelper);
    }
}

export function argMinMax(values) {
    let minmax = [0, 0];

    values.forEach((value, i) => {
        if (values[minmax[0]] > value)
            minmax[0] = i;
        if (values[minmax[1]] < value)
            minmax[1] = i
    });

    return {argmin: minmax[0], argmax: minmax[1]}
}

export function create(d3, containerSelector) {
    return new Container(d3, containerSelector)
}