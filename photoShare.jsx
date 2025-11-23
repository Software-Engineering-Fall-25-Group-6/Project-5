import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Grid,Paper } from '@mui/material';
import './styles/main.css';
import api from './lib/api';
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/loginRegister/LoginRegister';  

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mainContent: '',
      loggedIn: false,         
      currentUser: null,
      refreshTick: 0        
    };

    this.setTopBarContext = this.setTopBarContext.bind(this);
    this.logInUser = this.logInUser.bind(this);
    this.logOutUser = this.logOutUser.bind(this);
  }

  setTopBarContext(text) {
    this.setState({ mainContent: text });
  }

  logInUser(user) {
    this.setState({
      loggedIn: true,
      currentUser: user
    });
  }

  logOutUser() {
    api.post('/admin/logout')
    .then(() => {
      this.setState({ loggedIn: false, currentUser: null }, () => {
        window.location.hash = "#/login-register";
      });
    })
    .catch(() => {
      this.setState({ loggedIn: false, currentUser: null }, () => {
        window.location.hash = "#/login-register";
      });
    });
  }

  // ADD: called by TopBar after successful upload
  handleUploaded = () => {
    this.setState((s) => ({ refreshTick: s.refreshTick + 1 }));
  };

  render() {
    const { loggedIn, currentUser } = this.state;

    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            {/* TopBar always visible */}
            <Grid item xs={12}>
              <TopBar
                main_content={this.state.mainContent}
                loggedIn={loggedIn}
                currentUser={currentUser}
                onLogout={this.logOutUser}
                onUploaded={this.handleUploaded}
              />
            </Grid>

            <div className="main-topbar-buffer" />

            {/* UNAUTHENTICATED VIEW */}
            {!loggedIn ? (
              <Grid item xs={12}>
                <Paper className="main-grid-item">
                  <Switch>
                    <Route
                      path="/login-register"
                      render={(props) => (
                        <LoginRegister {...props} onLoginSuccess={this.logInUser} />
                      )}
                    />
                    <Redirect to="/login-register" />
                  </Switch>
                </Paper>
              </Grid>
            ) : (
              <>
                {/* AUTHENTICATED APP */}
                <Grid item sm={3}>
                  <Paper className="main-grid-item">
                    <UserList />
                  </Paper>
                </Grid>

                <Grid item sm={9}>
                  <Paper className="main-grid-item">
                    <Switch>

                      <Route
                        path="/users/:userId"
                        render={(props) => (
                          <UserDetail {...props} setTopBarContext={this.setTopBarContext} />
                        )}
                      />

                      <Route
                        path="/photos/:userId"
                        render={(props) => (
                          <UserPhotos
                            key={`${props.match.params.userId}-${this.state.refreshTick}`} // Force upload with refreshTick
                            {...props}
                            setTopBarContext={this.setTopBarContext}
                          />
                        )}
                      />

                      <Route path="/users" component={UserList} />

                      <Redirect to="/" />
                    </Switch>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById('photoshareapp'));
