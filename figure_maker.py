import os
import matplotlib.pyplot as plt
from matplotlib.offsetbox import AnchoredText, OffsetImage


def create_svg_grid(
    images,
    rows,
    cols,
    row_labels=None,
    col_labels=None,
    central_label=None,
    label_axis=False,
    filename="grid.svg",
):
    # Calculate the dimensions of the grid
    grid_width = cols * 4  # Adjust the cell width as needed
    grid_height = rows * 3  # Adjust the cell height as needed

    # Create the figure and axes
    fig, ax = plt.subplots(figsize=(grid_width, grid_height))

    # Remove the axis ticks and labels
    ax.axis("off")

    # Draw labels on the rows if provided
    if row_labels:
        row_label_height = 0.75
        for i, label in enumerate(row_labels):
            anchored_text = AnchoredText(
                label,
                loc="center",
                pad=0.1,
                frameon=False,
                prop=dict(fontsize=14, weight="bold", fontfamily="Helvetica"),
            )
            ax.add_artist(anchored_text)
            anchored_text.set_zorder(10)
            anchored_text.patch.set_alpha(0)  # Make the background transparent
            anchored_text.set_bbox(
                dict(facecolor="none", edgecolor="none")
            )  # Remove the box outline
            anchored_text.set_anchor((0, i * row_label_height), "C")

    # Draw labels on the columns if provided
    if col_labels:
        col_label_width = 1
        for j, label in enumerate(col_labels):
            anchored_text = AnchoredText(
                label,
                loc="center",
                pad=0.1,
                frameon=False,
                prop=dict(fontsize=14, weight="bold", fontfamily="Helvetica"),
            )
            ax.add_artist(anchored_text)
            anchored_text.set_zorder(10)
            anchored_text.patch.set_alpha(0)  # Make the background transparent
            anchored_text.set_bbox(
                dict(facecolor="none", edgecolor="none")
            )  # Remove the box outline
            anchored_text.set_anchor((j * col_label_width, 2), "C")

    # Draw the central label if provided
    if central_label:
        anchored_text = AnchoredText(
            central_label,
            loc="center",
            pad=0.1,
            frameon=False,
            prop=dict(fontsize=14, weight="bold", fontfamily="Helvetica"),
        )
        ax.add_artist(anchored_text)
        anchored_text.set_zorder(10)
        anchored_text.patch.set_alpha(0)  # Make the background transparent
        anchored_text.set_bbox(dict(facecolor="none", edgecolor="none"))  # Remove the box outline
        anchored_text.set_anchor((cols / 2, rows / 2), "C")

    # Draw the grid cells
    for i in range(rows):
        for j in range(cols):
            image_path = images[i * cols + j]  # Assumes images are provided in row-major order

            # Calculate the position of the current cell
            x = j * 1
            y = i * 1

            # Load the image using matplotlib
            img = plt.imread(image_path)

            # Add the image to the grid cell
            offset_image = OffsetImage(img, zoom=1)
            offset_image.set_offset((x, y))
            ax.add_artist(offset_image)

            # Draw labels on the axes if requested
            if label_axis:
                label = f"Row {i}, Col {j}"
                anchored_text = AnchoredText(
                    label,
                    loc="lower left",
                    pad=0.1,
                    frameon=False,
                    prop=dict(fontsize=10, fontfamily="Helvetica"),
                )
                ax.add_artist(anchored_text)
                anchored_text.set_zorder(10)
                anchored_text.patch.set_alpha(0)  # Make the background transparent
                anchored_text.set_bbox(
                    dict(facecolor="none", edgecolor="none")
                )  # Remove the box outline
                anchored_text.set_anchor((x + 0.05, y + 0.95), "SW")

    # Save the figure as an SVG file
    plt.savefig(filename, format="svg")

    # Close the figure
    plt.close(fig)


panel_a = [
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_0)_MLR.svg",
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_0)_RF.svg",
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_0)_SVR.svg",
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_0)_MLP.svg",
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_8)_MLR.svg",
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_8)_RF.svg",
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_8)_SVR.svg",
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_8)_MLP.svg",
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_15)_MLR.svg",
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_15)_RF.svg",
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_15)_SVR.svg",
    "plots/temporal_parity/parity_plot_ACTIVITY_(topo_15)_MLP.svg",
    "plots/temporal_parity/parity_plot_GROWTH_(topo_15)_MLR.svg",
    "plots/temporal_parity/parity_plot_GROWTH_(topo_15)_RF.svg",
    "plots/temporal_parity/parity_plot_GROWTH_(topo_15)_SVR.svg",
    "plots/temporal_parity/parity_plot_GROWTH_(topo_15)_MLP.svg",
    "plots/temporal_parity/parity_plot_SYMMETRY_(topo_15)_MLR.svg",
    "plots/temporal_parity/parity_plot_SYMMETRY_(topo_15)_RF.svg",
    "plots/temporal_parity/parity_plot_SYMMETRY_(topo_15)_SVR.svg",
    "plots/temporal_parity/parity_plot_SYMMETRY_(topo_15)_MLP.svg",
]

row_labels = ["MLR", "RF", "SVR", "MLP"]
col_labels = ["ACTIVITY", "ACTIVITY", "ACTIVITY", "GROWTH", "SYMMETRY"]
central_label = "True"

create_svg_grid(
    panel_a,
    rows=4,
    cols=5,
    row_labels=row_labels,
    col_labels=col_labels,
    central_label=central_label,
    label_axis=False,
    filename="figures/temporal_a.svg",
)
