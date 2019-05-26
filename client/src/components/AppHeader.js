import React from 'react';

import "./AppHeader.scss";

const AppHeader = () => (
  <div className="appbar">
    <h1 className="logo">Firefly Event Guide</h1>
    <div>Questions? Bugs? Email <a href="mailto:danimal@bikegasm.org">danimal@bikegasm.org</a></div>
  </div>
);

export default AppHeader;
