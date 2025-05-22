/**
 * Helper functions for debugging authentication issues
 * 
 * Run these functions in the browser console to diagnose auth problems
 */

/**
 * Print the current auth state from Redux and localStorage
 */
function printAuthState() {
  console.group('Authentication State Debug');
  
  // Get Redux state
  if (window.store) {
    const state = window.store.getState();
    console.log('Redux User State:', {
      isLoggedIn: state.user.isLoggedIn,
      id: state.user.id,
      email: state.user.email,
      accessToken: state.user.accessToken ? 
        `${state.user.accessToken.substring(0, 10)}...` : null,
      refreshToken: state.user.refreshToken ? 
        `${state.user.refreshToken.substring(0, 10)}...` : null,
      expiresAt: state.user.expiresAt ? 
        new Date(state.user.expiresAt * 1000).toLocaleString() : null
    });
  } else {
    console.log('Redux store not accessible');
  }
  
  // Get localStorage state
  const userStateStr = localStorage.getItem('userState');
  if (userStateStr) {
    try {
      const localUserState = JSON.parse(userStateStr);
      console.log('LocalStorage User State:', {
        isLoggedIn: localUserState.isLoggedIn,
        id: localUserState.id,
        email: localUserState.email,
        accessToken: localUserState.accessToken ? 
          `${localUserState.accessToken.substring(0, 10)}...` : null,
        refreshToken: localUserState.refreshToken ? 
          `${localUserState.refreshToken.substring(0, 10)}...` : null,
        expiresAt: localUserState.expiresAt ? 
          new Date(localUserState.expiresAt * 1000).toLocaleString() : null
      });
    } catch (e) {
      console.error('LocalStorage parsing error:', e);
    }
  } else {
    console.log('No user state in localStorage');
  }
  
  // Token expiration status
  if (userStateStr) {
    try {
      const localUserState = JSON.parse(userStateStr);
      if (localUserState.expiresAt) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeToExpiration = localUserState.expiresAt - currentTime;
        
        console.log('Token status:', {
          currentTime: new Date().toLocaleString(),
          expiresAt: new Date(localUserState.expiresAt * 1000).toLocaleString(),
          timeToExpirationSecs: timeToExpiration,
          isExpired: timeToExpiration <= 0,
          expiresSoon: timeToExpiration > 0 && timeToExpiration < 300
        });
      }
    } catch (e) {
      console.error('Token expiration check error:', e);
    }
  }
  
  console.groupEnd();
}

/**
 * Test the token refresh mechanism with an expired token
 */
async function testAuthRefresh() {
  console.group('Auth Refresh Test');
  
  // Get the current state
  const beforeState = window.store ? window.store.getState().user : null;
  console.log('Before token refresh:', beforeState);
  
  try {
    // Make a test API request
    console.log('Making API request...');
    const response = await window.api.get('/rest/v1/tasks?select=*&limit=1');
    console.log('API response:', response);
    
    // Get the state after the request
    const afterState = window.store ? window.store.getState().user : null;
    console.log('After API request:', afterState);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('API request failed:', error);
  }
  
  console.groupEnd();
}

/**
 * Force the token to expire for testing purposes
 */
function forceTokenExpiration() {
  console.group('Force Token Expiration');
  
  // Get current state
  const userStateStr = localStorage.getItem('userState');
  
  if (!userStateStr) {
    console.error('No user state found in localStorage');
    console.groupEnd();
    return;
  }
  
  try {
    const userState = JSON.parse(userStateStr);
    
    // Current token info
    console.log('Current token expires at:', 
      userState.expiresAt ? 
        new Date(userState.expiresAt * 1000).toLocaleString() : 'unknown');
    
    // Set token to expire 1 hour ago
    const expiredTime = Math.floor(Date.now() / 1000) - 3600;
    userState.expiresAt = expiredTime;
    
    // Update localStorage
    localStorage.setItem('userState', JSON.stringify(userState));
    console.log('Token expiration forced to:', new Date(expiredTime * 1000).toLocaleString());
    
    // Update Redux store if possible
    if (window.store && window.store.dispatch) {
      window.store.dispatch({
        type: 'user/forceTokenExpiration',
        payload: expiredTime
      });
      console.log('Redux store updated with expired token');
    }
  } catch (e) {
    console.error('Error forcing token expiration:', e);
  }
  
  console.groupEnd();
}

// Print usage instructions
console.log(`
===== AUTH DEBUGGING TOOLS =====

Available functions:
- printAuthState() - Show current auth state from Redux and localStorage
- forceTokenExpiration() - Force the current token to be expired
- testAuthRefresh() - Test if the token refresh works by making an API request

Example usage:
  printAuthState();
`);
