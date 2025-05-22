/**
 * This is a utility script to test the token refresh mechanism
 * It simulates an API call with an expired token to test the refresh flow
 * 
 * Run this script in the browser console after logging in to test the token refresh.
 */

// Step 1: Simulate an expired token by modifying the Redux store
function simulateExpiredToken() {
  // Get current state from localStorage
  const userStateStr = localStorage.getItem('userState');
  
  if (!userStateStr) {
    console.error('No user state found. Please log in first.');
    return false;
  }
  
  try {
    const userState = JSON.parse(userStateStr);
    
    if (!userState.accessToken || !userState.refreshToken) {
      console.error('No tokens found. Please log in first.');
      return false;
    }
    
    console.log('Current token state:', {
      accessToken: userState.accessToken.substring(0, 10) + '...',
      expiresAt: new Date(userState.expiresAt * 1000).toLocaleString(),
      refreshToken: userState.refreshToken.substring(0, 10) + '...'
    });
    
    // Force the access token to be expired by setting expiry to a time in the past
    userState.expiresAt = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    
    // Update localStorage
    localStorage.setItem('userState', JSON.stringify(userState));
    console.log('Token expiration forced to 1 hour ago');
    
    // Force Redux store update (dispatch an action)
    // This assumes you have access to the store in the browser environment
    // You may need to add an action to your Redux store to support this
    if (window.store && window.store.dispatch) {
      window.store.dispatch({
        type: 'user/forceTokenExpiration',
        payload: userState.expiresAt
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error simulating token expiration:', error);
    return false;
  }
}

// Step 2: Make an API call to test if token refresh works
async function testTokenRefresh() {
  console.log('Testing token refresh mechanism...');
  
  // Make sure token is expired first
  if (!simulateExpiredToken()) {
    return;
  }
  
  // Wait a moment to ensure the change takes effect
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    console.log('Making API request with expired token...');
    
    // Use the axios instance from your application
    // This assumes your axios instance is available globally for testing
    // You might need to adapt this to your actual API structure
    const response = await window.api.get('/rest/v1/tasks?select=*&limit=1');
    
    console.log('API call succeeded after token refresh!', response);
    
    // Verify that the token was actually refreshed
    const updatedUserState = JSON.parse(localStorage.getItem('userState'));
    console.log('New token state:', {
      accessToken: updatedUserState.accessToken.substring(0, 10) + '...',
      expiresAt: new Date(updatedUserState.expiresAt * 1000).toLocaleString(),
      refreshToken: updatedUserState.refreshToken.substring(0, 10) + '...'
    });
    
    return true;
  } catch (error) {
    console.error('API call failed:', error);
    console.error('Token refresh mechanism may not be working as expected');
    return false;
  }
}

// Instructions to test
console.log(`
=== TOKEN REFRESH TEST INSTRUCTIONS ===
1. Make sure you're logged in to the application
2. Run the function testTokenRefresh() in the console
3. Observe the output to see if token refresh works correctly

Example: testTokenRefresh().then(success => console.log('Test completed successfully:', success));
`);
