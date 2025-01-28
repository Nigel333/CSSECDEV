// .________________________.
// ||			           ||
// ||      Edit Profile    ||
// ||______________________||
// '			            ' 

async function editProfile() {
  const newName = document.getElementById("new-name").value;
  const newBio = document.getElementById("new-bio").value;

  try {
    const requestBody = { name: newName, bio: newBio };

    const response = await fetch(`/edit-profile`, {
      method: 'PUT',
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.status === 200) {
      console.log("Profile updated");
      window.location.href = "/main-profile";
      // Optionally, you can update the profile content on the page here
    } else {
      console.error("Bad request");
    }
  } catch (error) {
    console.error("Error during profile update:", error);
  }
}


// Changing Profile Picture
document.addEventListener("DOMContentLoaded", function () {
  var changeButton = document.querySelector("#edit-change-image-btn");
  changeButton.addEventListener("click", changeProfile);

  function changeProfile() {
    var mediaInput = document.createElement("input");
    mediaInput.type = "file";
    mediaInput.accept = "image/*";
    mediaInput.style.display = "none";

    mediaInput.addEventListener("change", function (event) {
      var file = event.target.files[0];
      var reader = new FileReader();

      reader.onload = function (e) {
        var newProfileMain = document.getElementById("profile-pic");

        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");

        var image = new Image();
        image.onload = function () {
          var imageWidth = image.width;
          var imageHeight = image.height;

          var cropSize = 800; // Adjust this value to change the crop size

          var cropX = Math.max(0, (imageWidth - cropSize) / 2);
          var cropY = Math.max(0, (imageHeight - cropSize) / 2);
          var cropWidth = Math.min(cropSize, imageWidth);
          var cropHeight = Math.min(cropSize, imageHeight);

          canvas.width = 300;
          canvas.height = 300;

          context.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            300,
            300
          );

          newProfileMain.src = canvas.toDataURL();
        };

        image.src = e.target.result;
      };

      reader.readAsDataURL(file);
    });

    mediaInput.click();
  }
});

