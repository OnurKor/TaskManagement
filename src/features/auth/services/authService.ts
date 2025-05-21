import { supabase } from '../../../shared/utils/supabaseClient';
import { store } from '../../../store/store';
import { setUser, clearUser, refreshTokenSuccess } from '../../../store/slices/userSlice';

// Mevcut oturum durumunu kontrol et
export const checkSession = async () => {
  try {
    // Önce localStorage'dan kullanıcı durumunu kontrol et
    const userStateStr = localStorage.getItem('userState');
    let localUserState = null;
    
    if (userStateStr) {
      try {
        localUserState = JSON.parse(userStateStr);
        // Eğer refresh token varsa ve token süresi dolmuşsa, yenilemeyi dene
        if (localUserState && localUserState.refreshToken) {
          const currentTime = Math.floor(Date.now() / 1000);
          
          // Token süresi dolmuş ya da 5 dakika içinde dolacaksa
          if (!localUserState.expiresAt || 
              (localUserState.expiresAt && localUserState.expiresAt - currentTime < 300)) {
            return await refreshSession();
          }
          
          // Hala geçerli bir token varsa, localStorage'dan yükle
          if (localUserState.isLoggedIn && localUserState.accessToken) {
            // Redux store'u localStorage'dan güncelle
            store.dispatch(setUser({
              id: localUserState.id,
              email: localUserState.email,
              name: localUserState.name,
              surname: localUserState.surname,
              accessToken: localUserState.accessToken,
              refreshToken: localUserState.refreshToken,
              expiresAt: localUserState.expiresAt,
            }));
            return true;
          }
        }
      } catch (e) {
        console.error('localStorage parsing error:', e);
      }
    }
    
    // localStorage'dan yükleme başarısız olursa Supabase'den kontrol et
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
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
    } else {
      // Geçerli oturum yoksa kullanıcı durumunu temizle
      store.dispatch(clearUser());
      return false;
    }
  } catch (error) {
    console.error('Oturum kontrolü sırasında hata:', error);
    store.dispatch(clearUser());
    return false;
  }
};

// Kullanıcı çıkış yaptığında
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

// Tokeni yenile
export const refreshSession = async () => {
  try {
    // Önce localStorage'dan, sonra Redux store'dan refreshToken'ı al
    let refreshToken;
    const userStateStr = localStorage.getItem('userState');
    
    if (userStateStr) {
      try {
        const localUserState = JSON.parse(userStateStr);
        refreshToken = localUserState.refreshToken;
      } catch (e) {
        console.error('localStorage parsing error:', e);
      }
    }
    
    // localStorage'da token bulunamadıysa Redux store'dan al
    if (!refreshToken) {
      const state = store.getState();
      refreshToken = state.user.refreshToken;
    }
    
    if (!refreshToken) {
      console.log('Yenilenecek token bulunamadı');
      return false;
    }
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    
    if (error) {
      console.error('Token yenileme hatası:', error);
      throw error;
    }
    
    if (data && data.session && data.user) {
      // Kullanıcı adını display_name'den al
      const displayName = data.user.user_metadata?.display_name || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      console.log('Token başarıyla yenilendi');
      
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
