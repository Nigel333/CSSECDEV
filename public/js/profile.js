document.addEventListener("DOMContentLoaded", function () {

	// .________________________.
	// ||			           ||
	// ||     Click Filter     ||
	// ||______________________||
	// '			            '

	var filterButtons = document.querySelectorAll(".filter");

	filterButtons.forEach(function (button) {
		button.addEventListener("click", clickFilter);
	});

	var overviewButton = document.querySelector(".filter[data-filter='Posts']");
	overviewButton.classList.add("clicked");

	var containers = document.querySelectorAll("#overview-container > div[id$='-view']");

	containers.forEach(function (container) {
		container.style.display = "none";
	});

	var overviewContainer = document.getElementById("Posts-view");
	overviewContainer.style.display = "block";

	async function clickFilter() {
		var filterType = this.getAttribute("data-filter");

		filterButtons.forEach(function (button) {
			button.classList.remove("clicked");
		});

		this.classList.add("clicked");

		containers.forEach(function (container) {
			container.style.display = "none";
		});

		var selectedContainer = document.getElementById(filterType + "-view");
		selectedContainer.style.display = "block";
	}

	// .________________________.
	// ||			           ||
	// ||    Follow Button     ||
	// ||______________________||
	// '			            '

	var followButton = document.getElementById("follow-button");
	var isFollowed = true; // Set the initial state to followed

	// Initial state of the button
	updateButtonText();

	// Attach click event listener to the button
	followButton.addEventListener("click", function () {
		isFollowed = !isFollowed; // Toggle the follow state
		updateButtonText();
	});

	// Function to update the button text based on the follow state
	function updateButtonText() {
		if (isFollowed) {
			followButton.value = "Follow";
			followButton.classList.add("clicked");
		} else {
			followButton.value = "Unfollow";
			followButton.classList.remove("clicked");
		}
	}
});

// .________________________.
// ||			           ||
// ||    Profile Picture   ||
// ||______________________||
// '			            ' 

document.addEventListener("DOMContentLoaded", function () {
    var changeButton = document.querySelector("#change-image-btn");
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