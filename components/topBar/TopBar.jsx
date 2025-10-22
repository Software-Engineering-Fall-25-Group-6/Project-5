import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import './TopBar.css';


/**
 * Define TopBar, a React componment of project #5
 * Instructions: The right side of the TopBar should provide app context by reflecting what is being shown in the main content region. For example, if the main content is displaying details on a user the toolbar should have the user’s name. If it is displaying a user’s photos it should say “Photos of” and the user’s name.
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: undefined,
      app_info: { version: 0 }
    };
  }
componentDidMount() {
        this.handleAppInfoChange();
    }

    handleAppInfoChange() {
    const user_info = this.state.user_info;
    if (user_info === undefined) {
        // Directly access the user information from window.models
        let userId = "57231f1a30e4351f4e9f4bd7"; // Default user ID
        if (this.props.userId) {
            userId = this.props.userId;
        }
        const userInfo = window.models.userModel(userId); // Replace with actual user ID as needed
        this.setState({
            user_info: userInfo
        });
    }
    
}

  render() {
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className='toolbar'>
          <Typography variant="h6" color="inherit">Group 6</Typography>
          <div className="right-section">
            <Typography variant="h6" color="inherit">Photos of {this.state.user_info ? this.state.user_info.first_name + ' ' + this.state.user_info.last_name : 'Unknown'}</Typography>
            <Typography variant="h8" color="inherit">Version - {this.state.app_info ? this.state.app_info.version : 'N/A'}</Typography>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}1

export default TopBar;
