import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
      app_info: undefined,
      uploadOpen: false
    };
this.fileInputRef = React.createRef();

  }

  componentDidMount() {
    // Load schema info (for version display)
    api.get('/test/info')
      .then(({ data }) => this.setState({ app_info: data }))
      .catch(() => this.setState({ app_info: null }));
  }

  openUpload = () => this.setState({ uploadOpen: true });
closeUpload = () => this.setState({ uploadOpen: false });

handleUpload = async () => {
  const files = this.fileInputRef.current?.files || [];
  if (!files.length) return;
  const form = new FormData();
  form.append('uploadedphoto', files[0]);
  try {
    const { data: createdPhoto } = await api.post('/photos/new', form);
    this.setState({ uploadOpen: false });
    if (this.props.onUploaded) this.props.onUploaded(createdPhoto);
  } catch (err) {
    // eslint-disable-next-line no-alert
    alert(err?.response?.data || 'Upload failed');
  }
};


  render() {
    const { loggedIn } = this.props;
    if (!this.state.app_info) return <div />;
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Group 6
          </Typography>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} color="inherit">
            {loggedIn ? (this.props.main_content || '') : 'Please Login'}
          </Typography>

           {loggedIn && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginRight: 4 }}>
          <Typography variant="h6" sx={{ marginRight: "20px" }}>
            Hi {this.props.currentUser.first_name}
          </Typography>
            
          <Button variant="contained" onClick={this.openUpload}>Add Photo</Button>

          <Button
            variant="outlined"
            color="inherit"
            onClick={this.props.onLogout}
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              padding: 0,
              minWidth: "auto",
              "&:hover": { textDecoration: "underline" }
              }}
          >
            Logout
          </Button>
        </Box>
          )}
          <Dialog open={this.state.uploadOpen} onClose={this.closeUpload}>
          <DialogTitle>Upload a photo</DialogTitle>
          <DialogContent>
            <input type="file" accept="image/*" ref={this.fileInputRef} />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeUpload}>Cancel</Button>
            <Button variant="contained" onClick={this.handleUpload}>Upload</Button>
          </DialogActions>
        </Dialog>
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
