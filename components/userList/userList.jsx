import React from 'react';
import {
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
}
from '@mui/material';
import { Link } from 'react-router-dom';
import './userList.css';
import fetchModel from '../../lib/fetchModelData';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: undefined,
      error: null
    };
  }

  componentDidMount() {
    fetchModel('/user/list')
      .then((response) => {
        let users = response.data;
        this.setState({ users: users, error: null });
      })
      .catch((e) => {
        console.error('Failed to fetch users:', e);
        this.setState({ error: e.message });
      });
  }
  
  render() {
    const { users, error } = this.state;

    if (error) {
      return (
        <div>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
        </div>
      );
    }

    return (
      <div>
        <Typography variant="h6" gutterBottom>
          User List
        </Typography>
        <List component="nav">
          {users ? (
            users.map((user) => (
              <div key={user._id}>
                <Link 
                  to={`/users/${user._id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <ListItemButton>
                    <ListItemText primary={`${user.first_name} ${user.last_name}`} />
                  </ListItemButton>
                </Link>
                <Divider />
              </div>
            ))
          ) : (
            <Typography variant="body1">Loading users...</Typography>
          )}
        </List>
      </div>
    );
  }
}

export default UserList;
