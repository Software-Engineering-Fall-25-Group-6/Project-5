import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './TopBar.css';
import api from '../../lib/api';

console.log('TopBar loaded');

/**
 * TopBar displays:
 *  - left: team/app name
 *  - center: context string passed in via props.main_content
 *  - right: schema version from /test/info
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      app_info: undefined
    };
  }

  componentDidMount() {
    // Load schema info (for version display)
    api.get('/test/info')
      .then(({ data }) => this.setState({ app_info: data }))
      .catch(() => this.setState({ app_info: null }));
  }

  render() {
    if (!this.state.app_info) return <div />;

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Group 6
          </Typography>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} color="inherit">
            {this.props.main_content || ''}
          </Typography>

          <Typography variant="h6" component="div" color="inherit">
            Version: {typeof this.state.app_info.version !== 'undefined'
              ? this.state.app_info.version
              : 'N/A'}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
