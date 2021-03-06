import { h } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import { ElMessageBox } from 'element-plus';
import i18n from '@/i18n';
import { getAuthHeaders, setAccessAt } from '@/utils/auth';
import { getSiteHeaders, removeSessionSiteId } from '@/utils/common';
import { appState, setMessageBoxDisplay } from '@/store/useAppState';

const {
  global: { t },
} = i18n;
const showMessageBox = () => {
  if (!appState.loginBoxDisplay && !appState.messageBoxDisplay) {
    setMessageBoxDisplay(true);
    ElMessageBox.confirm(t('confirmLogin'), {
      cancelButtonText: t('cancel'),
      confirmButtonText: t('loginAgain'),
      type: 'warning',
      callback: (action: string) => {
        if (action === 'cancel' || action === 'close') {
          setMessageBoxDisplay(false);
          return;
        }
        if (action === 'confirm') {
          // 未登录。刷新页面以触发登录。无法直接使用router，会导致其它函数不可用的奇怪问题。
          window.location.reload();
        }
      },
    });
  }
};

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 10000,
});

service.interceptors.request.use(
  (config) => {
    setAccessAt(new Date().getTime());
    // eslint-disable-next-line
    config.headers = { ...config.headers, ...getAuthHeaders(), ...getSiteHeaders() };
    return config;
  },
  (error) => Promise.reject(error),
);

export interface ErrorInfo {
  message?: string;
  path?: string;
  error?: string;
  exception?: string;
  trace?: string;
  timestamp?: Date;
  status?: number;
}

export const handleError = ({ timestamp, message, path, error, exception, trace, status }: ErrorInfo): void => {
  if (exception === 'com.ujcms.cms.core.web.support.SiteForbiddenException') {
    //没有当前站点权限，清空站点信息，刷新页面以获取默认站点
    removeSessionSiteId();
    window.location.reload();
  } else if (exception === 'com.ujcms.util.web.exception.LogicException') {
    ElMessageBox.alert(message, { type: 'warning' });
  } else if (status === 401) {
    showMessageBox();
  } else if (status === 403) {
    ElMessageBox({
      title: String(status),
      message: h('div', null, [h('p', { class: 'text-lg' }, t('error.forbidden')), h('p', { class: 'mt-2' }, message)]),
    });
  } else {
    ElMessageBox({
      title: t('error.title'),
      message: h('div', null, [
        h('h', null, [h('span', { class: 'text-4xl' }, status), h('span', { class: ['ml-2', 'text-xl'] }, error)]),
        h('p', { class: 'mt-2' }, dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')),
        h('p', { class: 'mt-2' }, path),
        h('p', { class: 'mt-2' }, message),
        h('p', { class: 'mt-2' }, exception),
        h('pre', { class: 'mt-2' }, [h('code', { class: ['whitespace-pre-wrap'] }, trace)]),
      ]),
      customClass: 'msgbox-error',
    });
  }
};

service.interceptors.response.use(
  (response) => response,
  (e) => {
    const {
      response: { data, status },
    } = e;
    handleError(data);
    return Promise.reject(data.error);
  },
);

export default service;
