import { supabase } from '../../../shared/utils/supabaseClient';
import { store } from '../../../store/store';
import { setUser, clearUser } from '../../../store/slices/userSlice';

/**
 * Mevcut oturum durumunu kontrol eder
 * @returns {Promise<boolean>} Kullanıcı oturum durumu
 */
export const checkSession = async () => {
  try {
    // Önce localStorage'dan kullanıcı durumunu kontrol et
    const userStateStr = localStorage.getItem('userState');
    
    if (userStateStr) {
      try {
        const localUserState = JSON.parse(userStateStr);
        
        // LocalStorage'da geçerli bir token varsa, Redux store'u güncelle
        if (localUserState && localUserState.isLoggedIn && localUserState.accessToken) {
          // Redux store'u güncelle
          store.dispatch(setUser({
            id: localUserState.id,
            email: localUserState.email,
            name: localUserState.name,
            surname: localUserState.surname,
            accessToken: localUserState.accessToken,
            refreshToken: localUserState.refreshToken,
            expiresAt: localUserState.expiresAt,
          }));
          
          // Eğer token yenileme gerekiyorsa, arka planda yenile ama kullanıcıyı bekletme
          const currentTime = Math.floor(Date.now() / 1000);
          if (localUserState.refreshToken && 
              (!localUserState.expiresAt || localUserState.expiresAt - currentTime < 300)) {
            refreshSession(localUserState.refreshToken).catch(e => 
              console.error('Token refresh failed:', e));
          }
          
          return true;
        }
      } catch (e) {
        console.error('localStorage parsing error:', e);
      }
    }
    
    // Supabase'den mevcut oturum bilgisini al
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    // Oturum bilgisi varsa kullanıcı bilgilerini güncelle
    if (data && data.session) {
      const { session } = data;
      const user = session.user;
      
      if (user && session) {
        // Kullanıcı adını display_name'den al
        const displayName = user.user_metadata?.display_name || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Redux store'u güncelle
        store.dispatch(setUser({
          id: user.id,
          email: user.email || null,
          name: firstName,
          surname: lastName,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at,
        }));
        
        return true;
      }
    }
    
    // Oturum yoksa kullanıcı durumunu temizle
    store.dispatch(clearUser());
    return false;
  } catch (error) {
    console.error('Oturum kontrolü sırasında hata:', error);
    store.dispatch(clearUser());
    return false;
  }
};

/**
 * Kullanıcı çıkış işlemi
 * @returns {Promise<boolean>} İşlem başarılı/başarısız
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    // Kullanıcı durumunu temizle
    store.dispatch(clearUser());
    return true;
  } catch (error) {
    console.error('Çıkış yapılırken hata:', error);
    return false;
  }
};

/**
 * Token yenileme işlemi
 * Not: Bu fonksiyon axiosConfig.ts içindeki token yenileme mekanizmasıyla 
 * koordineli çalışır. Genellikle direkt çağrılmaya gerek yoktur.
 * @param {string} refreshToken - Mevcut refresh token
 * @returns {Promise<boolean>} Token yenileme başarılı/başarısız
 */
export const refreshSession = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      console.warn('Refresh token bulunamadı');
      return false;
    }
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    
    if (error) {
      throw error;
    }
    
    if (data && data.session && data.user) {
      // Kullanıcı adını display_name'den al
      const displayName = data.user.user_metadata?.display_name || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Redux store'u güncelle
      store.dispatch(setUser({
        id: data.user.id,
        email: data.user.email || null,
        name: firstName,
        surname: lastName,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      }));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token yenilenirken hata:', error);
    store.dispatch(clearUser());
    return false;
  }
};
