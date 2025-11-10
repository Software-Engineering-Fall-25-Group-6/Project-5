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

    this.updateContextFromLocation(this.props.location.pathname);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.updateContextFromLocation(this.props.location.pathname);
    }
  }

  updateContextFromLocation(pathname) {
    const parts = pathname.split('/').filter(Boolean); // e.g., ["users","<id>"] or ["photos","<id>"]
    const isPhotos = parts[0] === 'photos';
    const userId = parts.length >= 2 ? parts[1] : null;

    this.setState({ isPhotos, user_info: undefined, error: null });

    if (!userId) return; // nothing to fetch on homepage or /users list view

    // Fetch the user name for the right-side context
    api.get(`/user/${userId}`)
      .then(({ data }) => {
        this.setState({ user_info: data });
      })
      .catch(({ status, statusText }) => {
        // Keep UI graceful if the id is bad or user missing
        console.error('TopBar failed to fetch user:', status, statusText);
        this.setState({ error: `${status}: ${statusText}` });
      });
  }

  render() {
    const { isPhotos, user_info, app_info } = this.state;
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
            <Typography variant="body2" color="inherit" id="version">
              Version - {app_info && typeof app_info.__v !== 'undefined' ? app_info.__v : 'N/A'}
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
