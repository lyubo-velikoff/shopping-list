// Initialize Firebase
var config = {
    apiKey: "AIzaSyAc5m3FY73rw9NPBG1T0bqie1qtMeDzYkE",
    authDomain: "shopping-list-b65e3.firebaseapp.com",
    databaseURL: "https://shopping-list-b65e3.firebaseio.com",
    projectId: "shopping-list-b65e3",
    storageBucket: "shopping-list-b65e3.appspot.com",
    messagingSenderId: "849292011260"
};
firebase.initializeApp(config);


// Get Elements
var txtEmail = document.getElementById('email');
var txtPassword = document.getElementById('password');
var btnLogin = document.getElementById('login-button');
var btnSignup = document.getElementById('sign-button');
var btnLogout = document.getElementById('logout-button');


// Login Listener
btnLogin.addEventListener('click', function(e) {
    var email = txtEmail.value;
    var password = txtPassword.value;
    var auth = firebase.auth();
    
    var promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(function(e) {
        console.log(e.message);
    });
});


// Sign up Listener
btnSignup.addEventListener('click', function(e) {
    var email = txtEmail.value;
    var password = txtPassword.value;
    var auth = firebase.auth();
    
    var promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(function(e) {
        console.log(e.message);
    });
});

// Logout listener
btnLogout.addEventListener('click', function(e) {
    firebase.auth().signOut();
});

// Add a realtime Firebase Auth listener
firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
        console.log(user);
        btnLogout.classList.remove('hide');
    } else {
        console.log('not logged in');
    }

});

