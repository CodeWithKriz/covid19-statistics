import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import './styles/App.css';
import CovidStatistics from './components/covidStatistics';
import Header from './components/header';
import Footer from './components/footer';

function App() {
  return (
    <div className="content">
      <Router>
        <Header />
            <Switch>
                <Route exact path="/covid19-statistics"> <CovidStatistics /> </Route>
            </Switch>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
