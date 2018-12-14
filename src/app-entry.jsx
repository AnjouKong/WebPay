import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import 'babel-polyfill';
import Store from './store';

import './common/common.css';
import Utils from './common/Utils';
import { ROUTE_NAMES } from './common/RouteNames';

import HomePage from './pages/HomePage';

const App = function(props) {
  return (
    <div className="app-container">
      {props.children}
    </div>
  );
};

App.propTypes = {
  children: PropTypes.element.isRequired,
};

// 渲染入口
const appDom = document.querySelector('#app');

const routeEnter = nextState => {
  Utils.fixTitle(nextState);
};

// const routeChange = (preState, nextState) => {
//   Utils.fixTitle(nextState);
// };

const RN = ROUTE_NAMES;

// 部分页面采用嵌套路由的方式进行跳转，可以保留上一级页面的状态，不用做滚动条的记录等功能
// 前提是下一个页面没有进入其他页面的路口，如果有的话，状态保留就会失败
// 带有子页面的需要使用onChange方法来监听，因为onEnter方法在从子页面返回父页面时不会触发

// 使用redux时的模板
render(
  (
    <Provider store={Store}>
      <Router history={hashHistory}>
        <Route path="/" component={App}>
          <IndexRedirect to={RN.HOMEPAGE} />
          <Route path={RN.HOMEPAGE} onEnter={routeEnter} component={HomePage} />
        </Route>
      </Router>
    </Provider>
  ),
  appDom,
);
