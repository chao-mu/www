import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
} from '@material-ui/core';

const AppHeader = () => (
  <AppBar position="static" className="no-print">
    <Toolbar>
      <Typography variant="title" color="inherit">
        Firefly Event Guide
      </Typography>
    </Toolbar>
  </AppBar>
);

export default AppHeader;
