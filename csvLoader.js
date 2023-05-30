import {
    csv,
} from 'https://cdn.skypack.dev/d3@5.16.0';

export const loadParityPredData = (predDataPath, models) => {
    return csv(predDataPath).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            models.forEach(model => {
                d[model] = +d[model];
            });
            d["set"] = d["set"];
        });
        return data;
    });
};

export const loadParityTrueData = (trueDataPath, responses) => {
    return csv(trueDataPath).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            responses.forEach(response => {
                d[response] = +d[response];
            });
        });
        return data;
    });
};


export const loadBarData = (data_path) => {
    return csv(data_path).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            d["R^2"] = +d["R^2"];
            d["set"] = d["set"];
            d["model"] = d["model"];
            d["context"] = d["context"];
            d["response"] = d["response"];
            d["feature"] = d["feature"];
        });
        return data;
    })
};


export const loadQuantityData = (data_path) => {
    return csv(data_path).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            d["R^2"] = +d["R^2"];
            d["num_observations"] = +d["num_observations"];
            d["se_lower"] = +d["se_lower"];
            d["se_upper"] = +d["se_upper"];
            d["timepoint"] = +d["timepoint"];
            d["set"] = d["set"];
            d["model"] = d["model"];
            d["context"] = d["context"];
            d["response"] = d["response"];
            d["feature"] = d["feature"];
        });
        return data;
    })
};

export const loadTemporalData = (data_path) => {
    return csv(data_path).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            d["se_lower"] = +d["se_lower"];
            d["se_upper"] = +d["se_upper"];
            d["R^2"] = +d["R^2"];
            d["timepoint"] = +d["timepoint"];
            d["set"] = d["set"];
            d["model"] = d["model"];
            d["context"] = d["context"];
            d["response"] = d["response"];
        });
        return data;
    })
};