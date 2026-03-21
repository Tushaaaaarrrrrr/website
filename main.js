import { LogoParticles } from './logo-particles.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particle-canvas');
    const mainContent = document.getElementById('main-content');
    
    // Check if the animation has already been played in this session
    const animationPlayed = sessionStorage.getItem('alpha-logo-animation-played');
    const isHomeRoute = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');

    if (!animationPlayed && isHomeRoute) {
        // Run animation
        const logoAnimation = new LogoParticles('particle-canvas');
        
        window.addEventListener('logo-animation-finished', () => {
            // Transition to main content
            canvas.style.opacity = '0';
            mainContent.classList.add('visible');
            
            // Mark as played
            sessionStorage.setItem('alpha-logo-animation-played', 'true');
            
            // Cleanup canvas after transition
            setTimeout(() => {
                canvas.style.display = 'none';
            }, 1500);
        });
    } else {
        // Skip animation and show content immediately
        canvas.style.display = 'none';
        mainContent.classList.add('visible');
    }
});
