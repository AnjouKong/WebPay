import Notification from './Notification';

let newNotification;
const getNewNotification = () => {
  // 单例 保持页面始终只有一个Notification
  if (!newNotification) {
    newNotification = Notification.reWrite();
  }

  return newNotification;
};

// notice方法实际上就是集合参数 完成对Notification的改变
const notice = (type, content, duration, onClose, iconClass, mask) => {
  const notificationInstance = getNewNotification();

  const noticeObj = {
    duration,
    type,
    mask,
    iconClass,
    content,
    onClose: () => {
      if (onClose) onClose();
    },
  };
  notificationInstance.notice(noticeObj);
};

export default {
  info(content, duration, onClose, mask) {
    notice(undefined, content, duration, onClose, '', mask);
  },

  warn(content, duration, onClose, mask) {
    notice(undefined, content, duration, onClose, 'notice-warn-icon', mask);
  },

  success(content, duration, onClose, mask) {
    notice(undefined, content, duration, onClose, 'notice-success-icon', mask);
  },

  error(content, duration, onClose, mask) {
    notice(undefined, content, duration, onClose, 'notice-error-icon', mask);
  },

  loading(content) {
    notice(undefined, content || '加载中...', 0, null, 'notice-loading-icon', true);
  },

  hide() {
    if (newNotification) {
      newNotification.destroy();
      newNotification = null;
    }
  }
};
