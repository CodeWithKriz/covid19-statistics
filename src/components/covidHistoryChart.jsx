import React, { Component } from 'react';
import { Line } from "react-chartjs-2";

export default class GraphChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: 'line',
            labels: [...this.props.labels],
            datasets: [
                {
                  label: this.props.chartTitle,
                  data: [...this.props.series],
                  fill: true,
                  backgroundColor: `rgba(${this.props.bgColor}, 0.2)`,
                  borderColor: `rgba(${this.props.bgColor}, 1)`,
                  pointRadius: 0,
                },
            ],
            options: {
                responsive: true,
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
            }
        };
    }
    render() {
        return (
            <div>
                <Line data={this.state} height={150} style={{ width: '35rem', }} />
            </div>
        );
    }
}
