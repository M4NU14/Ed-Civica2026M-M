// ========== ANIMAZIONI E INTERATTIVITÀ PAGINE ==========

document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer per animazioni al scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // Osserva solo una volta
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Osserva tutti gli elementi animati
    const animatedElements = document.querySelectorAll(
        '.info-card, .topic-section, .text-block, .fact-card, .callout, .metric-card, .district-link'
    );
    
    animatedElements.forEach((el, index) => {
        // Aggiungi classe per far partire l'animazione solo al caricamento della pagina
        if (window.pageJustLoaded) {
            observer.observe(el);
        } else {
            el.classList.add('in-view');
        }
    });

    // Aggiungi interattività ai bullet points
    addBulletAnimations();
    
    // Aggiungi effetto parallax leggero ai card
    addParallaxEffect();
    
    // Nascondi i dettagli segreti al caricamento
    revealSecrets();
});

// ========== ANIMAZIONI BULLET POINTS ==========
function addBulletAnimations() {
    const bulletLists = document.querySelectorAll('.bullet-list, .compact-list');
    
    bulletLists.forEach(list => {
        const items = list.querySelectorAll('li');
        items.forEach((item, index) => {
            item.style.animation = `fadeInLeft 0.6s ease-out ${0.1 * (index + 1)}s both`;
        });
    });
}

// ========== EFFETTO PARALLAX LEGGERO ==========
function addParallaxEffect() {
    const cards = document.querySelectorAll('.info-card, .text-block, .fact-card');
    
    window.addEventListener('mousemove', (e) => {
        const xPercent = (e.clientX / window.innerWidth) * 100;
        const yPercent = (e.clientY / window.innerHeight) * 100;
        
        cards.forEach(card => {
            const moveX = (xPercent - 50) * 0.5;
            const moveY = (yPercent - 50) * 0.5;
            
            card.style.setProperty('--mouse-x', `${moveX}px`);
            card.style.setProperty('--mouse-y', `${moveY}px`);
        });
    }, { passive: true });
}

// ========== RIVELA CONTENUTI NASCOSTI ==========
function revealSecrets() {
    // Aggiungi un pulsante nascosto per reveal extra contenuti
    const sections = document.querySelectorAll('.topic-section');
    
    sections.forEach(section => {
        const h2 = section.querySelector('h2');
        if (h2) {
            h2.style.cursor = 'pointer';
            h2.title = 'Clicca per ulteriori dettagli';
            
            h2.addEventListener('click', () => {
                section.classList.toggle('expanded');
                
                if (section.classList.contains('expanded')) {
                    section.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        section.style.transform = 'scale(1)';
                    }, 300);
                }
            });
        }
    });
}

// ========== SMOOTH SCROLL ENHANCEMENT ==========
window.addEventListener('load', () => {
    window.pageJustLoaded = false;
});

window.pageJustLoaded = true;

// ========== AGGIUNGI STILE PER ELEMENTI IN VIEW ==========
const style = document.createElement('style');
style.innerHTML = `
    .info-card,
    .topic-section,
    .text-block,
    .fact-card,
    .callout,
    .metric-card,
    .district-link {
        opacity: 0;
        animation: none;
    }
    
    .info-card.in-view,
    .topic-section.in-view,
    .text-block.in-view,
    .fact-card.in-view,
    .callout.in-view,
    .metric-card.in-view,
    .district-link.in-view {
        opacity: 1;
    }
    
    /* Tooltip per i section numbers */
    .section-number {
        position: relative;
    }
    
    .section-number:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--topic-strong);
        color: white;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 0.8rem;
        white-space: nowrap;
        pointer-events: none;
        animation: fadeInUp 0.3s ease-out;
        z-index: 10;
    }
    
    /* Effetto smooth su scroll */
    @media (prefers-reduced-motion: no-preference) {
        * {
            scroll-behavior: smooth;
        }
    }
`;
document.head.appendChild(style);
