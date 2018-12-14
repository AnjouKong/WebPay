/*
 * @desc 错误页面组件
 */
import React from 'react';
import './LoadError.css';

const LoadError = () => (
  <div className="error_container">
    <div className="loading_err"></div>
    <div className="loading_err_desc">系统错误，请稍后再试</div>
  </div>
);

export default LoadError;
