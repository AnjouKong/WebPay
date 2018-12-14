import React, { Component } from 'react';
import './MinePage.css';

import FootTabs from '../components/FootTabs';

class MinePage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>我的</h1>
        <FootTabs />
      </div>
    );
  }
}

export default MinePage;
