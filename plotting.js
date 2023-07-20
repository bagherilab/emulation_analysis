// import { sort } from 'https://unpkg.com/d3@5.6.0/dist/d3.min.js';
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
        innerWidth,
        innerHeight,
        data,
        r2Data,
        showXAxis,
        showYAxis,
        time,
        showInitial,
        showML,
    } = props;

    selection.selectAll('*').remove();

    const g = selection.selectAll('.container').data([null]);
    const gEnter = g
        .enter().append('g')
        .attr("class", "container");
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // get largest extend from both x and y values
    const extentX = d3.extent(data, d => parseFloat(xValue(d)));
    const extentY = d3.extent(data, d => parseFloat(yValue(d)));
    const extentXY = [Math.min(extentX[0], extentY[0]), Math.max(extentX[1], extentY[1])];

    const xScale = scaleLinear()
        .domain(extentXY)
        .range([0, innerWidth])
        .nice();

    const yScale = scaleLinear()
        .domain(extentXY)
        .range([innerHeight, 0])
        .nice();

    // Parity line
    gEnter.append('line')
        .attr('class', 'parity-line')
        .attr('stroke', 'gray')
        .attr('stroke-dasharray', '5 5')
        .attr('stroke-width', 5)
        .attr('x1', xScale.range()[0])
        .attr('y1', yScale.range()[0])
        .attr('x2', xScale.range()[1])
        .attr('y2', yScale.range()[1]);

    var markers = g.merge(gEnter)
        .selectAll('.dot')
        .data(data, d => d.id);

    markers.exit().remove();

    // Plot the initial points in the background
    if (showInitial) {
        markers.enter().append('g')
            .attr('class', '.dot')
            .merge(markers)
            .attr('transform', d => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`)
            .each(function (d) {
                if (d.timepoint === 0) {
                    if (d.feature === "naive") {
                        d3.select(this).append('circle')
                            .attr('class', 'circle')
                            .attr('r', circleRadius / 1.5)
                            .attr('fill', d => d.set === "train" ? "none" : getColor("C-naive-TEST"))
                            .attr('stroke', d => d.set === "train" ? getColor("C-naive-TRAIN") : "none")
                            .attr('stroke-width', 2);
                    } else if (d.feature === "topo") {
                        d3.select(this).append('rect')
                            .attr('class', 'square')
                            .attr('x', -circleRadius)
                            .attr('y', -circleRadius)
                            .attr('width', circleRadius * 1.5)
                            .attr('height', circleRadius * 1.5)
                            .attr('fill', d => d.set === "train" ? "none" : getColor("C-naive-TEST"))
                            .attr('stroke', d => d.set === "train" ? getColor("C-naive-TRAIN") : "none")
                            .attr('stroke-width', d => d.set === "train" ? 2 : 0);
                    } else if (d.feature === "spatial") {
                        d3.select(this).append('polygon')
                            .attr('class', 'triangle')
                            .attr('points', `${-circleRadius / 1.5},${circleRadius / 1.5} ${circleRadius / 1.5},${circleRadius / 1.5} 0,${-circleRadius * 1}`)
                            .attr('fill', d => d.set === "train" ? "none" : getColor("C-naive-TEST"))
                            .attr('stroke', d => d.set === "train" ? getColor("C-naive-TRAIN") : "none")
                            .attr('stroke-width', 2);
                    }
                }
            });
    }

    if (showML) {
        markers.enter().append('g')
            .attr('class', '.dot')
            .merge(markers)
            .attr('transform', d => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`)
            .each(function (d) {
                if (d.emulator === "ml") {
                    if (d.feature === "naive") {
                        d3.select(this).append('circle')
                            .attr('class', 'circle')
                            .attr('r', circleRadius / 1.5)
                            .attr('fill', d => d.set === "train" ? "none" : getColor("C-naive-TEST"))
                            .attr('stroke', d => d.set === "train" ? getColor("C-naive-TRAIN") : "none")
                            .attr('stroke-width', 2);
                    } else if (d.feature === "topo") {
                        d3.select(this).append('rect')
                            .attr('class', 'square')
                            .attr('x', -circleRadius)
                            .attr('y', -circleRadius)
                            .attr('width', circleRadius * 1.5)
                            .attr('height', circleRadius * 1.5)
                            .attr('fill', d => d.set === "train" ? "none" : getColor("C-naive-TEST"))
                            .attr('stroke', d => d.set === "train" ? getColor("C-naive-TRAIN") : "none")
                            .attr('stroke-width', d => d.set === "train" ? 2 : 0);
                    } else if (d.feature === "spatial") {
                        d3.select(this).append('polygon')
                            .attr('class', 'triangle')
                            .attr('points', `${-circleRadius / 1.5},${circleRadius / 1.5} ${circleRadius / 1.5},${circleRadius / 1.5} 0,${-circleRadius * 1}`)
                            .attr('fill', d => d.set === "train" ? "none" : getColor("C-naive-TEST"))
                            .attr('stroke', d => d.set === "train" ? getColor("C-naive-TRAIN") : "none")
                            .attr('stroke-width', 2);
                    }
                }
            });
    }

    // Training points
    markers.enter().append('g')
        .attr('class', '.dot')
        .merge(markers)
        .attr('transform', d => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`)
        .each(function (d) {
            if (d.emulator === "rnn") { //d.emulator === "rnn", d.timepoint === parseInt(time)
                if (d.set === "train") {
                    if (d.feature === "naive") {
                        d3.select(this).append('circle')
                            .attr('class', 'circle')
                            .attr('r', circleRadius / 1.5)
                            .attr('fill', "none")
                            .attr('stroke', getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                            .attr('stroke-width', 2);
                    } else if (d.feature === "topo") {
                        d3.select(this).append('rect')
                            .attr('class', 'square')
                            .attr('x', -circleRadius)
                            .attr('y', -circleRadius)
                            .attr('width', circleRadius * 1.5)
                            .attr('height', circleRadius * 1.5)
                            .attr('fill', "none")
                            .attr('stroke', getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                            .attr('stroke-width', 2);
                    } else if (d.feature === "spatial") {
                        d3.select(this).append('polygon')
                            .attr('class', 'triangle')
                            .attr('points', `${-circleRadius / 1.5},${circleRadius / 1.5} ${circleRadius / 1.5},${circleRadius / 1.5} 0,${-circleRadius * 1}`)
                            .attr('fill', "none")
                            .attr('stroke', getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                            .attr('stroke-width', 2);
                    } else if (d.feature === "syntopo") {
                        d3.select(this).append('rect')
                            .attr('class', 'square')
                            .attr('x', -circleRadius)
                            .attr('y', -circleRadius)
                            .attr('width', circleRadius * 1.5)
                            .attr('height', circleRadius * 1.5)
                            .attr('fill', "none")
                            .attr('stroke', getRnnColor("rnn-train"))
                            .attr('stroke-width', 2);
                    }
                }
            }
        });

    // Test points
    markers.enter().append('g')
        .attr('class', '.dot')
        .merge(markers)
        .attr('transform', d => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`)
        .each(function (d) {
            if (d.emulator === "rnn") { //d.emulator === "rnn"
                if (d.set === "test") {
                    if (d.feature === "naive") {
                        d3.select(this).append('circle')
                            .attr('class', 'circle')
                            .attr('r', circleRadius)
                            .attr('fill', d => getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                            .attr('stroke', "none")
                            .attr('stroke-width', 2);
                    } else if (d.feature === "topo") {
                        d3.select(this).append('rect')
                            .attr('class', 'square')
                            .attr('x', -circleRadius)
                            .attr('y', -circleRadius)
                            .attr('width', circleRadius * 2)
                            .attr('height', circleRadius * 2)
                            .attr('fill', d => getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                            .attr('stroke', "none")
                            .attr('stroke-width', 2);
                    } else if (d.feature === "spatial") {
                        d3.select(this).append('polygon')
                            .attr('class', 'triangle')
                            .attr('points', `${-circleRadius},${circleRadius} ${circleRadius},${circleRadius} 0,${-circleRadius * 1.4}`)
                            .attr('fill', d => getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                            .attr('stroke', "none")
                            .attr('stroke-width', 2);
                    } else if (d.feature === "syntopo") {
                        d3.select(this).append('rect')
                            .attr('class', 'square')
                            .attr('x', -circleRadius)
                            .attr('y', -circleRadius)
                            .attr('width', circleRadius * 2)
                            .attr('height', circleRadius * 2)
                            .attr('fill', d => getRnnColor("rnn"))
                            .attr('stroke', "none")
                            .attr('stroke-width', 2);
                    }
                }
            }
        });


    // var labels = g.merge(gEnter)
    //     .selectAll('.label')
    //     .data(r2Data, d => d.id);

    // labels.exit().remove();

    // // Get set of all features in r2 data
    // var features = new Set(r2Data.map(d => d.feature));
    // let chosenFeature;
    // if (features.has("spatial")) {
    //     chosenFeature = "spatial";
    // } else if (features.has("topo")) {
    //     chosenFeature = "topo";
    // } else {
    //     chosenFeature = "naive";
    // }

    // // Add text elements for the lines of text
    // labels.enter().append('g')
    //     .attr('class', '.label')
    //     .merge(labels)
    //     .each(function (d) {
    //         if (d.timepoint === time) {

    //             if (d.feature === chosenFeature) {
    //                 d3.select(this).append('text')
    //                     .attr('class', 'label')
    //                     .attr('x', 10)
    //                     .attr('y', d => d.set === "TRAIN" ? 20 : 75)
    //                     .style("font-size", "50px")
    //                     .text(d => d.set === "TRAIN" ? `R²: ` : `Q²: `);

    //                 d3.select(this).append('text')
    //                     .attr('x', 80)
    //                     .attr('y', d => d.set === "TRAIN" ? 20 : 75)
    //                     .attr('fill', d => getColor(d.context + "-" + d.feature + "-TEST"))
    //                     .text(d => d['R^2'].toFixed(2))
    //                     .style("font-size", "50px");

    //             } else {
    //                 // d3.select(this).append('text')
    //                 //     .attr('class', 'label')
    //                 //     .attr('x', 180)
    //                 //     .attr('y', d => d.set === "TRAIN" ? 20 : 75)
    //                 //     .style("font-size", "50px")
    //                 //     .text(",");

    //                 d3.select(this).append('text')
    //                     .attr('x', 200)
    //                     .attr('y', d => d.set === "TRAIN" ? 20 : 75)
    //                     .attr('fill', d => getColor(d.context + "-" + d.feature + "-TEST"))
    //                     .text(d => d['R^2'].toFixed(2))
    //                     .style("font-size", "50px");
    //             }
    //         }
    //     });

    let xAxis;
    if (showXAxis) {
        xAxis = axisBottom(xScale)
            .ticks(3)
            // .tickValues([0.2, 0.5, 0.8])
            .tickFormat(d3.format(".1f"))
            .tickSize(3);
        // .tickPadding(15);
    } else {
        xAxis = axisBottom(xScale)
            .ticks(0)
            .tickFormat(d3.format(".1f"))
            .tickSize(3);
        // .tickPadding(15);
    }

    let yAxis;
    if (showYAxis) {
        yAxis = axisLeft(yScale)
            .ticks(3)
            // .tickValues([0.2, 0.5, 0.8])
            .tickFormat(d3.format(".1f"))
            .tickSize(3)
            .tickPadding(15);
    } else {
        yAxis = axisLeft(yScale)
            .ticks(0)
            .tickFormat(d3.format(".1f"))
            .tickSize(3)
            .tickPadding(15);
    }


    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
        .append('g')
        .attr("class", "y-axis");

    yAxisG
        .merge(yAxisGEnter)
        .call(yAxis)
        .attr("font-size", "50px");

    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
        .append('g')
        .attr("class", "x-axis");
    xAxisG
        .merge(xAxisGEnter)
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .attr("font-size", "50px");

};

export const barPlot = (selection, props) => {
    const {
        data,
        innerWidth,
        innerHeight,
        margin,
        context,
        showYAxis
    } = props;

    // Extract unique responses and features from the data
    const responses = Array.from(new Set(data.map(d => d.response)));

    // Define x and y scales
    const xScale = d3
        .scaleBand()
        .domain(responses)
        .range([0, innerWidth])
        .padding(0.1);

    // R2 scale
    const yScale = d3
        .scaleLinear()
        .domain([-0.1, 1.0])
        .range([innerHeight, 0])
        .nice();

    // RMSE scale
    // const yScale = d3
    //     .scaleLinear()
    //     .domain([0, 0.6])
    //     .range([innerHeight, 0])
    //     .nice();

    const nestedData = d3.nest()
        .key(d => d.response)
        .key(d => d.feature)
        .key(d => d.set)
        .rollup(group => {
            const mean = d3.mean(group, d => d['r2']);
            const se = d3.mean(group, d => d["r2_se"]);
            return { mean, se };
        })
        .entries(data);

    selection.selectAll('*').remove();

    const g = selection.selectAll('.container').data([null]);

    const gEnter = g.enter().append('g')
        .attr('class', 'container');
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);


    const zeroLine = g.merge(gEnter)
        .append("line")
        .attr("class", "zero-line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    const bars = g.merge(gEnter)
        .selectAll(".bar")
        .data(nestedData);


    bars.exit().remove();
    zeroLine.exit().remove();

    bars.enter()
        .append("g")
        .merge(bars)
        .each(function (response) {
            // Get features from response dictionary
            const features = response.values;

            // Iterate over features in triplets
            for (let i = 0; i < features.length - 1; i += 3) {
                // naive features
                const feature1 = features.find(d => d.key === "naive");
                // topo features
                const feature2 = features.find(d => d.key === "topo");
                // spatial features
                const feature3 = features.find(d => d.key === "spatial");

                // Get sets from feature dictionaries
                const naive_sets = feature1.values;
                const topo_sets = feature2.values;
                const spatial_sets = feature3.values;

                // Get values from sets dictionaries
                const naive_test_values = naive_sets[1].value;
                const naive_train_values = naive_sets[0].value;

                const topo_test_values = topo_sets[1].value;
                const topo_train_values = topo_sets[0].value;

                const spatial_test_values = spatial_sets[1].value;
                const spatial_train_values = spatial_sets[0].value;

                const naive_test_r2 = naive_test_values["mean"];
                const naive_train_r2 = naive_train_values["mean"];
                const naive_test_se = naive_test_values["se"];
                const naive_train_se = naive_train_values["se"];

                const topo_test_r2 = topo_test_values["mean"];
                const topo_train_r2 = topo_train_values["mean"];
                const topo_test_se = topo_test_values["se"];
                const topo_train_se = topo_train_values["se"];

                const spatial_test_r2 = spatial_test_values["mean"];
                const spatial_train_r2 = spatial_train_values["mean"];
                const spatial_test_se = spatial_test_values["se"];
                const spatial_train_se = spatial_train_values["se"];


                // Graph the bars using the values
                const gapBetweenBars = 0.025 * xScale.bandwidth();
                const gapBetweenSets = 0.055 * xScale.bandwidth();
                const barWidth = (xScale.bandwidth() - gapBetweenBars) / 7.5;

                const xNaiveTrain = xScale(response.key) + i * (barWidth + gapBetweenBars);
                const xNaiveTest = xNaiveTrain + barWidth + gapBetweenBars;
                const xTopoTrain = xNaiveTest + barWidth + gapBetweenSets;
                const xTopoTest = xTopoTrain + barWidth + gapBetweenBars;
                const xSpatialTrain = xTopoTest + barWidth + gapBetweenSets;
                const xSpatialTest = xSpatialTrain + barWidth + gapBetweenBars;

                // Plot the training bars
                const naive_train = yScale(Math.max(0, naive_train_r2)); // Use Math.max to ensure positive values start at 0
                const topo_train = yScale(Math.max(0, topo_train_r2)); // Use Math.max to ensure positive values start at 0
                const spatial_train = yScale(Math.max(0, spatial_train_r2)); // Use Math.max to ensure positive values start at 0
                const height1 = Math.abs(yScale(naive_train_r2) - yScale(0)); // Calculate the height relative to 0
                const height2 = Math.abs(yScale(topo_train_r2) - yScale(0)); // Calculate the height relative to 0
                const height3 = Math.abs(yScale(spatial_train_r2) - yScale(0)); // Calculate the height relative to 0

                d3.select(this)
                    .append("rect")
                    .attr("class", "train-bar")
                    .attr("x", xNaiveTrain)
                    .attr("y", naive_train)
                    .attr("width", barWidth)
                    .attr("height", height1)
                    .attr("fill", "none")
                    .attr("stroke", getColor("C-naive-TRAIN"))
                    .attr("stroke-width", 5);

                d3.select(this)
                    .append("rect")
                    .attr("class", "train-bar")
                    .attr("x", xTopoTrain)
                    .attr("y", topo_train)
                    .attr("width", barWidth)
                    .attr("height", height2)
                    .attr("fill", "none")
                    .attr("stroke", getColor("C-topo-TRAIN"))
                    .attr("stroke-width", 5);

                d3.select(this)
                    .append("rect")
                    .attr("class", "train-bar")
                    .attr("x", xSpatialTrain)
                    .attr("y", spatial_train)
                    .attr("width", barWidth)
                    .attr("height", height3)
                    .attr("fill", "none")
                    .attr("stroke", getColor("C-spatial-TRAIN"))
                    .attr("stroke-width", 5);

                // Plot the test R^2 values on top of the bars
                const naive_test = yScale(Math.max(0, naive_test_r2)); // Use Math.max to ensure positive values start at 0
                const topo_test = yScale(Math.max(0, topo_test_r2)); // Use Math.max to ensure positive values start at 0
                const spatial_test = yScale(Math.max(0, spatial_test_r2)); // Use Math.max to ensure positive values start at 0
                const height4 = Math.abs(yScale(naive_test_r2) - yScale(0)); // Calculate the height relative to 0
                const height5 = Math.abs(yScale(topo_test_r2) - yScale(0)); // Calculate the height relative to 0
                const height6 = Math.abs(yScale(spatial_test_r2) - yScale(0)); // Calculate the height relative to 0

                d3.select(this)
                    .append("rect")
                    .attr("class", "test-r2")
                    .attr("x", xNaiveTest)
                    .attr("y", naive_test)
                    .attr("width", barWidth)
                    .attr("height", height4)
                    .attr("fill", getColor(context + "-naive-TEST"))
                    .attr("stroke", getColor(context + "-naive-TEST"))
                    .attr("stroke-width", 5);

                d3.select(this)
                    .append("rect")
                    .attr("class", "test-r2")
                    .attr("x", xTopoTest)
                    .attr("y", topo_test)
                    .attr("width", barWidth)
                    .attr("height", height5)
                    .attr("fill", getColor(context + "-topo-TEST"))
                    .attr("stroke", getColor(context + "-topo-TEST"))
                    .attr("stroke-width", 5);

                d3.select(this)
                    .append("rect")
                    .attr("class", "test-r2")
                    .attr("x", xSpatialTest)
                    .attr("y", spatial_test)
                    .attr("width", barWidth)
                    .attr("height", height6)
                    .attr("fill", getColor(context + "-spatial-TEST"))
                    .attr("stroke", getColor(context + "-spatial-TEST"))
                    .attr("stroke-width", 5);

                // Plot se error bars
                const errorWidth = 5;
                const errorCapLength = 14; // Adjust the cap length as needed

                // Function to draw error caps
                function drawErrorCap(selection, x, y, width) {
                    selection.append("line")
                        .attr("class", "error-cap")
                        .attr("x1", x - width / 2 + 2)
                        .attr("y1", y)
                        .attr("x2", x + width / 2 + 2)
                        .attr("y2", y)
                        .attr("stroke", "black");
                }

                const naive_train_se_height = Math.abs(yScale(naive_train_se) - yScale(0));
                const naive_train_se_y = naive_train >= yScale(0) ? yScale(Math.max(0, naive_train_se)) + height1 + (naive_train_se_height / 2) - 2
                    : yScale(Math.max(0, naive_train_se)) - height1 + (naive_train_se_height / 2) - 2;

                const topo_train_se_height = Math.abs(yScale(topo_train_se) - yScale(0));
                const topo_train_se_y = topo_train >= yScale(0) ? yScale(Math.max(0, topo_train_se)) + height2 + (topo_train_se_height / 2) - 2
                    : yScale(Math.max(0, topo_train_se)) - height2 + (topo_train_se_height / 2) - 2;

                const spatial_train_se_height = Math.abs(yScale(spatial_train_se) - yScale(0));
                const spatial_train_se_y = spatial_train >= yScale(0) ? yScale(Math.max(0, spatial_train_se)) + height3 + (spatial_train_se_height / 2) - 2
                    : yScale(Math.max(0, spatial_train_se)) - height3 + (spatial_train_se_height / 2) - 2;


                d3.select(this)
                    .append("rect")
                    .attr("class", "train-se")
                    .attr("x", xNaiveTrain + barWidth / 2)
                    .attr("y", naive_train_se_y)
                    .attr("width", errorWidth)
                    .attr("height", naive_train_se_height * 2)
                    .attr("fill", "black");

                d3.select(this)
                    .append("rect")
                    .attr("class", "train-se")
                    .attr("x", xTopoTrain + barWidth / 2)
                    .attr("y", topo_train_se_y)
                    .attr("width", errorWidth)
                    .attr("height", topo_train_se_height * 2)
                    .attr("fill", "black");

                d3.select(this)
                    .append("rect")
                    .attr("class", "train-se")
                    .attr("x", xSpatialTrain + barWidth / 2)
                    .attr("y", spatial_train_se_y)
                    .attr("width", errorWidth)
                    .attr("height", spatial_train_se_height * 2)
                    .attr("fill", "black");


                drawErrorCap(d3.select(this), xNaiveTrain + barWidth / 2, naive_train_se_y, errorCapLength);
                drawErrorCap(d3.select(this), xNaiveTrain + barWidth / 2, naive_train_se_y + naive_train_se_height * 2, errorCapLength);

                drawErrorCap(d3.select(this), xTopoTrain + barWidth / 2, topo_train_se_y, errorCapLength);
                drawErrorCap(d3.select(this), xTopoTrain + barWidth / 2, topo_train_se_y + topo_train_se_height * 2, errorCapLength);

                drawErrorCap(d3.select(this), xSpatialTrain + barWidth / 2, spatial_train_se_y, errorCapLength);
                drawErrorCap(d3.select(this), xSpatialTrain + barWidth / 2, spatial_train_se_y + spatial_train_se_height * 2, errorCapLength);


                const naive_test_se_height = Math.abs(yScale(naive_test_se) - yScale(0));
                const naive_test_se_y = naive_test >= yScale(0) ? yScale(Math.max(0, naive_test_se)) + height4 + (naive_test_se_height / 2) - 2
                    : yScale(Math.max(0, naive_test_se)) - height4 + (naive_test_se_height / 2) - 2;

                const topo_test_se_height = Math.abs(yScale(topo_test_se) - yScale(0));
                const topo_test_se_y = topo_test >= yScale(0) ? yScale(Math.max(0, topo_test_se)) + height5 + (topo_test_se_height / 2) - 2
                    : yScale(Math.max(0, topo_test_se)) - height5 + (topo_test_se_height / 2) - 2;

                const spatial_test_se_height = Math.abs(yScale(spatial_test_se) - yScale(0));
                const spatial_test_se_y = spatial_test >= yScale(0) ? yScale(Math.max(0, spatial_test_se)) + height6 + (spatial_test_se_height / 2) - 2
                    : yScale(Math.max(0, spatial_test_se)) - height6 + (spatial_test_se_height / 2) - 2;

                d3.select(this)
                    .append("rect")
                    .attr("class", "test-se")
                    .attr("x", xNaiveTest + barWidth / 2)
                    .attr("y", naive_test_se_y)
                    .attr("width", errorWidth)
                    .attr("height", naive_test_se_height * 2)
                    .attr("fill", "black");

                d3.select(this)
                    .append("rect")
                    .attr("class", "test-se")
                    .attr("x", xTopoTest + barWidth / 2)
                    .attr("y", topo_test_se_y)
                    .attr("width", errorWidth)
                    .attr("height", topo_test_se_height * 2)
                    .attr("fill", "black");

                d3.select(this)
                    .append("rect")
                    .attr("class", "test-se")
                    .attr("x", xSpatialTest + barWidth / 2)
                    .attr("y", spatial_test_se_y)
                    .attr("width", errorWidth)
                    .attr("height", spatial_test_se_height * 2)
                    .attr("fill", "black");

                drawErrorCap(d3.select(this), xNaiveTest + barWidth / 2, naive_test_se_y, errorCapLength);
                drawErrorCap(d3.select(this), xNaiveTest + barWidth / 2, naive_test_se_y + naive_test_se_height * 2, errorCapLength);

                drawErrorCap(d3.select(this), xTopoTest + barWidth / 2, topo_test_se_y, errorCapLength);
                drawErrorCap(d3.select(this), xTopoTest + barWidth / 2, topo_test_se_y + topo_test_se_height * 2, errorCapLength);

                drawErrorCap(d3.select(this), xSpatialTest + barWidth / 2, spatial_test_se_y, errorCapLength);
                drawErrorCap(d3.select(this), xSpatialTest + barWidth / 2, spatial_test_se_y + spatial_test_se_height * 2, errorCapLength);
            }
        });

    let yAxis;
    if (showYAxis) {
        // R2 ticks
        yAxis = d3.axisLeft(yScale)
            .tickValues([-0.1, 0.0, 0.5, 1.0])
            .tickSize(0)
            .tickPadding(10);

        // RMSE ticks
        // yAxis = d3.axisLeft(yScale)
        //     .tickValues([0, 0.2, 0.4, 0.6])
        //     .tickSize(0)
        //     .tickPadding(10);
    } else {
        yAxis = d3.axisLeft(yScale)
            .tickValues([])
            .tickSize(0)
            .tickPadding(0);
    }

    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
        .append('g')
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .attr("font-size", "50px");

    yAxisG
        .merge(yAxisGEnter)
        .call(yAxis)
        .selectAll('.tick line')
        .remove();
};

export const linePlot = (selection, props) => {
    const {
        xValue,
        yValue,
        margin,
        innerWidth,
        innerHeight,
        data,
        type,
        showXAxis,
        showYAxis,
        includeCH = false
    } = props;

    const sortedData = data.sort((a, b) => xValue(a) - xValue(b));

    selection.selectAll('*').remove();

    const g = selection.selectAll('.container').data([null]);
    const gEnter = g.enter().append('g')
        .attr('class', 'container');
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);

    let xScale;
    if (type === "temporal") {
        xScale = d3.scaleLinear()
            .domain([-1, 14])
            .range([0, innerWidth]);
    } else {
        xScale = d3.scaleLinear()
            .domain([50, 500])
            .range([0, innerWidth]);
    }

    // R2 scale
    // const yScale = d3.scaleLinear()
    //     .domain([-0.1, 1.1])
    //     .range([innerHeight, 0]);

    // RMSE scale
    const maxY = 0.43;
    const yScale = d3.scaleLinear()
        .domain([0.0, maxY])
        .range([innerHeight, 0])
        .nice();

    // const zeroLine = g.merge(gEnter)
    //     .append("line")
    //     .attr("class", "zero-line")
    //     .attr("x1", 0)
    //     .attr("x2", innerWidth)
    //     .attr("y1", yScale(0))
    //     .attr("y2", yScale(0))
    //     .attr("stroke", "black")
    //     .attr("stroke-width", 1);

    // Clip path
    g.merge(gEnter)
        .append("defs")
        .append("clipPath")
        .attr("id", "clip-path")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", innerWidth)
        .attr("height", innerHeight);

    // Data points
    const dataPointRadius = 5;

    const circleGenerator = d3.symbol().type(d3.symbolCircle).size(dataPointRadius * dataPointRadius);

    const testPointsData = sortedData.flatMap(d => {
        const x = xValue(d);
        const test_means = Array.isArray(d.test_rmses) ? d.test_rmses : JSON.parse(d.test_rmses);
        const set = "TEST";
        const feature = d.feature;
        const context = d.context;
        return test_means
            .filter(test_mean => test_mean <= 0.4)
            .map(test_mean => ({ x, y: test_mean, set, feature, context }))
    });

    const testPoints = g.merge(gEnter)
        .selectAll('.point')
        .data(testPointsData);

    testPoints.exit().remove();

    if (includeCH) {
        testPoints.enter().append('path')
            .attr('class', 'point')
            .merge(testPoints)
            .attr('d', circleGenerator)
            .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`)
            .attr('fill', 'none')
            .attr('stroke', d => d.context === "C" ? getColor("C-" + d.feature + "-TEST") : getColor("C-naive-TEST"))
            .attr('stroke-width', 1);
    } else {
        testPoints.enter().append('path')
            .attr('class', 'point')
            .merge(testPoints)
            .attr('d', circleGenerator)
            .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`)
            .attr('fill', 'none')
            .attr('stroke', d => getColor("C-" + d.feature + "-TEST"))
            .attr('stroke-width', 1);
    }

    // Line
    const lineGenerator = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)));

    const nestedData = d3.nest()
        .key(d => d.context)
        .key(d => d.feature)
        .key(d => d.set)
        .entries(sortedData);

    const linesData = nestedData.flatMap(contextData =>
        contextData.values.flatMap(featureData =>
            featureData.values.flatMap(setData => {
                const key = `${contextData.key}-${featureData.key}-${setData.key}`;
                const set = setData.key;
                const feature = featureData.key
                return {
                    key,
                    set,
                    feature,
                    values: setData.values,
                };
            })
        )
    );

    const lines = g.merge(gEnter)
        .selectAll('.line')
        .data(linesData, d => d.key);

    lines.exit().remove();

    if (includeCH) {
        lines.enter().append('path')
            .attr('class', 'line')
            .merge(lines)
            .attr('d', d => lineGenerator(d.values))
            .attr('fill', 'none')
            .attr('stroke', d => d.key.startsWith("CH") ? getColor("C-naive-" + d.set) : getColor("C-" + d.feature + "-" + d.set))
            .attr('stroke-width', d => d.key.endsWith("TRAIN") ? 5 : 10)
            .attr('stroke-dasharray', d => d.key.endsWith("TRAIN") ? '20 5' : 'none')
            .attr("clip-path", "url(#clip-path)");
    } else {
        lines.enter().append('path')
            .attr('class', 'line')
            .merge(lines)
            .attr('d', d => lineGenerator(d.values))
            .attr('fill', 'none')
            .attr('stroke', d => getColor(d.key))
            .attr('stroke-width', d => d.key.endsWith("TRAIN") ? 5 : 10)
            .attr('stroke-dasharray', d => d.key.endsWith("TRAIN") ? '20 5' : 'none')
            .attr("clip-path", "url(#clip-path)");
    }


    let xAxis;
    if (showXAxis) {
        if (type === "quantity") {
            xAxis = axisBottom(xScale)
                .tickValues([100, 250, 400])
                .tickFormat(d3.format(".0f"))
                .tickSize(0)
                .tickPadding(10);
        } else if (type === "temporal") {
            xAxis = axisBottom(xScale)
                .tickValues([0, 7, 14])
                .tickFormat(function (d) {
                    return (d / 7).toFixed(0);
                })
                .tickSize(0)
                .tickPadding(10);
        }
    } else {
        xAxis = axisBottom(xScale)
            .ticks(0)
            .tickSize(0)
            .tickPadding(10);
    }

    let yAxis;
    if (showYAxis) {
        // R2 ticks
        // yAxis = axisLeft(yScale)
        //     .tickValues([-0.1, 0.0, 0.5, 1.0])
        //     .tickFormat(d3.format(".1f"))
        //     .tickSize(3)
        //     .tickPadding(10);

        // RMSE ticks
        yAxis = axisLeft(yScale)
            .ticks(3)
            .tickFormat(d3.format(".1f"))
            .tickSize(3)
            .tickPadding(10);
    } else {
        yAxis = axisLeft(yScale)
            .ticks(0)
            .tickFormat(d3.format(".1f"))
            .tickSize(3)
            .tickPadding(10);
    }

    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
        .append('g')
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    yAxisG
        .merge(yAxisGEnter)
        .call(yAxis)
        .attr("font-size", "80px")
        .selectAll(".tick line").remove();

    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
        .append('g')
        .attr("class", "x-axis");

    xAxisG
        .merge(xAxisGEnter)
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .attr("font-size", "80px");
};

export const rnnBarPlot = (selection, props) => {
    const {
        data,
        innerWidth,
        innerHeight,
        margin,
        showYAxis
    } = props;

    // Extract unique responses and features from the data
    const responses = Array.from(new Set(data.map(d => d.response)));

    // Define x and y scales
    const xScale = d3
        .scaleBand()
        .domain(responses)
        .range([0, innerWidth])
        .padding(0.1);

    // R2 scale
    const yScale = d3
        .scaleLinear()
        .domain([0, 0.22])
        .range([innerHeight, 0])
        .nice();

    const nestedData = d3.nest()
        .key(d => d.response)
        .key(d => d.context)
        .key(d => d.emulator)
        .rollup(group => {
            const mean = d3.mean(group, d => d['rmse']);
            const se = d3.mean(group, d => d['rmse_se']);
            return { mean, se };
        })
        .entries(data);

    selection.selectAll('*').remove();

    const g = selection.selectAll('.container').data([null]);

    const gEnter = g.enter().append('g')
        .attr('class', 'container');
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);


    const zeroLine = g.merge(gEnter)
        .append("line")
        .attr("class", "zero-line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    const bars = g.merge(gEnter)
        .selectAll(".bar")
        .data(nestedData);


    bars.exit().remove();
    zeroLine.exit().remove();

    bars.enter()
        .append("g")
        .merge(bars)
        .each(function (response) {
            // Get features from response dictionary
            const features = response.values;

            const contexts = ["C", "CH"]
            const emulatorTypes = ["ml", "rnn", "ml15"];

            const gapBetweenBars = 0.02 * xScale.bandwidth();
            const gapBetweenContexts = 0.6 * xScale.bandwidth();
            const barWidth = (xScale.bandwidth() - gapBetweenBars) / 7.5;

            const errorWidth = 5;
            const errorCapLength = 14; // Adjust the cap length as needed

            const middleLineX = (xScale.bandwidth() + gapBetweenContexts) * (contexts.length / 2) - gapBetweenContexts - 190;
            // Append the dashed vertical line
            g.merge(gEnter)
                .append("line")
                .attr("class", "middle-line")
                .attr("x1", middleLineX)
                .attr("x2", middleLineX)
                .attr("y1", 0)
                .attr("y2", innerHeight)
                .attr("stroke", "black")
                .attr("stroke-dasharray", "5,5") // Add the dashed stroke style
                .attr("stroke-width", 1);

            // Iterate over contexts
            contexts.forEach((context, contextIndex) => {
                // Get features for the current context
                const contextFeatures = features.find(d => d.key === context).values;

                // Iterate over emulator types
                emulatorTypes.forEach((emulatorType, emulatorIndex) => {
                    // Get the feature dictionary for the current emulator type
                    const feature = contextFeatures.find(d => d.key === emulatorType);
                    const feature_values = feature.value;

                    // Get values from dictionaries
                    const test_values = feature_values["mean"];
                    const se_values = feature_values["se"];

                    // Calculate the required positions and dimensions for plotting bars
                    const xPosition = 50 + contextIndex * (gapBetweenContexts) + emulatorIndex * (barWidth + gapBetweenBars);
                    const yPosition = yScale(Math.max(0, test_values));
                    const barHeight = Math.abs(yScale(test_values) - yScale(0));
                    const seHeight = Math.abs(yScale(se_values) - yScale(0));
                    const seY = yPosition >= yScale(0) ? yScale(Math.max(0, se_values)) + barHeight + (seHeight / 2) - 2 : yScale(Math.max(0, se_values)) - barHeight + (seHeight / 2) - 2;

                    // Graph the bars using the values
                    d3.select(this)
                        .append("rect")
                        .attr("class", "test-bar")
                        .attr("x", xPosition)
                        .attr("y", yPosition)
                        .attr("width", barWidth)
                        .attr("height", barHeight)
                        .attr("fill", getRnnColor(emulatorType))
                        .attr("stroke", getRnnColor(emulatorType + "-border"))
                        .attr("stroke-width", 5);

                    // Plot the SE error bars
                    d3.select(this)
                        .append("rect")
                        .attr("class", "test-se")
                        .attr("x", xPosition + barWidth / 2)
                        .attr("y", seY)
                        .attr("width", errorWidth)
                        .attr("height", seHeight * 2)
                        .attr("fill", "black");

                    function drawErrorCap(selection, x, y, width) {
                        selection.append("line")
                            .attr("class", "error-cap")
                            .attr("x1", x - width / 2 + 2)
                            .attr("y1", y)
                            .attr("x2", x + width / 2 + 2)
                            .attr("y2", y)
                            .attr("stroke", "black");
                    }

                    drawErrorCap(d3.select(this), xPosition + barWidth / 2, seY, errorCapLength);
                    drawErrorCap(d3.select(this), xPosition + barWidth / 2, seY + seHeight * 2, errorCapLength);
                });
            });
        });

    let yAxis;
    if (showYAxis) {
        // R2 ticks
        yAxis = d3.axisLeft(yScale)
            .ticks(3)
            .tickFormat(d3.format(".1f"))
            .tickSize(0)
            .tickPadding(10);

        // RMSE ticks
        // yAxis = d3.axisLeft(yScale)
        //     .tickValues([0, 0.2, 0.4, 0.6])
        //     .tickSize(0)
        //     .tickPadding(10);
    } else {
        yAxis = d3.axisLeft(yScale)
            .tickValues([])
            .tickSize(0)
            .tickPadding(0);
    }

    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
        .append('g')
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .attr("font-size", "80px");

    yAxisG
        .merge(yAxisGEnter)
        .call(yAxis)
        .selectAll('.tick line')
        .remove();
};

const getColor = key => {
    const colorMap = {
        "C-naive-TEST": "#606060",
        "CH-naive-TEST": "#606060", // dark gray
        "C-topo-TEST": "#4098b5", // 
        "CH-topo-TEST": "#4098b5", // dark blue
        "C-spatial-TEST": "#FF6F00", // 
        "CH-spatial-TEST": "#FF6F00", // dark orange
        "C-syntopo-Test": "#800000",
        "CH-syntopo-Test": "#800000", // dark red

        "C-naive-TRAIN": "#AAAAAA", // light gray
        "CH-naive-TRAIN": "#AAAAAA", //
        "C-topo-TRAIN": "#4cb6da", // light blue
        "CH-topo-TRAIN": "#4cb6da", // 
        "C-spatial-TRAIN": "#FF7F00", // light orange
        "CH-spatial-TRAIN": "#FF7F00", // 
        "C-syntopo-Train": "#FF0000",
        "CH-syntopo-Train": "#FF0000", // light red

    };
    return colorMap[key] || 'purple';
};

const getRnnColor = key => {
    const colorMap = {
        "rnn": "#800000", // maroon
        "ml": "#606060", // gray
        // "ml15": "url(#diagonal-stripe-1)", // diagonal stripes
        "ml15": "#AAAAAA", // light gray

        "rnn-border": "#800000", // maroon
        "ml-border": "#606060", // gray
        "ml15-border": "#AAAAAA", // light gray

        "rnn-train": "#B00000", // lighter maroon
    };
    return colorMap[key] || 'purple';
};