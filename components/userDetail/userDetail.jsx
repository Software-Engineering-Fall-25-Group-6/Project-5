import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../../lib/api';
import './userDetail.css';

export default function UserDetail({ setTopBarContext }) {
  const { userId } = useParams();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api.get(`/user/${userId}`)
      .then(({ data }) => {
        setUser(data);
        setLoading(false);
        if (setTopBarContext) {
          setTopBarContext(`User Details - ${data.first_name} ${data.last_name}`);
        }
      })
      .catch(() => setLoading(false));
  }, [userId, setTopBarContext]);

  if (loading) return <CircularProgress />;

  return (
    <Grid container justifyContent="center" className="user-detail">
      <Grid item xs={10} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h5">{user.first_name} {user.last_name}</Typography>
            <Typography>Location: {user.location}</Typography>
            <Typography>Occupation: {user.occupation}</Typography>
            <Typography>Description: {user.description}</Typography>
            <Button component={Link} to={`/photos/${user._id}`} variant="contained" sx={{ mt: 2 }}>
              View Photos
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
