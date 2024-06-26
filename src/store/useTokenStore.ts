import { create } from 'zustand';

interface TokenState {
  accessToken: string;
  refreshToken: string;
  setAccessToken: (accessToken: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  clearTokens: () => void;
}

/** 2023/07/10 - 로컬스토리지에서 토큰 읽기 - by leekoby */
const getTokenStateFromStorage = () => {
  if (typeof window !== 'undefined') {
    const tokenState = {
      accessToken: localStorage.getItem('accessToken') || '',
      refreshToken: localStorage.getItem('refreshToken') || '',
    };
    return tokenState;
  }
  return { accessToken: '', refreshToken: '' };
};
/** 2023/07/10 - 로컬스토리지에서 토큰 저장 - by leekoby */
const setTokenToStorage = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

/** 2023/07/10 - 로컬스토리지에서 토큰 삭제 - by leekoby */
const removeTokenFromStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

/** 2023/07/17 - getToken 함수 추가- by leekoby */
const getToken = () => {
  const store = useTokenStore.getState();
  return { accessToken: store.accessToken, refreshToken: store.refreshToken };
};
/** 2023/07/19 - ClearToken 함수 추가- by leekoby */
const clearTokens = () => {
  const store = useTokenStore.getState();
  store.clearTokens();
};

/** 2023/07/10 - 로그인 응답 헤더 토큰 저장소 - by leekoby */
const useTokenStore = create<TokenState>(set => ({
  ...getTokenStateFromStorage(),
  setAccessToken: (accessToken: string) => {
    setTokenToStorage('accessToken', accessToken);
    set({ accessToken });
  },
  setRefreshToken: (refreshToken: string) => {
    setTokenToStorage('refreshToken', refreshToken);
    set({ refreshToken });
  },
  clearTokens: () => {
    removeTokenFromStorage('accessToken');
    removeTokenFromStorage('refreshToken');
    set({ accessToken: '', refreshToken: '' });
  },
  getToken: () => {
    const store = useTokenStore.getState();
    return { accessToken: store.accessToken, refreshToken: store.refreshToken };
  },
}));

export { useTokenStore, getToken, clearTokens };
