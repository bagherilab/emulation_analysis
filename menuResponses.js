export const onResponseClicked = resp => {
    response = resp;
    // Load predicted data
    predDataPathC = "data/predicted/" + features + "_" + time + "_metric_15_C/COUPLED-C-" + response + "/" + model + "/";
    predDataPathCH = "data/predicted/" + features + "_" + time + "_metric_15_CH/COUPLED-CHX-" + response + "/" + model + "/";

    if (showCData) {
        loadPredData(predDataPathC).then(newData => {
            predDataC = newData;
        });
    }
    if (showCHData) {
        loadPredData(predDataPathCH).then(newData => {
            predDataCH = newData;
        });
    }
    render();
};

export const onModelClicked = mod => {
    model = mod;
    // Load predicted data
    predDataPathC = "data/predicted/" + features + "_" + time + "_metric_15_C/COUPLED-C-" + response + "/" + model + "/";
    predDataPathCH = "data/predicted/" + features + "_" + time + "_metric_15_CH/COUPLED-CHX-" + response + "/" + model + "/";

    if (showCData) {
        loadPredData(predDataPathC).then(newData => {
            predDataC = newData;
        });
    }
    if (showCHData) {
        loadPredData(predDataPathCH).then(newData => {
            predDataCH = newData;
        });
    }
    render();
};

export const onTimeClicked = t => {
    time = t;
    // Load predicted data
    predDataPathC = "data/predicted/" + features + "_" + time + "_metric_15_C/COUPLED-C-" + response + "/" + model + "/";
    predDataPathCH = "data/predicted/" + features + "_" + time + "_metric_15_CH/COUPLED-CHX-" + response + "/" + model + "/";

    if (showCData) {
        loadPredData(predDataPathC).then(newData => {
            predDataC = newData;
        });
    }
    if (showCHData) {
        loadPredData(predDataPathCH).then(newData => {
            predDataCH = newData;
        });
    }
    render();
};

export const onFeatureClicked = feat => {
    features = feat;
    // Load predicted data
    predDataPathC = "data/predicted/" + features + "_" + time + "_metric_15_C/COUPLED-C-" + response + "/" + model + "/";
    predDataPathCH = "data/predicted/" + features + "_" + time + "_metric_15_CH/COUPLED-CHX-" + response + "/" + model + "/";

    if (showCData) {
        loadPredData(predDataPathC).then(newData => {
            predDataC = newData;
        });
    }
    if (showCHData) {
        loadPredData(predDataPathCH).then(newData => {
            predDataCH = newData;
        });
    }
    render();
};