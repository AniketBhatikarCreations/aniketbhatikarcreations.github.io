document.addEventListener("DOMContentLoaded", function() {
    const blogLinks = document.querySelectorAll(".blog-title");

    blogLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent the default behavior of the link
            const url = this.getAttribute("href");
            window.location.href = url; // Navigate to the blog page
        });
    });
});
