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
let response = "ACTIVITY";
let responses = ["ACTIVITY", "GROWTH", "SYMMETRY"];

let dataPath = "data/predicted/rnn_r2_bar.csv"

const saveButtonId = 'saveButton';

const render = () => {
    // Save button
    if (!document.getElementById(saveButtonId)) {
        const saveButton = document.createElement('button');
        saveButton.id = saveButtonId;
        saveButton.textContent = 'Save SVG';

        // Add a click event listener to the button
        saveButton.addEventListener('click', () => {
            // Get the SVG element
            const svgElement = document.querySelector('svg');

            // Get the SVG markup
            const svgMarkup = new XMLSerializer().serializeToString(svgElement);

            // Create a new Blob object from the SVG markup
            const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });

            // Create a URL for the Blob object
            const url = URL.createObjectURL(blob);

            // Create a new link element
            const link = document.createElement('a');
            link.download = "rnn_plot_" + plotType + "_" + response + "_" + context + ".svg";
            link.href = url;

            // Simulate a click on the link element to trigger the download
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

    const filterData = (dataset) => {
        const filteredDataset = dataset.filter((row) => {
            let contextMatch = row["context"] === context;
            let responseMatch = row["response"] === response;

            return contextMatch && responseMatch;
        });

        return filteredDataset;
    };

    let filteredData = filterData(rawData);


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
            showXAxis: true,
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
            context: context,
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


// Get the radio buttons
const cRadio = document.getElementById('c-radio');
const chRadio = document.getElementById('ch-radio');

const parityRadio = document.getElementById('parity-radio');
const barRadio = document.getElementById('bar-radio');

const onContextClicked = event => {
    context = event.target.value;
    render();
};

const onResponseClicked = resp => {
    response = resp;
    render();
};

const onPlotTypeClicked = event => {
    plotType = event.target.value;
    if (plotType === "parity") {
        dataPath = "data/predicted/rnn_parity_full.csv";
        const dataPromise = loadParityData(dataPath).then(newData => {
            rawData = newData;
        });
        Promise.all([dataPromise]).then(() => { render(); });
    } else if (plotType === "bar") {
        dataPath = "data/predicted/rnn_r2_bar.csv";
        const dataPromise = loadRnnBarData(dataPath).then(newData => {
            rawData = newData;
        });
        Promise.all([dataPromise]).then(() => { render(); });
    }
    render();
};

// Add event listener to radio buttons
cRadio.addEventListener('change', onContextClicked);
chRadio.addEventListener('change', onContextClicked);

parityRadio.addEventListener('change', onPlotTypeClicked);
barRadio.addEventListener('change', onPlotTypeClicked);