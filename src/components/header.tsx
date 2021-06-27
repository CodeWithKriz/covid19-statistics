import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Header extends Component {
    render() {
        return (
            <div>
                <p className="header-title">
                <Link to="/covid19-statistics">
                    <img src={ process.env.PUBLIC_URL + "/static/img/Covid19.png" }
                    alt="#NA" width={50}></img>
                    &nbsp;Covid'19 Statistics
                </Link>
                </p>
            </div>
        );
    }
}
