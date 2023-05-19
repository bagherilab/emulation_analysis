import {
    select,
} from 'https://cdn.skypack.dev/d3@5.16.0';

import { dropDownMenu } from './dropdown.js';
import { checkBox } from './checkbox.js';
import { parityPlot } from './plotting.js';
import { loadTrueData, loadPredData } from './csvLoader.js';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let showCData = true;
let showCHData = true;

let trueDataC;
let predDataC;
let trueDataCH;
let predDataCH;

let features = "naive"
let response = "ACTIVITY";
let responses = ["ACTIVITY", "GROWTH", "SYMMETRY"];
let model = "MLR";
let models = ["MLR", "RF", "SVR", "MLP"];
let time = "0";

let trueDataPathC = "data/true/C-feature_0.0_metric_15-04032023.csv";
let predDataPathC = "data/predicted/" + features + "_" + time + "_metric_15_C/COUPLED-C-" + response + "/combined.csv";
let trueDataPathCH = "data/true/CH-feature_0.0_metric_15-04032023.csv";
let predDataPathCH = "data/predicted/" + features + "_" + time + "_metric_15_CH/COUPLED-CHX-" + response + "/combined.csv";


const render = () => {
    // Save button
    if (!document.querySelector('button')) {
        document.body.appendChild(saveButton);
    }

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
            options: ["0", "8", "15"],
            onOptionClicked: onTimeClicked
        });

    select("#feature-menu")
        .call(dropDownMenu, {
            options: ["naive", "topo", "spatial"],
            onOptionClicked: onFeatureClicked
        });
    // Checkbox
    select("#c-checkbox")
        .call(checkBox, {
            checked: true,
            onCheckClicked: check => {
                showCData = check;
                render();
            }
        });

    select("#ch-checkbox")
        .call(checkBox, {
            checked: true,
            onCheckClicked: check => {
                showCHData = check;
                render();
            }
        });

    const combinedData = (trueData, predData) => {
        let combinedData = [];
        for (let i = 0; i < trueData.length; i++) {
            combinedData.push({
                "y_true": trueData[i][response],
                "y_pred": predData[i][model],
                "set": predData[i]["set"]
            });
        }
        return combinedData;
    };

    // Combine true and predicted data and plot
    let dataC = null;
    let dataCH = null;
    if (showCData) {
        dataC = combinedData(trueDataC, predDataC);
    };
    if (showCHData) {
        dataCH = combinedData(trueDataCH, predDataCH);
    };

    // Plot
    svg.call(parityPlot, {
        xValue: d => d["y_pred"],
        yValue: d => d["y_true"],
        circleRadius: 9,
        margin: { top: 60, right: 40, bottom: 88, left: 150 },
        width: width,
        height: height,
        dataC: dataC,
        dataCH: dataCH
    });
};

// Create a new button element
const saveButton = document.createElement('button');
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
    link.download = response + "_(" + features + "_" + time + ")_" + model + ".svg";
    link.href = url;

    // Simulate a click on the link element to trigger the download
    link.click();
});

if (showCData) {
    const trueDataPromise = loadTrueData(trueDataPathC, responses).then(newData => {
        trueDataC = newData;
    });
    const predDataPromise = loadPredData(predDataPathC, models).then(newData => {
        predDataC = newData;
    });

    Promise.all([trueDataPromise, predDataPromise]).then(() => {
        console.log(predDataC)
        render();
    });
};

if (showCHData) {
    const trueDataPromise = loadTrueData(trueDataPathCH, responses).then(newData => {
        trueDataCH = newData;
    });
    const predDataPromise = loadPredData(predDataPathCH, models).then(newData => {
        predDataCH = newData;
    });

    Promise.all([trueDataPromise, predDataPromise]).then(() => {
        render();
    });
};



const onResponseClicked = resp => {
    response = resp;
    // Load predicted data
    predDataPathC = "data/predicted/" + features + "_" + time + "_metric_15_C/COUPLED-C-" + response + "/combined.csv";
    predDataPathCH = "data/predicted/" + features + "_" + time + "_metric_15_CH/COUPLED-CHX-" + response + "/combined.csv";

    if (showCData) {
        loadPredData(predDataPathC, models).then(newData => {
            predDataC = newData;
        });
    }
    if (showCHData) {
        loadPredData(predDataPathCH, models).then(newData => {
            predDataCH = newData;
        });
    }
    render();
};

const onModelClicked = mod => {
    model = mod;
    // Load predicted data
    render();
};

const onTimeClicked = t => {
    time = t;
    // Load predicted data
    predDataPathC = "data/predicted/" + features + "_" + time + "_metric_15_C/COUPLED-C-" + response + "/combined.csv";
    predDataPathCH = "data/predicted/" + features + "_" + time + "_metric_15_CH/COUPLED-CHX-" + response + "/combined.csv";

    if (showCData) {
        loadPredData(predDataPathC, models).then(newData => {
            predDataC = newData;
        });
    }
    if (showCHData) {
        loadPredData(predDataPathCH, models).then(newData => {
            predDataCH = newData;
        });
    }
    render();
};

const onFeatureClicked = feat => {
    features = feat;
    // Load predicted data
    predDataPathC = "data/predicted/" + features + "_" + time + "_metric_15_C/COUPLED-C-" + response + "/combined.csv";
    predDataPathCH = "data/predicted/" + features + "_" + time + "_metric_15_CH/COUPLED-CHX-" + response + "/combined.csv";

    if (showCData) {
        loadPredData(predDataPathC, models).then(newData => {
            predDataC = newData;
        });
    }
    if (showCHData) {
        loadPredData(predDataPathCH, models).then(newData => {
            predDataCH = newData;
        });
    }
    render();
};