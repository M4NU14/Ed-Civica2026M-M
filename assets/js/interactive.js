/**
 * SISTEMA INTERATTIVO - Componenti Animati
 * Gestisce flip cards, accordion, quiz, reveal on scroll, parallax
 */

document.addEventListener('DOMContentLoaded', function() {
    initFlipCards();
    initAccordion();
    initQuiz();
    initScrollReveal();
    initInfographics();
    initParallaxEffect();
});

/* ─────────────────────────────────────────────────────────────────── */
/* FLIP CARD - Domanda/Risposta                                      */
/* ─────────────────────────────────────────────────────────────────── */

function initFlipCards() {
    const flipCards = document.querySelectorAll('.flip-card-container');
    flipCards.forEach((card, index) => {
        card.style.setProperty('--delay-index', index);
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
    });
}

/* ─────────────────────────────────────────────────────────────────── */
/* ACCORDION - Sezioni Espandibili                                   */
/* ─────────────────────────────────────────────────────────────────── */

function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            
            // Chiudi tutti gli accordion della stessa sezione
            const parent = this.closest('.accordion-section')?.parentElement;
            if (parent) {
                parent.querySelectorAll('.accordion-header').forEach(h => {
                    if (h !== this) {
                        h.classList.remove('active');
                        h.nextElementSibling.classList.remove('active');
                    }
                });
            }
            
            // Toggle questo accordion
            this.classList.toggle('active');
            this.nextElementSibling.classList.toggle('active');
        });
    });
}

/* ─────────────────────────────────────────────────────────────────── */
/* QUIZ INTERATTIVO                                                   */
/* ─────────────────────────────────────────────────────────────────── */

function initQuiz() {
    const quizzes = document.querySelectorAll('.quiz-container');
    quizzes.forEach((quiz, quizIndex) => {
        const options = quiz.querySelectorAll('.quiz-option');
        const correctAnswer = quiz.dataset.correct;
        let answered = false;

        options.forEach((option, optionIndex) => {
            option.addEventListener('click', function() {
                if (answered) return; // Solo una risposta per quiz
                answered = true;

                const isCorrect = option.dataset.answer === correctAnswer;
                const feedback = quiz.querySelector('.quiz-feedback');

                // Mostra risposta
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
                option.classList.add('selected');

                // Highlight risposta corretta se sbagliata
                if (!isCorrect) {
                    options.forEach(opt => {
                        if (opt.dataset.answer === correctAnswer) {
                            opt.classList.add('correct');
                        }
                    });
                }

                // Mostra feedback
                if (feedback) {
                    feedback.classList.add(isCorrect ? 'success' : 'error');
                    feedback.textContent = isCorrect 
                        ? '✓ Esatto! ' + (option.dataset.explanation || '')
                        : '✗ Non è corretto. ' + (option.dataset.explanation || '');
                }
            });
        });
    });
}

/* ─────────────────────────────────────────────────────────────────── */
/* SCROLL REVEAL - Animazione su Scroll con Intersection Observer    */
/* ─────────────────────────────────────────────────────────────────── */

function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Unobserve dopo l'animazione
                setTimeout(() => {
                    observer.unobserve(entry.target);
                }, 600);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────────────────────────── */
/* PARALLAX EFFECT - Movimento dolce al scroll                        */
/* ─────────────────────────────────────────────────────────────────── */

function initParallaxEffect() {
    const sectionHeads = document.querySelectorAll('.section-head');
    
    if (!sectionHeads.length) return;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        sectionHeads.forEach(head => {
            const rect = head.getBoundingClientRect();
            const distance = rect.top - window.innerHeight / 2;
            
            // Applica effetto parallax lieve
            if (distance < window.innerHeight) {
                const parallaxOffset = distance * 0.1;
                head.style.transform = `translateY(${parallaxOffset}px)`;
            }
        });
    });
}

/* ─────────────────────────────────────────────────────────────────── */
/* INFOGRAFIA INTERATTIVA                                             */
/* ─────────────────────────────────────────────────────────────────── */

function initInfographics() {
    const items = document.querySelectorAll('.infographic-item');
    items.forEach(item => {
        item.addEventListener('mouseenter', function() {
            items.forEach(i => i.style.opacity = '0.6');
            this.style.opacity = '1';
        });
        
        item.addEventListener('mouseleave', function() {
            items.forEach(i => i.style.opacity = '1');
        });
    });
}

/* ─────────────────────────────────────────────────────────────────── */
/* UTILITY - Aggiungi Reveal On Scroll a Elementi                    */
/* ─────────────────────────────────────────────────────────────────── */

window.addRevealAnimation = function(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        el.classList.add('reveal-on-scroll');
    });
    initScrollReveal();
};

/* ─────────────────────────────────────────────────────────────────── */
/* ANIMAZIONE STAGGER PER LISTE                                       */
/* ─────────────────────────────────────────────────────────────────── */

window.applyStaggerAnimation = function(selector) {
    const list = document.querySelector(selector);
    if (!list) return;
    
    list.classList.add('stagger-list');
    const items = list.querySelectorAll('li');
    items.forEach((li, index) => {
        if (index < 6) {
            li.style.setProperty('--stagger-delay', `${index * 0.1}s`);
        }
    });
};

/* ─────────────────────────────────────────────────────────────────── */
/* SMOOTH SCROLL BEHAVIOR                                             */
/* ─────────────────────────────────────────────────────────────────── */

document.documentElement.style.scrollBehavior = 'smooth';

/* ─────────────────────────────────────────────────────────────────── */
/* SCROLL INDICATOR - Mostra progresso di scroll                      */
/* ─────────────────────────────────────────────────────────────────── */

window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTop = window.scrollY;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    // Puoi usare questo per una barra di progresso
    document.documentElement.style.setProperty('--scroll-percent', scrollPercent + '%');
});

