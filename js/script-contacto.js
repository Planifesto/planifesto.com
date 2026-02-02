    // =================== FAQ FUNCTIONALITY ===================
    function toggleFAQ(questionElement) {
      const answer = questionElement.nextElementSibling;
      const isActive = questionElement.classList.contains('active');

      // Cerrar todas las otras FAQs
      document.querySelectorAll('.faq-question.active').forEach(function (q) {
        if (q !== questionElement) {
          q.classList.remove('active');
          q.nextElementSibling.classList.remove('active');
        }
      });

      // Toggle la FAQ actual
      if (isActive) {
        questionElement.classList.remove('active');
        answer.classList.remove('active');
      } else {
        questionElement.classList.add('active');
        answer.classList.add('active');
      }
    }

    // =================== CONTACTO APP CLASS ===================
    class ContactoApp {
      constructor() {
        this.initializeAnimations();
        this.handleEmailClicks();
        this.addScrollEffects();
      }

      initializeAnimations() {
        // Stagger animation for cards
        const cards = document.querySelectorAll('.contact-card');
        cards.forEach((card, index) => {
          card.style.animationDelay = `${index * 0.1}s`;
        });

        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-in');
            }
          });
        }, { threshold: 0.1 });

        // Observe all animatable elements
        document.querySelectorAll('.contact-card, .social-section, .faq-section').forEach(el => {
          observer.observe(el);
        });
      }

      handleEmailClicks() {
        // Track email clicks for analytics
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
          link.addEventListener('click', function (e) {
            const email = this.getAttribute('href').replace('mailto:', '');
            console.log('Email clicked:', email);
          });
        });
      }

      addScrollEffects() {
        // Smooth scroll for internal links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
          link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          });
        });

        // Add scroll-to-top functionality
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

          // Add class for styling based on scroll direction
          if (scrollTop > lastScrollTop) {
            document.body.classList.add('scroll-down');
            document.body.classList.remove('scroll-up');
          } else {
            document.body.classList.add('scroll-up');
            document.body.classList.remove('scroll-down');
          }

          lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, { passive: true });
      }
    }

    // =================== UTILITY FUNCTIONS ===================
    class ContactUtils {
      static copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          console.log('Text copied to clipboard:', text);
          // Show success message
          this.showNotification('Email copiado al portapapeles!');
        }).catch(err => {
          console.error('Error copying to clipboard:', err);
        });
      }

      static showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          borderRadius: '8px',
          backgroundColor: type === 'success' ? '#4CAF50' : '#f44336',
          color: 'white',
          fontWeight: '600',
          zIndex: '9999',
          transform: 'translateX(400px)',
          transition: 'transform 0.3s ease'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
          notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
          notification.style.transform = 'translateX(400px)';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 3000);
      }

      static formatPhoneNumber(phone) {
        // Format phone number for better display
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      }

      static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      }
    }

    // =================== ACCESSIBILITY IMPROVEMENTS ===================
    class AccessibilityManager {
      constructor() {
        this.addKeyboardNavigation();
        this.addAriaLabels();
        this.addFocusManagement();
      }

      addKeyboardNavigation() {
        // Enhanced keyboard navigation for interactive elements
        document.querySelectorAll('.social-icon, .contact-card').forEach(element => {
          element.setAttribute('tabindex', '0');

          element.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.click();
            }
          });
        });
      }

      addAriaLabels() {
        // Add ARIA labels for better screen reader support
        const socialIcons = document.querySelectorAll('.social-icon');
        socialIcons.forEach(icon => {
          const platform = icon.querySelector('.social-icon__label').textContent;
          icon.setAttribute('aria-label', `Síguenos en ${platform}`);
          icon.setAttribute('role', 'button');
        });

        // Add ARIA labels to contact cards
        const contactCards = document.querySelectorAll('.contact-card');
        contactCards.forEach(card => {
          const title = card.querySelector('.contact-card__title').textContent;
          card.setAttribute('aria-label', `Información de contacto: ${title}`);
        });
      }

      addFocusManagement() {
        // Improve focus visibility
        const style = document.createElement('style');
        style.textContent = `
          *:focus {
            outline: 2px solid var(--rosa) !important;
            outline-offset: 2px !important;
          }
        `;
        document.head.appendChild(style);
      }
    }

    // =================== INITIALIZATION ===================
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize all modules
      const contactApp = new ContactoApp();
      const accessibilityManager = new AccessibilityManager();

      // Add copy email functionality
      document.querySelectorAll('a[href^="mailto:"]').forEach(emailLink => {
        emailLink.addEventListener('dblclick', function (e) {
          e.preventDefault();
          const email = this.getAttribute('href').replace('mailto:', '');
          ContactUtils.copyToClipboard(email);
        });

        // Add tooltip for double-click functionality
        emailLink.setAttribute('title', 'Doble click para copiar email');
      });

      // Error handling for images
      document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
          this.style.display = 'none';
          console.warn('Error loading image:', this.src);
        });
      });

      // Add loading states for external links
      document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', function () {
          const icon = this.querySelector('.social-icon__image');
          if (icon) {
            icon.style.opacity = '0.7';
            setTimeout(() => {
              icon.style.opacity = '1';
            }, 1000);
          }
        });
      });

      console.log('Planifesto Contacto app initialized successfully! 🚀');
    });
