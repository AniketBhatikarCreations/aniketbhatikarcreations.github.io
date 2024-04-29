let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active-slide');
        } else {
            slide.classList.remove('active-slide');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Automatically switch to the next slide every 2-3 seconds
setInterval(nextSlide, 2000 + Math.random() * 1000);

// Show the first slide initially
showSlide(currentSlide);
