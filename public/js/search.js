document.addEventListener("DOMContentLoaded", function () {

    // .________________________.
    // ||			           ||
    // ||     Click Filter     ||
    // ||______________________||
    // '			            '

    var filterButtons = document.querySelectorAll(".search-filter");

    filterButtons.forEach(function (button) {
        button.addEventListener("click", clickFilter);
    });

    var postsButton = document.querySelector(".search-filter[data-filter='search-Posts']");
    postsButton.classList.add("clicked");

    var containers = document.querySelectorAll(".search-finds > div[id$='-view']");

    containers.forEach(function (container) {
        container.style.display = "none";
    });

    var postsContainer = document.getElementById("search-Posts-view");
    postsContainer.style.display = "block";

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
});