import React from 'react';
import { Typography, TextField, Button, Stack } from '@mui/material';
import api from '../../lib/api';
import './userPhotos.css';

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      loading: true,
      error: null,
      commentInputs: {}
    };
  }

  componentDidMount() {
    const userId = this.props.match.params.userId;

    // Fetch photos
    api.get(`/photosOfUser/${userId}`)
      .then(({ data }) => {
        this.setState({ photos: data, loading: false });
      })
      .catch(({ status, statusText }) => {
        this.setState({ error: { status, statusText }, loading: false });
      });

    // Also fetch the user to set TopBar context
    if (this.props.setTopBarContext) {
      api.get(`/user/${userId}`)
        .then(({ data }) => {
          this.props.setTopBarContext(`Photos of ${data.first_name} ${data.last_name}`);
        })
        .catch(() => {
          this.props.setTopBarContext('Photos');
        });
    }
  }

   setCommentInput = (photoId, text) => {
    this.setState((s) => ({ commentInputs: { ...s.commentInputs, [photoId]: text } }));
  };

  clearCommentInput = (photoId) => {
    this.setState((s) => ({ commentInputs: { ...s.commentInputs, [photoId]: '' } }));
  };

  postComment = async (photoId) => {
    const text = (this.state.commentInputs[photoId] || '').trim();
    if (!text) return;
    try {
      const { data: newComment } = await api.post(`/commentsOfPhoto/${photoId}`, { comment: text });
      this.setState((s) => ({
        photos: s.photos.map((p) =>
          p._id === photoId ? { ...p, comments: [...(p.comments || []), newComment] } : p
        )
      }));
      this.clearCommentInput(photoId);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err?.response?.data || 'Failed to add comment');
    }
  };

  render() {
    const { photos, loading, error } = this.state;
    const userId = this.props.match.params.userId;

    if (loading) {
      return <Typography variant="body1">Loading photos...</Typography>;
    }

    if (error) {
      return (
        <Typography color="error" variant="body1">
          Failed to load photos (status {error.status} {error.statusText})
        </Typography>
      );
    }

    if (!photos || photos.length === 0) {
      return (
        <Typography variant="body1">
          No photos found for user ID {userId}.
        </Typography>
      );
    }

    return (
      <div className="user-photos">
        <Typography variant="h6" gutterBottom>
          Photos for user ID: {userId}
        </Typography>

        {photos.map((photo) => (
          <div key={photo._id} className="photo-block">
            <img src={`images/${photo.file_name}`} alt="user upload" className="photo" />
            <Typography variant="caption" display="block">
              Uploaded: {photo.date_time}
            </Typography>

            {photo.comments && photo.comments.length > 0 && (
              <div className="comments-section">
                <Typography variant="subtitle2">Comments:</Typography>
                {photo.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <Typography variant="body2">
                      <a href={`#/users/${comment.user._id}`}>
                        {comment.user.first_name} {comment.user.last_name}
                      </a>{' '}
                      commented on {comment.date_time}
                    </Typography>
                    <Typography variant="body2">{comment.comment}</Typography>
                  </div>
                ))}
              </div>
            )}
            <Stack direction="row" spacing={1} alignItems="center" className="add-comment" style={{ marginTop: 8 }}>
            <TextField
              size="small"
              fullWidth
              label="Add a comment"
              value={this.state.commentInputs[photo._id] || ''}
              onChange={(e) => this.setCommentInput(photo._id, e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => this.postComment(photo._id)}
              disabled={!((this.state.commentInputs[photo._id] || '').trim())}
            >
              Post
            </Button>
          </Stack>
          </div>
        ))}
      </div>
    );
  }
}

export default UserPhotos;
