import {
    select,
    csv,
    scaleLinear,
    extent,
    axisLeft,
    axisBottom
} from 'https://cdn.skypack.dev/d3@5.16.0';

export const parityPlot = (selection, props) => {
    const {
        xValue,
        yValue,
        circleRadius,
        margin,
        width,
        height,
        dataC,
        dataCH,
        area
    } = props;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const dataCValues = dataC ? dataC.map(d => [xValue(d), yValue(d)]) : [];
    const dataCHValues = dataCH ? dataCH.map(d => [xValue(d), yValue(d)]) : [];
    const allValues = dataCValues.concat(dataCHValues).flat();
    const extentAll = extent(allValues);

    const xScale = scaleLinear()
        .domain(extentAll)
        .range([0, innerWidth])
        .nice();

    const yScale = scaleLinear()
        .domain(extentAll)
        .range([innerHeight, 0])
        .nice();


    const g = selection.selectAll('').data([null]);
    const gEnter = g
        .enter().append('g')
        .attr("class", "container");
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xAxis = axisBottom(xScale)
        .tickValues(xScale.ticks().filter((_, i) => i % 2 === 0))
        .tickSize(-innerHeight)
        .tickPadding(15);

    const yAxis = axisLeft(yScale)
        .tickValues(yScale.ticks().filter((_, i) => i % 2 === 0))
        .tickSize(-innerWidth)
        .tickPadding(10);

    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
        .append('g')
        .attr("class", "y-axis");
    yAxisG
        .merge(yAxisGEnter)
        .call(yAxis)
        .selectAll('.domain').remove();

    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
        .append('g')
        .attr("class", "x-axis");
    xAxisG
        .merge(xAxisGEnter)
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('.domain').remove();


    var circlesC = g.merge(gEnter)
        .selectAll('.circle-c')
        .data(dataC || [], d => d.id);

    circlesC.exit().remove();


    if (dataC != null) {
        circlesC = g.merge(gEnter)
            .selectAll('.circle-c')
            .data(dataC);

        circlesC.enter().append('circle')
            .attr('class', 'circle-c')
            .merge(circlesC)
            .attr('cy', d => yScale(yValue(d)))
            .attr('cx', d => xScale(xValue(d)))
            .attr('r', circleRadius)
            .attr("fill", d => d.set === "train" ? "#a4a2a8" : "#009fff")
            .attr("opacity", 0.4);
    };

    var circlesCH = g.merge(gEnter)
        .selectAll('.circle-ch')
        .data(dataCH || [], d => d.id);

    circlesCH.exit().remove();

    if (dataCH != null) {
        circlesCH = g.merge(gEnter)
            .selectAll('.circle-ch')
            .data(dataCH);

        circlesCH.enter().append('circle')
            .attr('class', 'circle-ch')
            .merge(circlesCH)
            .attr('cy', d => yScale(yValue(d)))
            .attr('cx', d => xScale(xValue(d)))
            .attr('r', circleRadius)
            .attr("fill", d => d.set === "train" ? "#2e2b28" : "#0000b3")
            .attr("opacity", 0.4);
    }

    gEnter.append('line')
        .attr('class', 'parity-line')
        .attr('stroke', 'dimgray')
        .attr('stroke-dasharray', '5 5')
        .attr('x1', xScale.range()[0])
        .attr('y1', yScale.range()[0])
        .attr('x2', xScale.range()[1])
        .attr('y2', yScale.range()[1]);


    // Legend
    // const legendData = [
    //     { set: 'train', type: 'C', color: '#a4a2a8' },
    //     { set: 'train', type: 'CH', color: '#2e2b28' },
    //     { set: 'test', type: 'C', color: '#009fff' },
    //     { set: 'test', type: 'CH', color: '#0000b3' },
    // ];

    // const legend = selection
    //     .selectAll('.legend')
    //     .data([null])
    //     .enter()
    //     .append('g')
    //     .attr('class', 'legend')
    //     .attr('transform', `translate(${margin.left},${margin.top})`);

    // const legendCircles = legend
    //     .selectAll('.legend-circle')
    //     .data(legendData)
    //     .enter()
    //     .append('circle')
    //     .attr('class', 'legend-circle')
    //     .attr('cx', (d, i) => i % 2 ? innerWidth - circleRadius : 0)
    //     .attr('cy', (d, i) => {
    //         const column = Math.floor(i / 2);
    //         const row = i % 2;
    //         return (row === 0 ? 2 : 4) * circleRadius + column * 3 * circleRadius;
    //     })
    //     .attr('r', 14)
    //     .attr('fill', d => d.color)
    //     .attr('opacity', 0.7);

    // const legendLabels = legend
    //     .selectAll('.legend-label')
    //     .data(legendData)
    //     .enter()
    //     .append('text')
    //     .attr('class', 'legend-label')
    //     .attr('x', (d, i) => {
    //         const isTest = d.set === 'test';
    //         const xOffset = isTest ? 4 * circleRadius : 0;
    //         const column = Math.floor(i / 2);
    //         const row = i % 2;
    //         const yOffset = (row === 0 ? 2 : 4) * circleRadius + column * 3 * circleRadius;
    //         return isTest ? innerWidth - xOffset : xOffset;
    //     })
    //     .attr('y', (d, i) => {
    //         const column = Math.floor(i / 2);
    //         const row = i % 2;
    //         const yOffset = (row === 0 ? 2 : 4) * circleRadius + column * 3 * circleRadius;
    //         return yOffset;
    //     })
    //     .attr('text-anchor', (d, i) => i % 2 ? 'end' : 'start')
    //     .attr('alignment-baseline', 'middle')
    //     .text(d => d.type)
    //     .attr('font-size', '24px');

    // const legendTitles = legend
    //     .selectAll('.legend-title')
    //     .data([{ set: 'train' }, { set: 'test' }])
    //     .enter()
    //     .append('text')
    //     .attr('class', 'legend-title')
    //     .attr('x', (d, i) => i === 0 ? -2 * circleRadius : innerWidth + 2 * circleRadius)
    //     .attr('y', 0)
    //     .attr('text-anchor', 'middle')
    //     .attr('alignment-baseline', 'middle')
    //     .text(d => d.set)
    //     .attr('font-size', '20px');

};    