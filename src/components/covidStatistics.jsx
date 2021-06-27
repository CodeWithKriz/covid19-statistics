import React, { Component } from 'react';
import { Dropdown } from 'semantic-ui-react'
import { Button } from 'react-bootstrap';

import GraphChart from './covidHistoryChart';
import config from '../appConfig';

function commaSeparatedNum(data) {
    return data ? data.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0;
}

export default class covidStatistics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            apiResponse: '',
            countryCount: '',
            countryList: [],
            countryOptions: [],
            countrySelected: '',
            covidStatisticsAPI: '',
            covidStatistics: [],
            covidHistoryAPI: '',
            covidHistory: {},
            error: '',
        };
    }
    getCountryOptions (args) {
        var countryOptions = [];
        var globalValue = 'All';
        countryOptions.push({
            value: globalValue,
            name: String(globalValue).toLowerCase(),
            text: globalValue,
        });
        for (let index = 0; args['countries'][index]; index++) {
            countryOptions.push({
                value: args['countries'][index],
                name: String(args['countries'][index]).toLowerCase(),
                text: args['countries'][index],
            });
        }
        return countryOptions;
    }
    getCovidStatistics(args) {
        var result = [];
        for (let index = 0; args['countries'][index]; index++) {
            if (args['countries'][index]['continent'] !== args['countries'][index]['country'])
                result.push(args['countries'][index]);
        }
        return result;
    }
    getCovidHistory(args) {
        var result = {
            totalCases: [],
            totalDeaths: [],
            totalActive: [],
            dateTime: []
        };
        var dateArray = [];
        let curr_date = new Date();
        curr_date.setDate(curr_date.getDate() - 179);
        for (let i=0; i < args['data'].length; i++) {
            let date_inst = new Date(args['data'][i]['time']);
            if (( date_inst > curr_date ) && ( dateArray.indexOf(date_inst.toLocaleDateString().split(",")[0]) === -1 )) {
                dateArray.push(date_inst.toLocaleDateString().split(",")[0]);
                result['totalCases'].push(args['data'][i]['cases']['total']);
                result['totalDeaths'].push(args['data'][i]['deaths']['total']);
                result['totalActive'].push(args['data'][i]['cases']['active']);
                result['dateTime'].push(date_inst.toLocaleDateString().split(",")[0]);
            }
        }
        return result;
    }
    async componentDidMount() {
        try {
            var countryQueryArgs = { url: config.covidAPI.countries, }
            let countryData = await fetch(`${config.webServer.host}?query=${encodeURIComponent(JSON.stringify(countryQueryArgs))}`);
            countryData = await countryData.json();
            let covidStatisticsArgs = { url: config.covidAPI.statistics, }
            let covidStatistics = await fetch(`${config.webServer.host}?query=${encodeURIComponent(JSON.stringify(covidStatisticsArgs))}`);
            covidStatistics = await covidStatistics.json();
            this.setState({
                apiResponse: countryData,
                countryCount: countryData.response.length,
                countryList: [...['All'], ...countryData.response],
                countryOptions: this.getCountryOptions({ countries: [...countryData.response] }),
                countrySelected: 'All',
                covidStatisticsAPI: covidStatistics,
                covidStatistics: this.getCovidStatistics({ countries: [...covidStatistics.response] }),
            });
            let covidHistoryArgs = { url: config.covidAPI.history, params: {country: 'All'} }
            let covidHistoryAPI = await fetch(`${config.webServer.host}?query=${encodeURIComponent(JSON.stringify(covidHistoryArgs))}`);
            covidHistoryAPI = await covidHistoryAPI.json();
            let getCovidHistory = this.getCovidHistory({ data: [...covidHistoryAPI.response] });
            this.setState({
                covidHistoryAPI: covidHistoryAPI,
                covidHistory: getCovidHistory,
            });
        } catch (err) {
            this.setState({
                error: JSON.stringify(err),
                apiResponse: '',
                covidStatisticsAPI: '',
                covidHistoryAPI: '',
            });
            alert(err);
        }
    }
    handleResetCountry = async (event, data) => {
        if (this.state.countrySelected !== 'All') {
            this.setState({ apiResponse: '', covidStatisticsAPI: '', covidHistoryAPI: '', });
            this.componentDidMount();
        }
    };
    handleCountryChange = async (event, data) => {
        var eventHandled = {
            event: event.target.value,
            data: data.value,
        }
        let covidStatisticsArgs = { url: config.covidAPI.statistics, };
        if (data.value !== 'All') {
            covidStatisticsArgs['params'] = { country: data.value, };
        }
        try {
            this.setState({ covidStatisticsAPI: '', covidHistoryAPI: '', });
            let covidStatistics = await fetch(`${config.webServer.host}?query=${encodeURIComponent(JSON.stringify(covidStatisticsArgs))}`);
            covidStatistics = await covidStatistics.json();
            this.setState({
                countrySelected: eventHandled['data'],
                covidStatisticsAPI: covidStatistics,
                covidStatistics: this.getCovidStatistics({ countries: covidStatistics.response }),
            });
            let covidHistoryArgs = {
                url: config.covidAPI.history,
                params: { country: data.value, }
            }
            let covidHistoryAPI = await fetch(`${config.webServer.host}?query=${encodeURIComponent(JSON.stringify(covidHistoryArgs))}`);
            covidHistoryAPI = await covidHistoryAPI.json();
            let getCovidHistory = this.getCovidHistory({ data: [...covidHistoryAPI.response] });
            this.setState({
                covidHistoryAPI: covidHistoryAPI,
                covidHistory: getCovidHistory,
            });
            console.log(this.state.covidHistory);
        } catch (err) {
            this.setState({
                error: JSON.stringify(err),
                apiResponse: '',
                covidStatisticsAPI: '',
                covidHistoryAPI: '',
            });
        }
    }
    render() {
        const countrySelected = this.state.countrySelected;
        const loadingGIF = config.img.loadingGIF;
        const waitingAPIResp = <img className="loading-gif-style" src={ loadingGIF } alt="#NA"></img>;
        const selectCountry = (() => {
            const ifTrue = (
                <div>
                    <p><strong>Select Country: </strong></p>
                    <Dropdown placeholder="Select Country" fluid search selection
                    options={ this.state.countryOptions } onChange={ this.handleCountryChange }
                    defaultValue={ countrySelected } style={{ width: '25rem', }}
                    />
                    <br />
                    <Button variant="primary" onClick={ this.handleResetCountry }>Reset</Button>
                </div>
            );
            const ifFalse = <p>OOPS! Unable to fetch the Country details.</p>
            return (this.state.countryCount) ? ifTrue : ifFalse;
        })();
        const covidHistoryChart = (() => {
            return (!this.state.covidHistoryAPI) ? waitingAPIResp : (<GraphChart covidHistory={this.state.covidHistory} />);
        })();
        const getTotalStatistics = (() => {
            var covidStatistics = this.state.covidStatistics;
            var totalCases = 0, totalActive = 0, totalCritical = 0, totalRecovered = 0, totalDeaths = 0, totalTests = 0;
            var totalCasesNew = 0, totalDeathsNew = 0;
            for (let idx=0; covidStatistics[idx]; idx++) {
                totalCases += covidStatistics[idx]['cases']['total'] ? covidStatistics[idx]['cases']['total'] : 0;
                totalCasesNew += parseInt(covidStatistics[idx]['cases']['new']) ? parseInt(covidStatistics[idx]['cases']['new']) : 0;
                totalActive += covidStatistics[idx]['cases']['active'] ? covidStatistics[idx]['cases']['active'] : 0;
                totalCritical += covidStatistics[idx]['cases']['critical'] ? covidStatistics[idx]['cases']['critical'] : 0;
                totalRecovered += covidStatistics[idx]['cases']['recovered'] ? covidStatistics[idx]['cases']['recovered'] : 0;
                totalDeaths += covidStatistics[idx]['deaths']['total'] ? covidStatistics[idx]['deaths']['total'] : 0;
                totalDeathsNew += parseInt(covidStatistics[idx]['deaths']['new']) ? parseInt(covidStatistics[idx]['deaths']['new']) : 0;
                totalTests += covidStatistics[idx]['tests']['total'] ? covidStatistics[idx]['tests']['total'] : 0;
            }
            const totalCasesNewTag = <span className="new-cases-span">( { '+ ' + commaSeparatedNum(totalCasesNew) } )</span>
            const totalDeathsNewTag = <span className="new-cases-span">( { '+ ' + commaSeparatedNum(totalDeathsNew) } )</span>
            const totalCasesTag = <tr><td>Total Cases</td><td>{ commaSeparatedNum(totalCases) } { totalCasesNewTag }</td></tr>;
            const totalActiveTag = <tr><td>Total Active</td><td>{ commaSeparatedNum(totalActive) }</td></tr>;
            const totalCriticalTag = <tr><td>Total Critical</td><td>{ commaSeparatedNum(totalCritical) }</td></tr>;
            const totalRecoveredTag = <tr><td>Total Recovered</td><td>{ commaSeparatedNum(totalRecovered) }</td></tr>;
            const totalDeathsTag = <tr><td>Total Deaths</td><td>{ commaSeparatedNum(totalDeaths) } { totalDeathsNewTag }</td></tr>;
            const totalTestsTag = <tr><td>Total Tests</td><td>{ commaSeparatedNum(totalTests) }</td></tr>;
            return (<tbody className="font-weight-bold">
                { totalCasesTag }
                { totalActiveTag }
                { totalCriticalTag }
                { totalRecoveredTag }
                { totalDeathsTag }
                { totalTestsTag }
            </tbody>);
        })();
        const covidStatistics = (
            <div>
                <p className="font-header-3">Region: { countrySelected }</p>
                <table className="covid-statistics-table">
                    <tbody>
                    <tr style={{ textAlign: 'center', }}>
                        <td>Covid Statistics</td>
                    </tr>
                    <tr>
                        <td>
                        <table>
                            { getTotalStatistics }
                        </table>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );
        const getTotalPopulation = (() => {
            var covidStatistics = this.state.covidStatistics;
            var totalPopulation = 0;
            for (let idx=0; covidStatistics[idx]; idx++) {
                totalPopulation += covidStatistics[idx]['population']
            }
            return totalPopulation
        })();
        const populationTable = (
            <div>
                <p className="font-header-4">Total Population</p>
                <div className="scrollable-population-table">
                    <table className="total-population-table">
                        <thead className="font-weight-bold">
                            <tr>
                                <th>Continent</th>
                                <th>Country</th>
                                <th>Population</th>
                            </tr>
                        </thead>
                        <tbody>
                            { (() => {
                                if (countrySelected === 'All') {
                                    return (
                                        <tr key='All'>
                                            <td>All</td>
                                            <td>All</td>
                                            <td>{ getTotalPopulation ? commaSeparatedNum(getTotalPopulation) : null }</td>
                                        </tr>
                                    );
                                }
                            })() }
                            { this.state.covidStatistics.map((data) => (
                                <tr key={ data['country'] }>
                                    <td>{ data['continent'] }</td>
                                    <td>{ data['country'] }</td>
                                    <td>{ data['population'] ? commaSeparatedNum(data['population']) : null }</td>
                                </tr>
                            )) }
                        </tbody>
                    </table>
                </div>
            </div>
        );
        const countryMainContent = (() => {
            const messages = <p className="font-header-3">Reported Cases and Deaths by Country or Territory</p>;
            const errorMessage = <div><p className="header-title">[Error]</p><p>Unable to fetch the Covid Statistics Report</p></div>;
            const listCovidStats = (() => {
                return (!this.state.covidStatisticsAPI) ? waitingAPIResp : <div>{ covidStatistics }</div>;
            })();
            const listPopulationTable = (() => {
                return (!this.state.covidStatisticsAPI) ? waitingAPIResp : <div>{ populationTable }</div>;
            })();
            const listContent = (
                <div className='default-app-settings'>
                    <table className='country-graph-table'>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: 'left', }}> { messages } { selectCountry } <br /> { listCovidStats } </td>
                                <td style={{ float: 'right', }}> { covidHistoryChart } <br /> { listPopulationTable } </td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                </div>
            );
            return this.state.error ? errorMessage : (!this.state.apiResponse) ? waitingAPIResp  : listContent;
        })();
        return <div>{ countryMainContent }</div>;
    }
}