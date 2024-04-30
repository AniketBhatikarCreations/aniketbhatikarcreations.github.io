document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth > 600) {
        openDoors();
    }
});

function openDoors() {
    document.querySelectorAll('.door').forEach(door => {
        door.classList.toggle('open');
    });

    // Disable the event listener after animation
    document.getElementById('menu-content').removeEventListener('click', openDoors);
}
