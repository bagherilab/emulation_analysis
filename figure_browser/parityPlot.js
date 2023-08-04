import {
    select,
} from 'https://cdn.skypack.dev/d3@5.16.0';

import { dropDownMenu } from './dropdown.js';
import { checkBox } from './checkbox.js';
import { parityPlot } from './plotting.js';
import { loadParityData, loadR2Data } from './csvLoader.js';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let showTData = false;
let showHEData = true;
let showSData = true;

let showXAxis = true;
let showYAxis = true;

let showInitial = false;

let rawData;
let r2Data;

let context = "C";
let contexts = ["C", "CH"];
let response = "ACTIVITY";
let responses = ["ACTIVITY", "GROWTH", "SYMMETRY"];
let model = "MLR";
let models = ["MLR", "RF", "SVR", "MLP"];
let time = "0";
let times = ["0", "8", "15"];

let dataPath = "data/predicted/parity.csv"
// let dataPath = "data/predicted/parity_tp8.csv"

const saveButtonId = 'saveButton';

const render = () => {
    // Save button
    if (!document.getElementById(saveButtonId)) {
        const saveButton = document.createElement('button');
        saveButton.id = saveButtonId;
        saveButton.textContent = 'Save SVG';

        saveButton.addEventListener('click', () => {
            const svgElement = document.querySelector('svg');

            const svgMarkup = new XMLSerializer().serializeToString(svgElement);

            const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });

            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            let feature;
            if (showSData) {
                feature = "spatial";
            } else if (showHEData) {
                feature = "topo";
            } else {
                feature = "naive"
            }
            link.download = "parity_plot_" + response + "_(" + feature + "_" + time + ")_" + model + ".svg";
            link.href = url;

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

    select("#time-menu")
        .call(dropDownMenu, {
            options: times,
            onOptionClicked: onTimeClicked
        });

    select("#context-menu")
        .call(dropDownMenu, {
            options: contexts,
            onOptionClicked: onContextClicked
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

    select("#HE-checkbox")
        .call(checkBox, {
            checked: true,
            onCheckClicked: check => {
                showHEData = check;
                render();
            }
        });

    select("#S-checkbox")
        .call(checkBox, {
            checked: true,
            onCheckClicked: check => {
                showSData = check;
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

    select("#initial-check")
        .call(checkBox, {
            checked: false,
            onCheckClicked: check => {
                showInitial = check;
                render();
            }
        });

    const filterData = (dataset) => {
        const filteredDataset = dataset.filter((row, index) => {
            let modelMatch = row["model"] === model;
            let responseMatch = row["response"] === response;
            let contextMatch = row["context"] === context;


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

            let timeMatch;
            if (showInitial) {
                timeMatch = parseInt(row["timepoint"]) === parseInt(time) || parseInt(row["timepoint"]) === 0;
            } else {
                timeMatch = parseInt(row["timepoint"]) === parseInt(time);
            }

            return modelMatch && responseMatch && featureMatch && contextMatch && timeMatch;
        });
        return filteredDataset;

    };

    let filteredData = filterData(rawData);

    // Plot
    const margin = { top: 60, right: 40, bottom: 88, left: 150 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    svg.call(parityPlot, {
        xValue: d => d["y_pred"],
        yValue: d => d["y_true"],
        circleRadius: 6,
        margin: { top: 60, right: 40, bottom: 88, left: 150 },
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        data: filteredData,
        r2Data: [],
        showXAxis: showXAxis,
        showYAxis: showYAxis,
        time: parseInt(time),
        showInitial: showInitial,
        showML: false
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
const dataPromise = loadParityData(dataPath).then(newData => {
    rawData = newData;
});

Promise.all([dataPromise]).then(() => { render(); });



const onResponseClicked = resp => {
    response = resp;
    render();
};

const onModelClicked = mod => {
    model = mod;
    render();
};

const onTimeClicked = t => {
    time = t;
    render();
};

const onContextClicked = cont => {
    context = cont;
    render();
};