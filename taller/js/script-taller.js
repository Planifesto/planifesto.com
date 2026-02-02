// Funciones del modal
function openModal() {
    document.getElementById('termsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('termsModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
    var modal = document.getElementById('termsModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Función para scroll suave a la sección de inscripción
function scrollToInscription() {
    const inscriptionSection = document.getElementById('inscription-section');
    if (inscriptionSection) {
        // Calcular la posición para centrar los botones en la pantalla
        const elementPosition = inscriptionSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        const elementHeight = inscriptionSection.offsetHeight;

        // Centrar el elemento en la pantalla
        const offsetPosition = elementPosition + window.pageYOffset - (windowHeight / 2) + (elementHeight / 2);

        // Scroll suave
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Animaciones y efectos
document.addEventListener('DOMContentLoaded', function () {
    // Header dinámico con detección de dirección de scroll
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    let currentState = 'normal';
    let ticking = false;
    let scrollTimeout;

    function updateHeader() {
        const scrollY = window.scrollY;
        const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
        const scrollDifference = Math.abs(scrollY - lastScrollY);

        clearTimeout(scrollTimeout);

        if (scrollY <= 80) {
            if (currentState !== 'normal') {
                header.classList.remove('scrolled', 'expanded');
                currentState = 'normal';
            }
        } else if (scrollDirection === 'down' && scrollDifference > 3) {
            if (currentState !== 'scrolled') {
                header.classList.remove('expanded');
                header.classList.add('scrolled');
                currentState = 'scrolled';
            }
        } else if (scrollDirection === 'up' && scrollDifference > 2) {
            scrollTimeout = setTimeout(() => {
                if (currentState !== 'expanded' && scrollY > 80) {
                    header.classList.remove('scrolled');
                    header.classList.add('expanded');
                    currentState = 'expanded';
                }
            }, 50);
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    function requestHeaderTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    let scrollTimer;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(requestHeaderTick, 5);
    }, { passive: true });

    // Efecto parallax para el hero
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        let ticking = false;

        function updateParallax() {
            const scrolled = window.pageYOffset;
            const heroHeight = document.querySelector('.hero-section').offsetHeight;

            if (scrolled < heroHeight) {
                const parallaxSpeed = 0.5;
                const scaleSpeed = 0.0001;
                const translateY = scrolled * parallaxSpeed;
                const scale = 1.05 + (scrolled * scaleSpeed);
                const brightness = Math.max(0.7, 0.85 - (scrolled * 0.0002));

                heroBackground.style.transform = `translateY(${translateY}px) scale(${scale})`;
                heroBackground.style.filter = `brightness(${brightness}) saturate(1.1)`;
            }

            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }

        if (window.innerWidth > 768) {
            window.addEventListener('scroll', requestTick);
        } else {
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const scrolled = window.pageYOffset;
                        const translateY = scrolled * 0.3;
                        heroBackground.style.transform = `translateY(${translateY}px) scale(1.02)`;
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        }
    }

    // Animación de entrada para las secciones
    const sections = document.querySelectorAll('.content-section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });

    if (window.innerWidth <= 768) {
        document.documentElement.style.scrollBehavior = 'smooth';
        if (heroBackground) {
            heroBackground.style.backgroundAttachment = 'scroll';
        }
    }

    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            if (window.innerWidth < 768) {
                document.querySelector('meta[name=viewport]').setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
        });

        input.addEventListener('blur', function () {
            if (window.innerWidth < 768) {
                document.querySelector('meta[name=viewport]').setAttribute('content', 'width=device-width, initial-scale=1.0');
            }
        });
    });
});

if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');

    const buttons = document.querySelectorAll('.cta-button, .terms-button, .social-link');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function () {
            this.style.transform = 'scale(0.98)';
        });

        button.addEventListener('touchend', function () {
            this.style.transform = '';
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    (function () {
        let currentIndex = 0;
        const slides = document.querySelectorAll('.opinions-carousel-slide');
        const totalSlides = slides.length;
        const track = document.getElementById('opinionsCarouselTrack');
        const currentSlideEl = document.getElementById('opinionsCurrentSlide');
        const totalSlidesEl = document.getElementById('opinionsTotalSlides');
        const indicatorsContainer = document.getElementById('opinionsIndicators');
        const progressFill = document.getElementById('opinionsProgressFill');
        const prevBtn = document.getElementById('opinionsPrevBtn');
        const nextBtn = document.getElementById('opinionsNextBtn');
        const carousel = document.querySelector('.opinions-carousel-wrapper');

        if (!track || !currentSlideEl || !totalSlidesEl || !indicatorsContainer ||
            !progressFill || !prevBtn || !nextBtn || !carousel || totalSlides === 0) {
            console.error('Error: No se encontraron todos los elementos del carrusel');
            return;
        }

        const AUTO_SCROLL_DELAY = 10000;
        const INACTIVITY_DELAY = 1000;

        let autoScrollInterval = null;
        let inactivityTimer = null;

        totalSlidesEl.textContent = totalSlides;

        function createIndicators() {
            indicatorsContainer.innerHTML = '';

            for (let i = 0; i < totalSlides; i++) {
                const indicator = document.createElement('button');
                indicator.className = 'opinions-indicator';
                indicator.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
                if (i === 0) indicator.classList.add('op-active');

                (function (index) {
                    indicator.addEventListener('click', function () {
                        goToSlide(index);
                    });
                })(i);

                indicatorsContainer.appendChild(indicator);
            }
        }

        function updateIndicators() {
            const indicators = document.querySelectorAll('.opinions-indicator');
            indicators.forEach((indicator, index) => {
                if (index === currentIndex) {
                    indicator.classList.add('op-active');
                } else {
                    indicator.classList.remove('op-active');
                }
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            updateSlider();
            resetAutoScroll();
        }

        function updateSlider() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            currentSlideEl.textContent = currentIndex + 1;
            updateIndicators();

            slides.forEach((slide, index) => {
                if (index === currentIndex) {
                    slide.classList.add('op-slide-active');
                } else {
                    slide.classList.remove('op-slide-active');
                }
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
            resetAutoScroll();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlider();
            resetAutoScroll();
        }

        function startAutoScroll() {
            stopAutoScroll();

            progressFill.style.animation = 'none';
            void progressFill.offsetHeight;
            progressFill.style.animation = `opinionsFillProgress ${AUTO_SCROLL_DELAY}ms linear forwards`;

            autoScrollInterval = setTimeout(function () {
                nextSlide();
                startAutoScroll();
            }, AUTO_SCROLL_DELAY);
        }

        function stopAutoScroll() {
            if (autoScrollInterval) {
                clearTimeout(autoScrollInterval);
                autoScrollInterval = null;
            }
            if (inactivityTimer) {
                clearTimeout(inactivityTimer);
                inactivityTimer = null;
            }
            progressFill.style.animation = 'none';
            progressFill.style.width = '0%';
        }

        function resetAutoScroll() {
            stopAutoScroll();

            inactivityTimer = setTimeout(function () {
                startAutoScroll();
            }, INACTIVITY_DELAY);
        }

        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
            resetAutoScroll();
        }, { passive: true });

        carousel.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }

        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        carousel.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                e.preventDefault();
            }
        });

        carousel.addEventListener('mouseenter', function () {
            stopAutoScroll();
        });

        carousel.addEventListener('mouseleave', function () {
            resetAutoScroll();
        });

        createIndicators();
        resetAutoScroll();

        console.log('Carrusel de opiniones inicializado correctamente');

    })();
});
