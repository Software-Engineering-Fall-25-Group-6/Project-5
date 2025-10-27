import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import './TopBar.css';
import fetchModel from '../../lib/fetchModelData';

import { withRouter } from 'react-router-dom';


/**
 * Define TopBar, a React componment of project #5
 * Instructions: The right side of the TopBar should provide app context by reflecting what is being shown in the main content region. For example, if the main content is displaying details on a user the toolbar should have the user’s name. If it is displaying a user’s photos it should say “Photos of” and the user’s name.
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: undefined,
      app_info: { version: 0 },
      isPhotos: false
    };
  }
  componentDidMount() {
    fetchModel('/test/info')
      .then((response) => {
        this.setState({
          app_info: response.data
        });
      });
    this.updateContext();
  }
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.updateContext();
    }
  }

  updateContext() {
    const user_info = this.state.user_info;
    
    let path = this.props.location.pathname.split("/");
    this.setState({ isPhotos: path.includes('photosOfUser')});
    let userId = path.pop(); 

    const userInfo = window.models.userModel(userId); 
    this.setState({
        user_info: userInfo
    });
    
  }

  render() {
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className='toolbar'>
          <Typography variant="h6" color="inherit">Group 6</Typography>
          <div className="right-section">
            {this.state.isPhotos && (
              <Typography variant="h6" color="inherit">
                Photos of {this.state.user_info ? this.state.user_info.first_name + ' ' + this.state.user_info.last_name : 'Unknown'}
              </Typography>
            )}
            {!this.state.isPhotos && (
              <Typography variant="h6" color="inherit">
                User Details - {this.state.user_info ? this.state.user_info.first_name + ' ' + this.state.user_info.last_name : 'Unknown'}
              </Typography>
            )}

            <Typography variant="h8" color="inherit" id="version">Version - {this.state.app_info ? this.state.app_info.__v : 'N/A'}</Typography>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}1

export default withRouter(TopBar);
