// Mobile menu: the top-right button opens and closes the nav links
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelectorAll('.nav-links a');
const mobileQuery = window.matchMedia('(max-width: 800px)');

function setMenuOpen(open) {
    header.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', open);
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

menuButton.addEventListener('click', () => {
    setMenuOpen(!header.classList.contains('is-open'));
});

navLinks.forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) {
        setMenuOpen(false);
        menuButton.focus();
    }
});

// Close the menu if the screen gets wide enough for the desktop links
mobileQuery.addEventListener('change', (event) => {
    if (!event.matches) setMenuOpen(false);
});

// Fixed header: white background once the page is scrolled
function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 0);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Email: built only when clicked, so bots reading the HTML can't collect it
const emailUser = 'emil.ivanov.207';
const emailDomain = 'gmail.com';

document.querySelectorAll('.js-email').forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = 'mailto:' + emailUser + '@' + emailDomain;
    });
});

// ---------- Animations (GSAP) ----------
// GSAP moves things smoothly from one set of values to another over time.
// ScrollTrigger is a GSAP plugin that starts animations when you scroll.

if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // GSAP didn't load, so show everything instead of leaving it hidden
    document.documentElement.classList.remove('js');
} else {
    // Plugins must be registered once before you use them
    gsap.registerPlugin(ScrollTrigger);

    // matchMedia runs code only when media queries match (like CSS @media).
    // If the screen size changes, it undoes the animations and runs them again.
    const mm = gsap.matchMedia();

    mm.add({
        isMobile: '(max-width: 800px)',
        motionOk: '(prefers-reduced-motion: no-preference)',
    }, (context) => {
        // true/false for each query above
        const { isMobile, motionOk } = context.conditions;

        // Skip all animations for people who turned motion off in their settings
        if (!motionOk) return;

        // A timeline plays animations one after another.
        // defaults = settings shared by every animation in it.
        // ease = how it speeds up/slows down ('power3.out' starts fast, ends soft).
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

        intro
            // fromTo(target, start values, end values)
            // autoAlpha = opacity + visibility together (0 = hidden, 1 = shown)
            // y = move up/down in pixels (negative = up)
            // duration = length in seconds
            .fromTo('.site-header',
                { autoAlpha: 0, y: -20 },
                // clearProps removes the leftover transform when done,
                // otherwise the mobile menu couldn't cover the screen
                { autoAlpha: 1, y: 0, duration: 0.8, clearProps: 'transform' })
            // The last argument is the start time: '-=0.3' means
            // "start 0.3s before the previous animation ends" (overlap)
            .fromTo('.hero-title',
                { autoAlpha: 0, y: isMobile ? 40 : 60 },
                { autoAlpha: 1, y: 0, duration: 1 },
                '-=0.3');

        // Scroll: each [data-reveal] element fades up as it comes into view
        const distance = isMobile ? 24 : 40;

        // set() applies values instantly (no animation): hide and push down
        gsap.set('[data-reveal]', { autoAlpha: 0, y: distance });

        // batch() groups elements that scroll into view at the same time
        ScrollTrigger.batch('[data-reveal]', {
            // Start when the element's top reaches 85% down the screen
            start: isMobile ? 'top 90%' : 'top 85%',
            // Only animate the first time (don't hide again when scrolling up)
            once: true,
            // Runs when elements reach the start point
            onEnter: (elements) => {
                // to() animates from the current values to these
                gsap.to(elements, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    // Wait 0.15s between each element, so they appear one by one
                    stagger: 0.15,
                    // Anything already on screen waits for the intro to finish
                    delay: intro.isActive() ? intro.duration() - intro.time() : 0,
                });
            },
        });
    });
}
