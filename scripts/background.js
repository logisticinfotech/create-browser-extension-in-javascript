// Initialize Firebase
var config = {
  apiKey: 'AIzaSyD630zazwbURuIPs5AnIgElhuxv82zJ7r4',
  databaseURL: 'extension-237511.firebaseapp.com',
  storageBucket: 'extension-237511.appspot.com'
};
if(typeof firebase!='undefined')
{
	firebase.initializeApp(config);

	function initApp() {
	  // Listen for auth state changes.
	  firebase.auth().onAuthStateChanged(function(user) {
	    console.log('User state change detected from the Background script of the Chrome Extension:', user);
	  });
	}

	window.onload = function() {
	  initApp();
	};
}