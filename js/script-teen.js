// Crear estrellas flotantes
const starsContainer = document.getElementById('stars');
const starPositions = [
    { left: '10%', top: '20%', delay: 0 },
    { left: '85%', top: '15%', delay: 1 },
    { left: '20%', top: '70%', delay: 2 },
    { left: '75%', top: '65%', delay: 0.5 },
    { left: '50%', top: '10%', delay: 1.5 },
    { left: '15%', top: '45%', delay: 2.5 },
    { left: '90%', top: '45%', delay: 1.8 },
];

starPositions.forEach(pos => {
    const star = document.createElement('div');
    star.className = 'star';
    star.textContent = '★';
    star.style.left = pos.left;
    star.style.top = pos.top;
    star.style.animationDelay = `${pos.delay}s`;
    starsContainer.appendChild(star);
});
