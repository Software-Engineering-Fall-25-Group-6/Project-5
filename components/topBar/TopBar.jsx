import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './TopBar.css';
import { withRouter } from 'react-router-dom';
import api from '../../lib/api';

/**
 * TopBar shows either "User Details - <name>" or "Photos of <name>"
 * and displays the schema version from /test/info.
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: undefined,
      app_info: { __v: 0 },
      isPhotos: false,
      error: null
    };
  }

  componentDidMount() {
    // Load schema info (for version display)
    api.get('/test/info')
      .then(({ data }) => this.setState({ app_info: data }))
      .catch(() => this.setState({ app_info: null }));

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
  }

  render() {
    const { isPhotos, user_info, app_info, error } = this.state;
    const name = user_info ? `${user_info.first_name} ${user_info.last_name}` : 'Unknown';

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className="toolbar">
          <Typography variant="h6" color="inherit">Group 6</Typography>

          <div className="right-section">
            {isPhotos ? (
              <Typography variant="h6" color="inherit">
                Photos of {name}
              </Typography>
            ) : (
              <Typography variant="h6" color="inherit">
                User Details - {name}
              </Typography>
            )}

            <Typography variant="body2" color="inherit" id="version" style={{ marginLeft: 12 }}>
              Version - {app_info && typeof app_info.__v !== 'undefined' ? app_info.__v : 'N/A'}
            </Typography>

            {error && (
              <Typography variant="body2" color="error" style={{ marginLeft: 12 }}>
                {error}
              </Typography>
            )}
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

// React Router v5 export (your app uses Switch/withRouter patterns)
export default withRouter(TopBar);
