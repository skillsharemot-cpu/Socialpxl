document.addEventListener('DOMContentLoaded', () => {
    
    // --- Sticky Navbar ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobil Hamburger Menü ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (menuBtn && navbar) {
        const menuIcon = menuBtn.querySelector('i');
        const closeMenu = () => {
            navbar.classList.remove('nav-open');
            menuBtn.setAttribute('aria-expanded', 'false');
            if (menuIcon) { menuIcon.classList.add('fa-bars'); menuIcon.classList.remove('fa-xmark'); }
        };
        menuBtn.addEventListener('click', () => {
            const isOpen = navbar.classList.toggle('nav-open');
            menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (menuIcon) {
                menuIcon.classList.toggle('fa-bars', !isOpen);
                menuIcon.classList.toggle('fa-xmark', isOpen);
            }
        });
        // Linkre kattintva záruljon be a menü
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        // Asztali nézetre visszaváltáskor reset
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) closeMenu();
        });
    }

    // --- GYIK Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            // Bezárjuk a többit, ha akarjuk (jelenleg nem zárjuk be, hagyjuk hogy több is nyitva lehessen)
            
            // Toggle active class
            item.classList.toggle('active');
            
            // Az ikon módosítása (+ ból x-re transformációval van megoldva a CSS-ben)
        });
    });

    // --- Smooth Scroll Anchor Linkekhez ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                // Fejléc magasság kompenzáció (kb 80px)
                const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

});
