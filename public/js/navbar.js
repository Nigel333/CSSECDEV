document.addEventListener("DOMContentLoaded", function () {

  // .________________________.
  // ||			                 ||
  // ||        Sign In       ||
  // ||______________________||
  // '			                  '

  var signedIn = true;
  var userDropdown = document.getElementById("user-dropdown");
  var profilePic = document.getElementById("profile");
  var signinLink = document.getElementById("signin-link");

  if (signedIn) {
    userDropdown.style.display = "block";
    profilePic.style.display = "block";
    signinLink.style.display = "none";
  } else {
    userDropdown.style.display = "none";
    profilePic.style.display = "none";
    signinLink.style.display = "block";
  }

  // .________________________.
  // ||			                 ||
  // ||        Search        ||
  // ||______________________||
  // '			                  '

  var searchInput = document.getElementById("search-text");

  searchInput.addEventListener("keyup", function (event) {

    if (event.keyCode === 13) {
      var searchQuery = searchInput.value;
      var searchResultsURL = "/search/" + searchQuery;
      window.location.href = searchResultsURL;
    }
  });

  // .________________________.
  // ||			                 ||
  // ||        Scroll        ||
  // ||______________________||
  // '			                  '

  window.onscroll = function () {
    scrollFunction();
  };

  function scrollFunction() {
    var scrollButton = document.getElementsByClassName("scroll-up-button")[0];
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      scrollButton.style.display = "block";
    } else {
      scrollButton.style.display = "none";
    }
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  var scrollUpButton = document.getElementsByClassName("scroll-up-button")[0];
  scrollUpButton.addEventListener("click", scrollToTop);
});