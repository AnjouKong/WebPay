/*
 * @desc Loading组件
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Loading.css';

class Loading extends Component {
  static propTypes = {
    // Loading类型(0: 页面加载, 1: 上拉加载, 2: 到底啦)
    type: PropTypes.number
  };

  static defaultProps = {
    type: 0
  };

  // constructor (props) {
  //   super(props);
  // }

  render () {
    const { type } = this.props;
    if (type === 1) {
      return (
        <div className="list_loading">
          <span>加载中...</span>
        </div>
      );
    }
    if (type === 2) {
      return (
        <div className="list_load_done">
          <span>到底啦...</span>
        </div>
      );
    }
    return (
      <div className="loading_container">
        <div className="loading_gif"></div>
        <div className="loading_text">努力加载中...</div>
      </div>
    );
  }
}

export default Loading;
