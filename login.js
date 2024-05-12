// login.js

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    

    const response = await fetch(`https://activitymanagerdashboard-1.onrender.com/api/loginuser`, {
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
