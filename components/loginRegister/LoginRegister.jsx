import React from 'react';
import {
    Button,
    Box,
    TextField,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography
} from '@mui/material';
import './loginRegister.css';
import api from '../../lib/api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; 

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      app_info: undefined
    };
  } 

  
}

export default LoginRegister;