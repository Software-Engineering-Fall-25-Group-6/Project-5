import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import './TopBar.css';
import api from '../../lib/api';

console.log('TopBar loaded');

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
    }
  };

  render() {
    const { loggedIn, currentUser, main_content } = this.props;
    const { app_info, uploadOpen } = this.state;

    if (!app_info) return <div />;

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h5">Group 6</Typography>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            {loggedIn ? (main_content || '') : 'Please Login'}
          </Typography>
          {loggedIn && currentUser && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mr: 3 }}>
              <Typography variant="h6">
                Hi {currentUser.first_name}
              </Typography>

              <Button variant="contained" onClick={this.openUpload}>
                Add Photo
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                onClick={this.props.onLogout}
                sx={{
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": { textDecoration: "underline" }
                }}
              >
                Logout
              </Button>
            </Box>
          )}
          <Dialog open={uploadOpen} onClose={this.closeUpload}>
            <DialogTitle>Upload a photo</DialogTitle>
            <DialogContent>
              <input type="file" accept="image/*" ref={this.fileInputRef} />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closeUpload}>Cancel</Button>
              <Button variant="contained" onClick={this.handleUpload}>Upload</Button>
            </DialogActions>
          </Dialog>
          <Typography variant="h6">
            Version: {app_info?.version ?? "N/A"}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
