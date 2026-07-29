import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    // Check dark mode preference
    const isDark = localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Scroll handling for fading the header/nav
    let lastScrollY = window.scrollY;
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        if (!header) return;

        if (window.scrollY > 20) {
            header.classList.add('shadow-md');
            header.style.paddingTop = 'env(safe-area-inset-top, 12px)';
            header.style.paddingBottom = '12px';
        } else {
            header.classList.remove('shadow-md');
            header.style.paddingTop = 'env(safe-area-inset-top, 16px)';
            header.style.paddingBottom = '16px';
        }
        lastScrollY = window.scrollY;
    }, { passive: true });

    // Fade-in observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section, .animate-on-scroll').forEach(section => {
        if (!section.classList.contains('fade-in')) {
            section.classList.add('opacity-0');
        }
        observer.observe(section);
    });

    // Provide Capacitor StatusBar styling if running native
    if (window.Capacitor) {
        import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
            StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(console.error);
        });
    }
});
