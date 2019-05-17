import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
} from '@material-ui/core';

import "./AppHeader.scss";

const AppHeader = () => (
  <div className="no-print appbar">
    <h1 className="logo">Firefly Event Guide</h1>
  </div>
);

export default AppHeader;
