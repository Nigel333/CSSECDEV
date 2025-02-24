document.addEventListener("DOMContentLoaded", function () {
  // .________________________.
  // ||                       ||
  // ||       Register        ||
  // ||_______________________||
  // '                        '

  /* Declaration of Variables */
  const usernameInput = document.getElementById('username-input');
  const passwordInput = document.getElementById('password-input');
  const confirmPasswordInput = document.getElementById('confirm-password-input');
  const emailInput = document.getElementById('email-input');
  const phoneInput = document.getElementById('phone-input');
  const profilePicInput = document.getElementById('profile-pic-input');
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
      const confirmPassword = confirmPasswordInput.value;
      const email = emailInput.value;
      const phone = phoneInput.value;
      const profilePic = profilePicInput.files[0];

      // Input Validation
      if (!username || !password || !confirmPassword || !email || !phone || !profilePic) {
        warning.textContent = 'All fields are required, including the profile picture!';
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        warning.textContent = 'Passwords do not match! Try Again.';
        // Clear input fields
        usernameInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        emailInput.value = '';
        phoneInput.value = '';
        profilePicInput.value = '';
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('profilePic', profilePic);

      // Send the registration data to the server
      const response = await fetch('/registerFunc', {
        method: 'POST',
        body: formData, // No need for Content-Type; Fetch handles it
      });

      const data = await response.json();
 
      // Handle the response
      if (response.status === 200) {
        console.log("Registration successful");
        window.location.href = '/signin';
      } else if (response.status === 400) {
        warning.textContent = data.message;
      } else if (response.status === 500) {
        warning.textContent = 'Username already exists! Try Again.';
      } else {
        warning.textContent = 'An unexpected error occurred.';
      }
    } catch (error) {
      console.error("Error during registration:", error);
      warning.textContent = 'An error occurred. Please try again.';
    }
  });
});
