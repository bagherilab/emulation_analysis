import {
    select,
} from 'https://cdn.skypack.dev/d3@5.16.0';

import { dropDownMenu } from './dropdown.js';
import { checkBox } from './checkbox.js';
import { linePlot } from './plotting.js';
import { loadQuantityData } from './csvLoader.js';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let showTData = false;
let showHEData = true;
let showSData = true;

let showXAxis = true;
let showYAxis = true;

let rawData;

let context = "C";
let contexts = ["C", "CH"];
let response = "ACTIVITY";
let responses = ["ACTIVITY", "GROWTH", "SYMMETRY"];
let model = "MLR";
let models = ["MLR", "RF", "SVR", "MLP"];
let time = "0";
let times = ["0", "8", "15"];

let dataPath = "data/predicted/quant.csv"

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
            let feature;
            if (showSData) {
                feature = "spatial";
            } else if (showHEData) {
                feature = "topo";
            } else {
                feature = "naive"
            }
            // Create a new link element
            const link = document.createElement('a');
            link.download = "quant_plot_" + response + "_(" + feature + ")_" + model + ".svg";
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

    const filterData = (dataset) => {
        const filteredDataset = dataset.filter((row, index) => {
            let modelMatch = row["model"] === model;
            let responseMatch = row["response"] === response;
            let contextMatch = row["context"] === context;
            let timeMatch = parseInt(row["timepoint"]) === parseInt(time);

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
            return modelMatch && responseMatch && featureMatch && timeMatch && contextMatch;
        });

        return filteredDataset;
    };


    let filteredData = filterData(rawData);

    // Plot
    const margin = { top: 60, right: 40, bottom: 88, left: 150 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    svg.call(linePlot, {
        xValue: d => d["num_observations"],
        yValue: d => d["rmse_mean"],
        margin: margin,
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        data: filteredData,
        type: "quantity",
        showXAxis: showXAxis,
        showYAxis: showYAxis,
        includeCH: false
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
const dataPromise = loadQuantityData(dataPath).then(newData => {
    rawData = newData;
});
Promise.all([dataPromise]).then(() => { render(); });


const onResponseClicked = resp => {
    response = resp;
    render();
};

const onTimeClicked = t => {
    time = t;
    render();
};

const onModelClicked = mod => {
    model = mod;
    render();
};

const onContextClicked = cont => {
    context = cont;
    render();
};