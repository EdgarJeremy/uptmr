import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import SiriusAdapter from '@edgarjeremy/sirius.adapter';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Loading from './components/Loading';

const adapter = new SiriusAdapter('http://localhost', 1234, localStorage);

class App extends React.Component {

  state = {
    ready: false,
    models: null,
    authProvider: null
  }

  componentDidMount() {
    adapter.connect().then((models) => {
      const authProvider = adapter.getAuthProvider();
      this.setState({ ready: true, models, authProvider });
    }).catch(() => {
      alert('server error');
    });
  }

  render() {
    const { ready, models, authProvider } = this.state;
    return (
      ready ? (
        <Router>
          <Switch>
            <Route exact path="/" render={(p) => <Login {...p} models={models} authProvider={authProvider} />} />
            <Route path="/dashboard" render={(p) => <Dashboard {...p} models={models} authProvider={authProvider} />} />
          </Switch>
        </Router>
      ) : (
        <Loading />
      )
    )
  }

}

export default App;
