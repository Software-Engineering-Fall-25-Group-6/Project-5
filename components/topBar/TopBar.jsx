import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import './TopBar.css';

/**
 * Define TopBar, a React componment of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit">Group 6</Typography>
          <Typography variant="h5" color="inherit">User Details</Typography>
          <Typography variant="h5" color="inherit">Photos of</Typography>
          <Typography variant="h5" color="inherit"></Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
