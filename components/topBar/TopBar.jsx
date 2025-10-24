import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './TopBar.css';
import fetchModel from '../../lib/fetchModelData';
import { withRouter } from 'react-router-dom';

/**
 * TopBar Component
 * - Uses fetchModel (XMLHttpRequest) to load schema version and user info
 * - Removes window.models dependency (PBI-6 requirement)
 * - Adjusts right-side context depending on /users/:id or /photos/:id route
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: undefined,
      versionText: 'N/A',
      isPhotos: false
    };
  }

  componentDidMount() {
    // Fetch schema info version
    fetchModel('/test/info')
      .then((response) => {
        const d = response?.data || {};
        const v = d.__v !== undefined ? `v${d.__v}` :
                  d.version !== undefined ? `v${d.version}` : 'N/A';
        this.setState({ versionText: v });
      })
      .catch(() => this.setState({ versionText: 'N/A' }));

    this.updateContext();
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.updateContext();
    }
  }

  updateContext() {
    const path = this.props.location.pathname || '';
    const isPhotos = path.includes('/photos/');
    const match = path.match(/(?:\/users\/|\/photos\/)([^/]+)$/);
    const userId = match ? match[1] : null;

    this.setState({ isPhotos });

    if (!userId) {
      this.setState({ user_info: undefined });
      return;
    }

    // Fetch user info from backend instead of using window.models
    fetchModel(`/user/${userId}`)
      .then((resp) => {
        this.setState({ user_info: resp.data });
      })
      .catch(() => {
        this.setState({ user_info: undefined });
      });
  }

  render() {
    const { isPhotos, user_info, versionText } = this.state;
    const fullName = user_info ? `${user_info.first_name} ${user_info.last_name}` : 'Unknown';

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className="toolbar" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography variant="h6" color="inherit">Group 6</Typography>

          <div className="right-section" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {isPhotos ? (
              <Typography variant="h6" color="inherit">
                Photos of {fullName}
              </Typography>
            ) : (
              <Typography variant="h6" color="inherit">
                User Details - {fullName}
              </Typography>
            )}
            <Typography variant="body2" color="inherit" id="version">
              {versionText}
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
