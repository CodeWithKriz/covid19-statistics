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
