import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts'

export default class GraphChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [
                { name: 'Total Cases', data: [...this.props.covidHistory['totalCases']], },
                { name: 'Total Deaths', data: [...this.props.covidHistory['totalDeaths']], },
                { name: 'Total Active', data: [...this.props.covidHistory['totalActive']], },
            ],
            options: {
                chart: { height: 350, type: 'area', },
                dataLabels: { enabled: false, },
                stroke: { curve: 'smooth' },
                xaxis: { type: 'datetime', categories: [...this.props.covidHistory['dateTime']], },
                tooltip: { x: { format: 'yyyy-MM-dd' } },
            }
        };
    }
    render() {
        return (
            <div>
                <ReactApexChart options={this.state.options} series={this.state.series} type="area" height={250} style={{ width: '40rem', }} />
            </div>
        );
    }
}
