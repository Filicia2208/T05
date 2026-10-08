document.addEventListener("DOMContentLoaded", function () {

    // Get the current page
    const currentPage = document.body.dataset.page;

    // Get all navigation links
    const links = document.querySelectorAll(".top_nav a");

    // Highlight the current page
    links.forEach(function (link) {

        if (link.dataset.page === currentPage) {
            link.classList.add("active");
        }

        // Navigate to the selected page
        link.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = link.getAttribute("href");
        });

    });


    // Clicking the logo returns to Home
    const logo = document.querySelector(".powericon_logo_link");

    logo.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "index.html";
    });

});