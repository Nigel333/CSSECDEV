
document.addEventListener("DOMContentLoaded", function () {

    // .________________________.
    // ||			           ||
    // ||       Sign-in        ||
    // ||______________________||
    // '			            '

    /* Declaration of Variables */
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const warning = document.getElementById('warning');

    const signinButton = document.getElementById('signin-button');
    signinButton.addEventListener('click', async function () {
        try {
            warning.textContent = '';
            const username = usernameInput.value;
            const password = passwordInput.value;

            if (username === '' || password === '') {
                warning.textContent = 'Username or password cannot be empty';
                return; // Exit the function if username or password is empty
            }

            // const response = await fetch('/signinFunc'); // Replace '/api/data' with the actual endpoint on your server
            // if (!response.ok) {
            //     warning.textContent = 'Sign-in failed! Try Again.';
            //     usernameInput.value = '';
            //     passwordInput.value = '';
            //     throw new Error('Request failed.');
            // }
            // const userDB = await response.json();
            // // Check if passwords match before sending the registration data
            // console.log(username, password);
            // const userFound = userDB.find(user => user.username === ("u/" + username) && user.password === password);
            // console.log(userFound);

            const response = await fetch('/signinFunc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                // Parse the JSON response to access the error message
                const errorData = await response.json();
                warning.textContent = errorData.message; // Set the warning to the error message
                usernameInput.value = '';
                passwordInput.value = '';
                throw new Error('Request failed.');
            }

            const responseData = await response.json();
            console.log(responseData.message); // Sign-in successful

            // Redirect to the homepage or other pages as needed
            window.location.href = '/home';
        } catch (error) {
            console.error("Error during sign-in:", error);
            // Handle the error as needed
        }
    });
});


