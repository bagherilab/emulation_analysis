import {
    select,
} from 'https://cdn.skypack.dev/d3@5.16.0';

import { dropDownMenu } from './dropdown.js';
import { checkBox } from './checkbox.js';
import { rnnBarPlot, parityPlot } from './plotting.js';
import { loadRnnBarData, loadParityData } from './csvLoader.js';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let showYAxis = true;

let rawData;

let plotType = "bar";
let context = "C";
let contexts = ["C", "CH"];
let response = "ACTIVITY";
let responses = ["ACTIVITY", "GROWTH", "SYMMETRY"];

let dataPath = "data/predicted/rnn_bar.csv"

const saveButtonId = 'saveButton';

const render = () => {
    // Save button
    if (!document.getElementById(saveButtonId)) {
        const saveButton = document.createElement('button');
        saveButton.id = saveButtonId;
        saveButton.textContent = 'Save SVG';

        // Add a click event listener to the button
        saveButton.addEventListener('click', () => {
            const svgElement = document.querySelector('svg');

            const svgMarkup = new XMLSerializer().serializeToString(svgElement);

            const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });

            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.download = "rnn_plot_" + plotType + "_" + response + ".svg";
            link.href = url;

            link.click();
        });
        document.body.appendChild(saveButton);
    };

    select("#response-menu")
        .call(dropDownMenu, {
            options: responses,
            onOptionClicked: onResponseClicked
        });

    select("#y-check")
        .call(checkBox, {
            checked: true,
            onCheckClicked: check => {
                showYAxis = check;
                render();
            }
        });

    let filteredData;
    if (plotType === "parity") {
        const filterData = (dataset) => {
            const filteredDataset = dataset.filter((row) => {
                let setMatch = row["context"] === context;
                let responseMatch = row["response"] === response;

                return setMatch && responseMatch;
            });

            return filteredDataset;
        };

        filteredData = filterData(rawData);
    } else if (plotType === "bar") {
        const filterData = (dataset) => {
            const filteredDataset = dataset.filter((row) => {
                let setMatch = row["set"] === "TEST";
                let responseMatch = row["response"] === response;

                return setMatch && responseMatch;
            });

            return filteredDataset;
        };

        filteredData = filterData(rawData);
    }



    // Plot
    const margin = { top: 60, right: 40, bottom: 88, left: 150 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (plotType === "parity") {

        svg.call(parityPlot, {
            xValue: d => d["y_pred"],
            yValue: d => d["y_true"],
            circleRadius: 6,
            margin: { top: 60, right: 40, bottom: 88, left: 150 },
            innerWidth: innerWidth,
            innerHeight: innerHeight,
            data: filteredData,
            r2Data: [],
            showXAxis: showYAxis,
            showYAxis: showYAxis,
            time: 0,
            showInitial: false,
            showML: true
        });
    } else if (plotType === "bar") {
        svg.call(rnnBarPlot, {
            data: filteredData,
            innerWidth: innerWidth,
            innerHeight: innerHeight,
            margin: { top: 60, right: 40, bottom: 88, left: 150 },
            showYAxis: showYAxis
        });
    };

    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", "1px");
};

// Load data
const dataPromise = loadRnnBarData(dataPath).then(newData => {
    rawData = newData;
});
Promise.all([dataPromise]).then(() => { render(); });

const parityRadio = document.getElementById('parity-radio');
const barRadio = document.getElementById('bar-radio');

const onResponseClicked = resp => {
    response = resp;
    render();
};

const onContextClicked = event => {
    context = event.target.value;
    render();
};

const onPlotTypeClicked = event => {
    plotType = event.target.value;
    if (plotType === "parity") {
        dataPath = "data/predicted/rnn_parity.csv";
        const dataPromise = loadParityData(dataPath).then(newData => {
            rawData = newData;
        });
        Promise.all([dataPromise]).then(() => { render(); });
    } else if (plotType === "bar") {
        dataPath = "data/predicted/rnn_bar.csv";
        const dataPromise = loadRnnBarData(dataPath).then(newData => {
            rawData = newData;
        });
        Promise.all([dataPromise]).then(() => { render(); });
    }
    render();
};

parityRadio.addEventListener('change', onPlotTypeClicked);
barRadio.addEventListener('change', onPlotTypeClicked);

const cRadio = document.getElementById('c-radio');
const chRadio = document.getElementById('ch-radio');

cRadio.addEventListener('change', onContextClicked);
chRadio.addEventListener('change', onContextClicked);
