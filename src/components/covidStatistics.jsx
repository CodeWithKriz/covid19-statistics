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
        for (let index = 0; args['countries'][index]; index++) {
            countryOptions.push({
                value: args['countries'][index],
                name: String(args['countries'][index]).toLowerCase(),
                text: args['countries'][index],
            });
        }
        return countryOptions;
    }
    getCovidHistory(args) {
        var result = {
            totalCases: [],
            totalDeaths: [],
            totalActive: [],
            dateTime: []
        };
        let dateArray = [];
        let sortedArray = args['data'];
        sortedArray.sort((a, b) => {
            var keyA = new Date(a["day"]),
            keyB = new Date(b["day"]);
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });
        for (let i=0; i < sortedArray.length; i++) {
            // let date_inst = new Date(sortedArray[i]['time']);
            // let dateToString = date_inst.toLocaleDateString().split(",")[0];
            let eachDate = new Date(sortedArray[i]['day']);
            eachDate = eachDate.toLocaleDateString().split(",")[0];
            if (dateArray.indexOf(eachDate) === -1) {
                result['totalCases'].push(sortedArray[i]['cases']['total']);
                result['totalDeaths'].push(sortedArray[i]['deaths']['total']);
                result['totalActive'].push(sortedArray[i]['cases']['active']);
                result['dateTime'].push(eachDate);
                dateArray.push(eachDate);
            }
        }
        return result;
    }
    async componentDidMount() {
        try {
            let countryData = await fetch(`${config.webServer.host}${config.covidAPI.countries}`);
            countryData = await countryData.json();
            countryData = countryData["countries"]
            let covidStatistics = await fetch(`${config.webServer.host}${config.covidAPI.statistics}|All`);
            covidStatistics = await covidStatistics.json();
            covidStatistics = [covidStatistics["statistics"]];
            this.setState({
                apiResponse: countryData,
                countryCount: countryData.length,
                countryList: [...countryData],
                countryOptions: this.getCountryOptions({ countries: [...countryData] }),
                countrySelected: 'All',
                covidStatisticsAPI: covidStatistics,
                covidStatistics: covidStatistics,
            });
            let covidHistoryAPI = await fetch(`${config.webServer.host}${config.covidAPI.history}|All`);
            covidHistoryAPI = await covidHistoryAPI.json();
            covidHistoryAPI = covidHistoryAPI["history"];
            let getCovidHistory = this.getCovidHistory({ data: [...covidHistoryAPI] });
            this.setState({
                covidHistoryAPI: [...covidHistoryAPI],
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
        try {
            this.setState({ covidStatisticsAPI: '', covidHistoryAPI: '', });
            let covidStatistics = await fetch(`${config.webServer.host}${config.covidAPI.statistics}|${data.value}`);
            covidStatistics = await covidStatistics.json();
            covidStatistics = [covidStatistics["statistics"]];
            this.setState({
                countrySelected: eventHandled['data'],
                covidStatisticsAPI: covidStatistics,
                covidStatistics: covidStatistics,
            });
            let covidHistoryAPI = await fetch(`${config.webServer.host}${config.covidAPI.history}|${data.value}`);
            covidHistoryAPI = await covidHistoryAPI.json();
            covidHistoryAPI = covidHistoryAPI["history"];
            let getCovidHistory = this.getCovidHistory({ data: [...covidHistoryAPI] });
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
            const casesChart = (<div>
                <GraphChart chartTitle={"Total Cases"} series={this.state.covidHistory["totalCases"]} labels={this.state.covidHistory["dateTime"]} bgColor={"0, 110, 255"} />
                <GraphChart chartTitle={"Total Deaths"} series={this.state.covidHistory["totalDeaths"]} labels={this.state.covidHistory["dateTime"]} bgColor={"255, 50, 0"} />
                <GraphChart chartTitle={"Total Active"} series={this.state.covidHistory["totalActive"]} labels={this.state.covidHistory["dateTime"]} bgColor={"0, 255, 30"} />
            </div>);
            return (!this.state.covidHistoryAPI) ? waitingAPIResp : <div>{ casesChart }</div>;
        })();
        const getTotalStatistics = (() => {
            var covidStatistics = this.state.covidStatistics;
            var totalCases = 0, totalActive = 0, totalCritical = 0, totalRecovered = 0, totalDeaths = 0, totalTests = 0, totalPopulation = 0;
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
                totalPopulation += covidStatistics[idx]['population'] ? covidStatistics[idx]['population'] : 0;
            }
            const totalCasesNewTag = <span className="new-cases-span">( { '+ ' + commaSeparatedNum(totalCasesNew) } )</span>
            const totalDeathsNewTag = <span className="new-cases-span">( { '+ ' + commaSeparatedNum(totalDeathsNew) } )</span>
            const totalCasesTag = <tr><td>Total Cases</td><td>{ commaSeparatedNum(totalCases) } { totalCasesNewTag }</td></tr>;
            const totalActiveTag = <tr><td>Total Active</td><td>{ commaSeparatedNum(totalActive) }</td></tr>;
            const totalCriticalTag = <tr><td>Total Critical</td><td>{ commaSeparatedNum(totalCritical) }</td></tr>;
            const totalRecoveredTag = <tr><td>Total Recovered</td><td>{ commaSeparatedNum(totalRecovered) }</td></tr>;
            const totalDeathsTag = <tr><td>Total Deaths</td><td>{ commaSeparatedNum(totalDeaths) } { totalDeathsNewTag }</td></tr>;
            const totalTestsTag = <tr><td>Total Tests</td><td>{ totalTests ? commaSeparatedNum(totalTests) : "NA" }</td></tr>;
            const totalPopulationTag = <tr><td>Total Population</td><td>{ totalPopulation ? commaSeparatedNum(totalPopulation) : "NA" }</td></tr>
            return (<tbody className="font-weight-bold">
                { totalCasesTag }
                { totalActiveTag }
                { totalCriticalTag }
                { totalRecoveredTag }
                { totalDeathsTag }
                { totalTestsTag }
                { totalPopulationTag }
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
        const countryMainContent = (() => {
            const messages = <p className="font-header-3">Reported Cases and Deaths by Country or Territory</p>;
            const errorMessage = <div><p className="header-title">[Error]</p><p>Unable to fetch the Covid Statistics Report</p></div>;
            const listCovidStats = (() => {
                return (!this.state.covidStatisticsAPI) ? waitingAPIResp : <div>{ covidStatistics }</div>;
            })();
            const listContent = (
                <div className='default-app-settings'>
                    <table className='country-graph-table'>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: 'left', }}> { messages } { selectCountry } <br /> { listCovidStats } </td>
                                <td style={{ float: 'right', }}> { covidHistoryChart } </td>
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