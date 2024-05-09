// login.js

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    
    // // Perform authentication, for example, check against stored credentials
    // if (username === 'admin' && password === 'password') {
    //     // Store login status in local storage
    //     chrome.storage.local.set({ 'isLoggedIn': true });
    //     // Redirect to main extension page
    //     chrome.tabs.create({ url: 'popup.html' });
    // } else {
    //     alert('Invalid username or password.');
    // }

    const response = await fetch(`http://localhost:4000/api/loginuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const json = await response.json();
    // console.log(json);

    if (!json.success) {
      alert("Enter valid credentials");
    }
    if (json.success) {
      // console.log(credentials.email);
      chrome.storage.local.set({ 'isLoggedIn': true, "userEmail": email, "authtoken": json.authtoken });
        alert("login succefully");
     
    
    }

});
