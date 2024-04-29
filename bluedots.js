// Set up canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size to window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Array to hold dots
let dots = [];

// Function to create a dot
function createDot() {
    let dot = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 5 + 1,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        color: 'rgb(0, 255, 255)' // Fluoro blue color
    };
    dots.push(dot);
}

// Function to update dots
function updateDots() {
    for (let dot of dots) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        // Wrap around edges
        if (dot.x < 0) dot.x = canvas.width;
        if (dot.x > canvas.width) dot.x = 0;
        if (dot.y < 0) dot.y = canvas.height;
        if (dot.y > canvas.height) dot.y = 0;
    }
}

// Function to draw dots
function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
        ctx.closePath();
    }
}

// Function to animate
function animate() {
    requestAnimationFrame(animate);
    updateDots();
    drawDots();
}

// Create initial dots
for (let i = 0; i < 50; i++) {
    createDot();
}

// Start animation
animate();
