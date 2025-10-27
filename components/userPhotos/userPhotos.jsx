import React from 'react';
import { Typography } from '@mui/material';
import fetchModel from '../../lib/fetchModelData';
import './userPhotos.css';

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    const userId = this.props.match.params.userId;

    fetchModel(`/photosOfUser/${userId}`)
      .then((res) => {
        this.setState({
          photos: res.data,
          loading: false
        });
      })
      .catch((err) => {
        console.error('Failed to fetch photos:', err);
        this.setState({
          error: err,
          loading: false
        });
      });
  }

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
            <img
              src={`images/${photo.file_name}`}
              alt="user upload"
              className="photo"
            />
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
          </div>
        ))}
      </div>
    );
  }
}

export default UserPhotos;