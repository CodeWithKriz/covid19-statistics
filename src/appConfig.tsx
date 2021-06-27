const config = {
    webServer: {
        host: 'http://127.0.0.1:5000/api/v1/covid_api'
    },
    covidAPI: {
        countries: 'https://covid-193.p.rapidapi.com/countries',
        statistics: 'https://covid-193.p.rapidapi.com/statistics',
        history: 'https://covid-193.p.rapidapi.com/history',
    },
    img: {
        loadingGIF: 'https://media.giphy.com/media/hWZBZjMMuMl7sWe0x8/giphy.gif'
    }
}

export default config;
