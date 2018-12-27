import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './HomePage.css';
import Utils from '../common/Utils';
import Toast from '../components/Toast';
import Loading from '../components/Loading';
import LoadError from '../components/LoadError';

import recommend from '../images/recommend.png';
// import headerImg from '../images/header.jpg';

import { VIP_PACTINFO } from '../common/Constant';

class HomePage extends Component {
  static propTypes = {
    location: PropTypes.shape({
      query: PropTypes.shape({
        token: PropTypes.string,
        mediaId: PropTypes.string,  // index.html?token=123&orderid=566#/home?orderid=222
      }).isRequired
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      hasError: false,
      activeIndex: null,
      styleToggle: { display: 'none' },
      headerImg: './images/header.jpg',
      // headerImg: headerImg,
      priceData: [],
      hotelName: '',
      hotelRoom: '',
      note: '',
    };

    this.payInfo = {
      hasChoose: false,
      goodType: '',
      goodId: '',
    };
    this.orderNo = '';

    this.payType = 'wxPay';
    const ua = Utils.sysInfo.ua.toLowerCase();
    if (ua.indexOf('micromessenger') !== -1) {
      this.payType = 'wxPay';
    }
    if (ua.indexOf('alipayclient') !== -1) {
      this.payType = 'aliPay';
    }
  }

  componentWillMount() {
    this.getPriceData();
  }

  getPriceData = () => {
    const logReportParam = {};
    logReportParam.startTime = Utils.formatTime(new Date().getTime(), 'yyyy-MM-ddTHH:mm:ss.msZ');
    logReportParam.resourceId = Utils.query.mediaId || '';
    // logReportParam.eventDescribe = {
    //   sourceType: 'null',
    //   currentType: 'PAY_DETAIL',
    //   currentId: 'null',
    //   currentDesc: 'null',
    // };

    Utils.request({
      url: `${window.PAY_API_HOST}/api/pay/order/v3`,
      headers: { token: Utils.query.token },
      method: 'post',
      data: {
        mediaId: Utils.query.mediaId || '',
        payType: this.payType,
      }
    })
    .then(res => {
      // res = {
      //   body: {
      //     goods: [
      //       {
      //         goodId: '101',
      //         goodName: '包天套餐',
      //         goodType: 'TPackage',
      //         price: 5,
      //         time: 101
      //       },
      //       {
      //         goodId: '102',
      //         goodName: '彼得兔',
      //         goodType: 'media',
      //         price: 5.9,
      //         time: 101
      //       }
      //     ],
      //     orderNo: '20184568',
      //     payType: 'wxPay'
      //   },
      //   head: {
      //     bodyType: 'string',
      //     code: 0,
      //     msg: 'string'
      //   }
      // };
      if (res.body && res.body.goods) {
        this.setState({
          priceData: res.body.goods,
          hotelName: res.body.tenantName,
          hotelRoom: res.body.roomId,
          isFetching: false,
          note: res.body.note.replace(/\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029)/g, '<br>'),
        });
        this.orderNo = res.body.orderNo;

        // 2018.12.20 增加纯套餐模式,直接进入支付
        if (res.body.goods.length === 1) {
          this.payInfo = {
            hasChoose: true,
            goodType: res.body.goods[0].goodType,
            goodId: res.body.goods[0].goodId,
            price: res.body.goods[0].price
          };
          this.confirm();
        }

        // 日志上报
        logReportParam.eventEnum = 'ORDER_MOBILE_GET_DATA_EVENT';
        logReportParam.eventDescribe = location.href;
        this.logReport(logReportParam);
      } else {
        this.setState({
          isFetching: false,
          hasError: true,
        });

        // 日志上报
        logReportParam.eventEnum = 'ORDER_MOBILE_GET_DATA_ERROR';
        logReportParam.eventDescribe = `url = ${location.href}; err = ${JSON.stringify(res)}`;
        this.logReport(logReportParam);
      }
    })
    .catch((err) => {
      this.setState({
        isFetching: false,
        hasError: true,
      });

      // 日志上报
      logReportParam.eventEnum = 'ORDER_MOBILE_GET_DATA_ERROR';
      logReportParam.eventDescribe = `url = ${location.href}; err = ${JSON.stringify(err)}`;
      this.logReport(logReportParam);
    });
  }

  logReport = (param) => {
    // param.eventDescribe = JSON.stringify(param.eventDescribe); // eventDescribe先转成字符串
    const token = Utils.query.token;
    // const token = 'f6324625197e61d9908e41e42ebebbefcdcfc593';
    Utils.request({
      // url: 'http://demo.unitedview.cn:2200/service-log/api/log/device/event/push/h5/v2',
      url: 'http://api.cloud.unitedview.cn/service-log/api/log/device/event/push/h5/v2',
      // url: '/api/log/device/event/push/h5/v2/',
      headers: { token },
      method: 'post',
      data: {
        data: `[${JSON.stringify(param)}]`,
      }
    });
  }

  priceClick = (index, goodType, goodId, price) => {
    this.payInfo = {
      hasChoose: true,
      goodType,
      goodId,
      price
    };
    this.setState({
      activeIndex: index
    });
  }

  infoToggle = () => {
    if (this.state.styleToggle.display === 'block') {
      this.setState({
        styleToggle: { display: 'none' }
      });
    } else {
      this.setState({
        styleToggle: { display: 'block' }
      });
    }
  }

  confirm = () => {
    const { hasChoose, goodType, goodId } = this.payInfo;
    if (hasChoose) {
      console.log('pay');
      Toast.loading('支付中...');

      const url = `${window.PAY_API_HOST}/api/pay/qrPay/v3`;
      const token = Utils.query.token;
      location.href = `${url}?token=${token}&orderNo=${this.orderNo}&goodId=${goodId}&goodType=${goodType}`;

      // Utils.request({
      //   url: `${window.PAY_API_HOST}/api/pay/pay/v3`,
      //   headers: { token: Utils.query.token },
      //   method: 'post',
      //   data: {
      //     orderNo: this.orderNo,
      //     goodId,
      //     goodType,
      //   }
      // })
      // .then(() => {
      //   Toast.hide();
      // })
      // .catch(() => {
      //   Toast.hide();
      // });
    } else {
      Toast.info('请先选择VIP套餐', 2000, false, false);
    }
  }

  // 数组对象排序
  compare = (prop) => {
    return function (obj1, obj2) {
      let val1 = obj1[prop];
      let val2 = obj2[prop];
      if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
        val1 = Number(val1);
        val2 = Number(val2);
      }
      if (val1 > val2) {
        return -1;
      } else if (val1 < val2) {
        return 1;
      }
      return 0;
    };
  }

  creatPriceDom = () => {
    const { priceData, activeIndex } = this.state;
    const priceDataSort = priceData.sort(this.compare('goodType'));
    return (
      <div className="priceBox">
        <h3>套餐选择</h3>
        <ul className="priceList clear-fix">
          {
            priceDataSort && priceDataSort.map((item, index) => {
              // if (index >= 2) return null;
              return (
                <li
                  className={classNames('item', { active: activeIndex === index })}
                  key={index}
                  onClick={() => this.priceClick(index, item.goodType, item.goodId, item.price)}
                >
                  {
                    (item.isRecommend === '1') &&
                    <div className="recommend"><img src={recommend} alt="" /></div>
                  }
                  {
                    item.goodType === 'media' ?
                    (
                      <div className="priceTitle">购买《<span>{item.goodName}</span>》</div>
                    ) : (
                      <div className="priceTitle">{item.goodName}</div>
                    )
                  }
                  <div className="price"><span>￥</span>{item.price}</div>
                  <div className="originPrice">原价￥{item.originalPrice}</div>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }

  render() {
    const { isFetching, hasError, styleToggle, headerImg, hotelName, note } = this.state;
    const { price } = this.payInfo;
    if (isFetching || hasError) {
      return (
        isFetching ? <Loading /> : <LoadError />
      );
    }
    return (
      <div className="home-page">
        <div className="info">
          <div className="header">
            <div className="img"><img src={headerImg} /></div>
            <div className="headerInfo">
              <p>酒店：<span>{hotelName}</span></p>
              {/* <p>房间号：<span>{hotelRoom}</span></p> */}
            </div>
          </div>

          {this.creatPriceDom()}

          <div className="descBox">
            <h3>温馨提示</h3>
            <div className="descContent">
              <div dangerouslySetInnerHTML={{ __html: note }} />
            </div>
          </div>

          <div
            className="pact"
            onClick={() => this.infoToggle()}
          >
            《联合院线VIP会员协议》
          </div>
          <div className="pactInfo" style={styleToggle}>
            <div dangerouslySetInnerHTML={{ __html: VIP_PACTINFO }} />
          </div>
        </div>
        <div
          className="confirm"
          onClick={() => this.confirm()}
        >
          确认支付 ￥{price || 0} 元
        </div>
      </div>
    );
  }
}

export default HomePage;
