import {
    csv,
} from 'https://cdn.skypack.dev/d3@5.16.0';

export const loadParityData = (data_path) => {
    return csv(data_path).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            d["timepoint"] = +d["timepoint"];
            d["y_pred"] = +d["y_pred"];
            d["y_true"] = +d["y_true"];
        });
        return data;
    })
};

export const loadBarData = (data_path) => {
    return csv(data_path).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            d["timepoint"] = +d["timepoint"];
            d["r2"] = +d["r2"];
            d["r2_se"] = +d["r2_se"];
            d["rmse"] = +d["rmse"];
            d["rmse_se"] = +d["rmse_se"];
        });
        return data;
    })
};


export const loadQuantityData = (data_path) => {
    return csv(data_path).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            d["num_observations"] = +d["num_observations"];
            d["timepoint"] = +d["timepoint"];
            d["r2_mean"] = +d["r2_mean"];
            d["r2_se_lower"] = +d["r2_se_lower"];
            d["r2_se_upper"] = +d["r2_se_upper"];
            d["rmse_mean"] = +d["rmse_mean"];
            d["rmse_se_lower"] = +d["rmse_se_lower"];
            d["rmse_se_upper"] = +d["rmse_se_upper"];
        });
        return data;
    })
};

export const loadTemporalData = (data_path) => {
    return csv(data_path).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            d["timepoint"] = +d["timepoint"];
            d["r2_mean"] = +d["r2_mean"];
            d["r2_se_lower"] = +d["r2_se_lower"];
            d["r2_se_upper"] = +d["r2_se_upper"];
            d["rmse_mean"] = +d["rmse_mean"];
            d["rmse_se_lower"] = +d["rmse_se_lower"];
            d["rmse_se_upper"] = +d["rmse_se_upper"];
        });
        return data;
    })
};

export const loadR2Data = (data_path) => {
    return csv(data_path).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            d["R^2"] = +d["R^2"];
            d["timepoint"] = +d["timepoint"];
        });
        return data;
    })
};

export const loadRnnBarData = (data_path) => {
    return csv(data_path).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            d["timepoint"] = +d["timepoint"];
            d["r2"] = +d["r2"];
            d["r2_se"] = +d["r2_se"];
            d["rmse"] = +d["rmse"];
            d["rmse_se"] = +d["rmse_se"];
        });
        return data;
    })
};

export const loadParityPCAData = (data_path) => {
    return csv(data_path).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            d["PC1"] = +d["PC1"];
            d["PC2"] = +d["PC2"];
            d["PC3"] = +d["PC3"];
            d["PC4"] = +d["PC4"];
            d["PC5"] = +d["PC5"];
            d["PC6"] = +d["PC6"];
            d["PC7"] = +d["PC7"];
            d["PC8"] = +d["PC8"];
            d["PC9"] = +d["PC9"];
            d["PC10"] = +d["PC10"];

        });
        return data;
    })
}
