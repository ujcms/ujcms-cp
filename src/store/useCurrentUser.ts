import { reactive, readonly } from 'vue';
import { RouteRecordRaw } from 'vue-router';
import { Action, ElMessageBox, MessageBoxState, useRestoreActive } from 'element-plus';
import i18n from '@/i18n';
import { sm2Encrypt } from '@/utils/sm';
import { queryClientPublicKey } from '@/api/login';
import { appState, setLoginBoxDisplay } from '@/store/useAppState';
import { accountLogin, accountLogout, accountRefreshToken, LoginParam, queryCurrentUser } from '@/api/login';
import {
  setAccessToken,
  removeAccessToken,
  getRefreshToken,
  setRefreshToken,
  getRefreshAt,
  setRefreshAt,
  getAccessAt,
  setAccessAt,
  getSessionTimeout,
  setSessionTimeout,
  removeSessionTimeout,
  removeRefreshToken,
  removeAccessAt,
  removeRefreshAt,
} from '@/utils/auth';

export interface CurrentUser {
  username?: string;
  avatar?: string;
  rank: number;
  permissions?: string[];
  grantPermissions?: string[];
  globalPermission: boolean;
  loginDate?: Date;
  loginIp?: string;
  epExcludes: string[];
  epDisplay: boolean;
  epRank: number;
  epActivated: boolean;
}

const defaultUser: CurrentUser = { rank: 32767, globalPermission: false, epExcludes: [], epDisplay: false, epRank: 0, epActivated: false };

const state = reactive<CurrentUser>(defaultUser);

const setCurrentUser = (user: CurrentUser): void => {
  Object.assign(state, user);
};

export const currentUser = readonly(state);

export const login = async (params: LoginParam): Promise<any> => {
  const data = await accountLogin(params);
  if (data.status === 0) {
    const { result } = data;
    const now = new Date().getTime();
    setAccessToken(result.accessToken);
    setRefreshToken(result.refreshToken);
    setSessionTimeout(result.sessionTimeout);
    setAccessAt(now);
    setRefreshAt(now);
  }
  return data;
};

export const logout = (): void => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    accountLogout(refreshToken);
  }
  removeAccessAt();
  removeRefreshAt();
  removeAccessToken();
  removeRefreshToken();
  removeSessionTimeout();
  setCurrentUser(defaultUser);
};

const {
  global: { t },
} = i18n;

const showLoginBox = () => {
  if (appState.messageBoxDisplay) {
    ElMessageBox.close();
  }
  if (!appState.loginBoxDisplay) {
    setLoginBoxDisplay(true);
    ElMessageBox.prompt(state.username, t('enterPassword'), {
      cancelButtonText: t('backToLogin'),
      confirmButtonText: t('login'),
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      closeOnHashChange: false,
      inputType: 'password',
      inputValue: import.meta.env.MODE === 'development' ? 'password' : undefined,
      beforeClose: async (action: Action, instance: MessageBoxState, done: () => void) => {
        if (action === 'cancel') {
          done();
          window.location.reload();
        }
        if (action === 'confirm') {
          const inputValue = instance.inputValue;
          if (inputValue == null || inputValue === '') {
            instance.editorErrorMessage = t('v.required');
            instance.validateError = true;
            return;
          }
          const publicKey = await queryClientPublicKey();
          const password = sm2Encrypt(instance.inputValue, publicKey);
          const data = await login({ username: state.username ?? '', password });
          // ?????????????????????????????????
          if (data.status !== 0) {
            instance.editorErrorMessage = data.message;
            instance.validateError = true;
            return;
          }
          setLoginBoxDisplay(false);
          done();
        }
      },
    });
  }
};

// ??????????????????????????? 5 ?????????
const interval = 5 * 60 * 1000;
let refreshInterval: any;

/**
 * RefreshToken ???????????????
 *
 * 1. ????????????????????????????????????
 * 2. ??????????????????30???????????????
 */
const runRefreshToken = async () => {
  const refreshToken = getRefreshToken();
  // refreshToken????????????????????????
  if (!refreshToken) {
    return;
  }
  const accessAt = getAccessAt();
  const now = new Date().getTime();
  // ??????????????????????????????????????????????????? 30 ?????????
  const sessionTimeout = getSessionTimeout() * 60 * 1000;
  if (now - accessAt > sessionTimeout) {
    logout();
    showLoginBox();
    return;
  }
  // ????????????????????????????????????????????????????????????Interval???
  setRefreshAt(now);
  const data = await accountRefreshToken({ refreshToken });
  if (data.status !== 0) {
    return;
  }
  const { result } = data;
  setAccessToken(result.accessToken);
  setRefreshToken(result.refreshToken);
};

export const initRefreshInterval = (): void => {
  let afterTime = getRefreshAt() + interval - new Date().getTime();
  if (afterTime < 0) afterTime = 0;
  setTimeout(() => {
    runRefreshToken();
    if (!refreshInterval) {
      refreshInterval = setInterval(runRefreshToken, interval);
    }
  }, afterTime);
};

export const fetchCurrentUser = async (): Promise<any> => {
  const user = await queryCurrentUser();
  if (user) {
    setCurrentUser({
      username: user.username,
      avatar: user.avatar,
      rank: user.rank,
      permissions: user.permissions,
      grantPermissions: user.grantPermissions,
      globalPermission: user.globalPermission,
      loginDate: user.loginDate,
      loginIp: user.loginIp,
      epExcludes: user.epExcludes,
      epDisplay: user.epDisplay,
      epRank: user.epRank,
      epActivated: user.epActivated,
    });
  } else {
    removeAccessToken();
  }
  return user;
};

function includes(arr: string[] | undefined, str: string): boolean {
  if (arr == null) {
    return false;
  }
  return arr.includes(str) || arr.includes('*');
}

export const hasCurrentUser = (): boolean => state.username !== undefined;
export const isInclude = (permission?: string): boolean => !permission || !includes(state.epExcludes, permission);
export const hasPermission = (permission?: string): boolean => !permission || includes(state.permissions, permission);
export const perm = (permission?: string): boolean => !hasPermission(permission);
export const isShowPerm = (permission?: string): boolean => (state.epDisplay && !permission?.startsWith('machine:')) || isInclude(permission);
export const isShowMenu = (route: RouteRecordRaw): boolean => !route.meta?.hidden && hasPermission(route.meta?.requiresPermission) && isShowPerm(route.meta?.requiresPermission);
