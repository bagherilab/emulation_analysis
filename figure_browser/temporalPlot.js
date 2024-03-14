import {
    select,
} from 'https://cdn.skypack.dev/d3@5.16.0';

import { dropDownMenu } from './dropdown.js';
import { checkBox } from './checkbox.js';
import { linePlot } from './plotting.js';
import { loadTemporalData, loadGenericData } from './csvLoader.js';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let showTData = false;
let showHEData = true;
let showSData = true;

let showXAxis = true;
let showYAxis = true;

let rawData;
let rawDataSig;

let features = "topo";
let response = "ACTIVITY";
let responses = ["ACTIVITY", "GROWTH", "SYMMETRY"];
let model = "MLR";
let models = ["MLR", "RF", "SVR", "MLP"];

let dataPath = "data/predicted/temporal.csv"
let sigPath = "data/predicted/temporal_sig.csv"

const saveButtonId = 'saveButton';

const render = () => {
    // Save button
    if (!document.getElementById(saveButtonId)) {
        const saveButton = document.createElement('button');
        saveButton.id = saveButtonId;
        saveButton.textContent = 'Save SVG';

        saveButton.addEventListener('click', () => {
            // Get the SVG element
            const svgElement = document.querySelector('svg');

            const leftPatternDef = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            leftPatternDef.innerHTML = `
        <pattern id="left-diagonal-stripe" patternUnits="userSpaceOnUse" width="30" height="30">
            <rect width="30" height="30" fill="none" />
            <line x1="0" y1="0" x2="30" y2="30" stroke="#CCCCCC" stroke-width="3" />
        </pattern>`;
            svgElement.appendChild(leftPatternDef);

            const rightPatternDef = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            rightPatternDef.innerHTML = `
        <pattern id="right-diagonal-stripe" patternUnits="userSpaceOnUse" width="30" height="30">
            <rect width="30" height="30" fill="none" />
            <line x1="0" y1="30" x2="30" y2="0" stroke="#8cd5f5" stroke-width="3" />
        </pattern>`;

            svgElement.appendChild(rightPatternDef);
            // Get the SVG markup
            const svgMarkup = new XMLSerializer().serializeToString(svgElement);

            // Create a new Blob object from the SVG markup
            const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });

            // Create a URL for the Blob object
            const url = URL.createObjectURL(blob);

            // Create a new link element
            const link = document.createElement('a');
            link.download = "temp_plot_" + response + "_(" + features + ")_" + model + ".svg";
            link.href = url;

            // Simulate a click on the link element to trigger the download
            link.click();
        });
        document.body.appendChild(saveButton);
    };

    // Dropdowns
    select("#response-menu")
        .call(dropDownMenu, {
            options: responses,
            onOptionClicked: onResponseClicked
        });

    select("#model-menu")
        .call(dropDownMenu, {
            options: models,
            onOptionClicked: onModelClicked
        });

    // Checkbox
    select("#T-checkbox")
        .call(checkBox, {
            checked: false,
            onCheckClicked: check => {
                showTData = check;
                render();
            }
        });

    select("#x-check")
        .call(checkBox, {
            checked: true,
            onCheckClicked: check => {
                showXAxis = check;
                render();
            }
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
        const filteredDataset = dataset.filter((row, index) => {
            let modelMatch = row["model"] === model;
            let responseMatch = row["response"] === response;

            let featureMatch;
            if (showTData && showHEData && showSData) {
                featureMatch = row["feature"] === "naive" || row["feature"] === "topo" || row["feature"] === "spatial";
            } else if (showTData && showHEData) {
                featureMatch = row["feature"] === "naive" || row["feature"] === "topo";
            } else if (showTData && showSData) {
                featureMatch = row["feature"] === "naive" || row["feature"] === "spatial";
            } else if (showHEData && showSData) {
                featureMatch = row["feature"] === "topo" || row["feature"] === "spatial";
            } else if (showTData) {
                featureMatch = row["feature"] === "naive";
            } else if (showHEData) {
                featureMatch = row["feature"] === "topo";
            } else if (showSData) {
                featureMatch = row["feature"] === "spatial";
            }
            return modelMatch && responseMatch;
        });

        return filteredDataset;
    };

    const filterDataSig = (dataset) => {
        const filteredDataset = dataset.filter((row, index) => {
            let modelMatch = row["model"] === model;
            let responseMatch = row["response"] === response;

            return modelMatch && responseMatch;
        });

        return filteredDataset;
    };


    let filteredData = filterData(rawData);
    let filteredDataSig = filterDataSig(rawDataSig);


    // Plot
    const margin = { top: 60, right: 40, bottom: 88, left: 150 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    svg.call(linePlot, {
        xValue: d => d["timepoint"] - 1,
        yValue: d => d["rmse_mean"],
        margin: margin,
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        data: filteredData,
        dataSig: filteredDataSig,
        type: "temporal",
        showXAxis: showXAxis,
        showYAxis: showYAxis,
        includeCH: true
    });

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
const dataPromise = loadTemporalData(dataPath).then(newData => {
    rawData = newData;
});

const dataPromise2 = loadGenericData(sigPath).then(newDataSig => {
    rawDataSig = newDataSig;
});

Promise.all([dataPromise, dataPromise2]).then(() => { render(); });

const onResponseClicked = resp => {
    response = resp;
    render();
};

const onModelClicked = mod => {
    model = mod;
    render();
};
