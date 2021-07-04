import React, { Component } from 'react';

export default class Footer extends Component {
    render() {
        return (
            <div className="footer">
                <span style={{ textAlign: 'left', }}>
                    Developed using:&emsp;
                    <a href="https://reactjs.org/"
                    target="_blank" rel="noreferrer">
                        <i className="fab fa-react"></i>
                    </a>
                    &emsp;
                    <a href="https://mongodb.com/"
                    target="_blank" rel="noreferrer">
                        <i className="fas fa-database"></i>
                    </a>
                    &emsp;
                    <a href="https://github.com/sathish2krishnan/covid19-statistics"
                    target="_blank" rel="noreferrer">
                        <i className="fab fa-github"></i>
                    </a>
                    &emsp;
                    <a href="https://krish-flask-app-v1.herokuapp.com/api/v1/Sathish"
                    target="_blank" rel="noreferrer">
                        <i className="fas fa-server"></i>
                    </a>
                    &emsp;
                    <a href="https://api-sports.io/documentation/covid-19/v1"
                    target="_blank" rel="noreferrer">
                        <i className="fas fa-table"></i>
                    </a>
                </span>
                <span style={{ float: 'right', }}>
                    Developed by:&emsp;
                    <a href="https://www.linkedin.com/in/sathish-krishnan-venkatachalam-b9a002137/"
                    target="_blank" rel="noreferrer">
                        <i className="fab fa-linkedin"></i>
                    </a>
                </span>
            </div>
        );
    }
}
