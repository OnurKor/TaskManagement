import { supabase } from './supabaseClient';
import { store } from '../redux/store';
import { setUser, clearUser } from '../redux/slices/userSlice';

// Mevcut oturum durumunu kontrol et
export const checkSession = async () => {
  try {
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
    const state = store.getState();
    const { refreshToken } = state.user;
    
    if (!refreshToken) {
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
