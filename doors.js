document.addEventListener('DOMContentLoaded', function() {
    openDoors();
});

function openDoors() {
    document.querySelectorAll('.door').forEach(door => {
        door.classList.toggle('open');
    });
}
