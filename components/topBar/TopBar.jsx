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
<<<<<<< HEAD

    this.updateContextFromLocation(this.props.location?.pathname || '/');
  }

  componentDidUpdate(prevProps) {
    const prev = prevProps.location?.pathname;
    const curr = this.props.location?.pathname;
    if (curr !== prev) {
      this.updateContextFromLocation(curr || '/');
    }
    
  }

  updateContextFromLocation(pathname) {
    // Example pathnames with HashRouter:
    // "#/users/<id>"   => location.pathname === "/users/<id>"
    // "#/photos/<id>"  => location.pathname === "/photos/<id>"
    // We only care about the first segment and the id.
    // Debug logs help if something looks off.
    // console.log('[TopBar] pathname:', pathname);

    const isPhotos = /^\/photos\//.test(pathname);
    const match = pathname.match(/^\/(?:users|photos)\/([^/]+)/);
    const userId = match ? match[1] : null;
    this.setState({ isPhotos, user_info: undefined, error: null });

    if (!userId) {
      // No user id on routes like "/" or "/users" (list) – nothing to fetch.
      return;
    }

    api.get(`/user/${userId}`)
      .then(({ data }) => {
        this.setState({ user_info: data });
      })
      .catch(({ status, statusText }) => {
        // Keep UI graceful if the id is bad or user missing
        // console.error('[TopBar] failed to fetch user:', status, statusText);
        this.setState({ error: `${status}: ${statusText}`, user_info: null });
      });
=======
>>>>>>> a9cb78616869d4a5f127832ddf78e9d8dec65f9e
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
