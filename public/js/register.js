
document.addEventListener("DOMContentLoaded", function () {

  // .________________________.
  // ||			           ||
  // ||       Register       ||
  // ||______________________||
  // '			            '

  /* Declaration of Variables */
  const usernameInput = document.getElementById('username-input');
  const passwordInput = document.getElementById('password-input');
  const emailInput = document.getElementById('email-input');
  const phoneInput = document.getElementById('phone-input');
  const confirmPasswordInput = document.getElementById('confirm-password-input');
  const passwordMatchIcon = document.getElementById('password-match-icon');
  const warning = document.getElementById('warning');

  /* Function for checking if both passwords match */
  function checkPasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password === confirmPassword) {
      passwordMatchIcon.textContent = '✓';
      warning.textContent = ''; // Clear any previous warning
    } else {
      passwordMatchIcon.textContent = '✕';
      warning.textContent = 'Passwords do not match'; // Show the warning message
    }
  }

  const registerButton = document.getElementById('register-button');
  registerButton.addEventListener('click', async function () {
    try {
      warning.textContent = '';
      const username = usernameInput.value;
      const password = passwordInput.value;
      const email = emailInput.value;
      const phone = phoneInput.value;

      if (username === '' || password === '' || confirmPasswordInput.value === '' || email === '' || phone === '') {
        warning.textContent = 'All fields are required!'; 
        return; // Exit the function if username or password is empty
      }

      // Check if passwords match before sending the registration data
      const isPasswordMatch = passwordInput.value === confirmPasswordInput.value;
      if (!isPasswordMatch) {
        warning.textContent = 'Passwords do not match! Try Again.';
        // Clear the input fields
        usernameInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        emailInput.value = '';
        phoneInput.value = '';
        return; // Exit the function if passwords don't match
      }

      const jString = JSON.stringify({ username, password, email, phone });

      // Send the registration data to the server
      const response = await fetch('/registerFunc', {
        method: 'POST',
        body: jString,
        headers: {
          'Content-Type': 'application/json'
        },
      });

      // Check the response status to see if the registration was successful
      if (response.status === 200) {
        console.log("Registration successful");
        window.location.href = '/signin';
        // Perform any other actions here, e.g., show a success message, redirect to another page
      } else if (response.status === 400) {
        warning.textContent = 'Registration failed! Try Again.';
        // Show an error message or perform other actions for a failed registration attempt
      } else if (response.status === 500) {
        warning.textContent = 'Username already exists! Try Again.';
        // Show an error message or perform other actions for a failed registration attempt
      } else if (response.status === 600) {
        warning.textContent = 'ERROR';
        // Show an error message or perform other actions for a failed registration attempt
      }
    } catch (error) {
      console.error("Error during registration:", error);
      // Handle the error as needed
    }
  });
});


