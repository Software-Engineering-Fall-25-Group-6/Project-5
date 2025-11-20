import React from 'react';
import {
    Button,
    Box,
    TextField,
    Alert,
    Typography
} from '@mui/material';
import './LoginRegister.css';
import Collapse from '@mui/material/Collapse';
import api from '../../lib/api';

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
     login_name: "",
      password: "",
      regOpen: false,
      regFields: {
        first_name: "",
        last_name: "",
        location: "",
        description: "",
        occupation: "",
        reg_login_name: "",
        reg_password: "",
        reg_password_repeat: ""
      },
      loginError: false,
      registrationError: false,
      registrationSuccess: false
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegToggle = this.handleRegToggle.bind(this);
    this.handleRegSubmit = this.handleRegSubmit.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleRegFieldChange = this.handleRegFieldChange.bind(this);
  } 
    handleLogin() {
    const { login_name, password } = this.state;

    api.post("/admin/login", { login_name, password })
      .then((res) => {
        const { user } = res.data;

        this.setState({
          loginError: false,
          registrationError: false,
          registrationSuccess: false
        });

        this.props.onLoginSuccess(user);
      })
      .catch(() => {
        this.setState({
          loginError: true,
          registrationError: false,
          registrationSuccess: false
        });
      });
  } 

  handleRegToggle() {
    this.setState((prevState) => ({
      regOpen: !prevState.regOpen
    }));
  }
  handleRegSubmit() {
    const f = this.state.regFields;

    if (f.reg_password !== f.reg_password_repeat) {
      this.setState({
        registrationError: true,
        registrationSuccess: false
      });
      return;
    }

    api.post("/user", {
      login_name: f.reg_login_name,
      password: f.reg_password,
      first_name: f.first_name,
      last_name: f.last_name,
      location: f.location,
      description: f.description,
      occupation: f.occupation
    })
      .then((res) => {
        const newUser = res.data;

        this.setState({
          registrationSuccess: true,
          registrationError: false,
          regOpen: false
        });

        // Automatically log in newly registered user
        this.props.onLoginSuccess(newUser);
      })
      .catch(() => {
        this.setState({
          registrationError: true,
          registrationSuccess: false
        });
      });
  }
handleFieldChange(e) {
    this.setState({ [e.target.id]: e.target.value });
  }

  handleRegFieldChange(e) {
    const id = e.target.id;
    const value = e.target.value;

    this.setState((prev) => ({
      regFields: {
        ...prev.regFields,
        [id]: value
      }
    }));
  }
  render() {
    const {
      loginError,
      registrationError,
      registrationSuccess,
      regOpen
    } = this.state;


    return (
      <Box className="login-register-container">

        {/* FEEDBACK SECTION */}
        {loginError && <Alert severity="error">Login failed.</Alert>}
        {registrationError && <Alert severity="error">Registration failed.</Alert>}
        {registrationSuccess && (
          <Alert severity="success">Your account has been created!</Alert>
        )}

        {/* LOGIN FORM */}
        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
          Login
        </Typography>

        <TextField
          id="login_name"
          label="Login Name"
          fullWidth
          margin="normal"
          onChange={this.handleFieldChange}
        />

        <TextField
          id="password"
          label="Password"
          fullWidth
          type="password"
          margin="normal"
          onChange={this.handleFieldChange}
        />

        <Button variant="contained" onClick={this.handleLogin} sx={{ mt: 1 }}>
          Login
        </Button>

        {/* REGISTRATION TOGGLE */}
        <Button
          variant="text"
          endIcon={null}
          onClick={this.handleRegToggle}
          sx={{ mt: 3 }}
        >
          {regOpen ? "Hide Registration" : "Create New Account"}
        </Button>

        {/* REGISTRATION FORM */}
        <Collapse in={regOpen} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Register</Typography>

            <TextField
              id="reg_login_name"
              label="Login Name"
              fullWidth
              margin="normal"
              onChange={this.handleRegFieldChange}
            />

            <TextField
              id="reg_password"
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              onChange={this.handleRegFieldChange}
            />

            <TextField
              id="reg_password_repeat"
              label="Repeat Password"
              type="password"
              fullWidth
              margin="normal"
              onChange={this.handleRegFieldChange}
            />

            <TextField
              id="first_name"
              label="First Name"
              fullWidth
              margin="normal"
              onChange={this.handleRegFieldChange}
            />

            <TextField
              id="last_name"
              label="Last Name"
              fullWidth
              margin="normal"
              onChange={this.handleRegFieldChange}
            />

            <TextField
              id="location"
              label="Location"
              fullWidth
              margin="normal"
              onChange={this.handleRegFieldChange}
            />

            <TextField
              id="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              onChange={this.handleRegFieldChange}
            />

            <TextField
              id="occupation"
              label="Occupation"
              fullWidth
              margin="normal"
              onChange={this.handleRegFieldChange}
            />

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={this.handleRegSubmit}
            >
              Register
            </Button>
          </Box>
        </Collapse>
      </Box>
    );
  }
}

export default LoginRegister;