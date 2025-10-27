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


/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: undefined
    };
  }

  componentDidMount() {
    fetch('/user/list')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((users) => {
        this.setState({ users });
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        this.setState({ error: 'Failed to load users' });
      });
  }
  
  render() {
    return (
      <div>
        <Typography variant="h6" gutterBottom>
          User List
        </Typography>
        <List component="nav">
          {this.state.users ? (
            this.state.users.map((user) => (
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
