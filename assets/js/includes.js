(() => {
  const path = location.pathname;

  // Detect language based on URL folder: /en/... or /es/...
  const isEN = path.includes("/en/");
  const lang = isEN ? "en" : "es";

  // Detect if we are on language index: /en/, /en/index.html, /es/, /es/index.html
  const isLangIndex = /\/(en|es)\/(?:index\.html)?$/.test(path);

  // Relative paths (GitHub Pages-safe)
  const P = {
    partialHeader: "../partials/header.html",
    partialFooter: "../partials/footer.html",
    logo: "../assets/img/orugga_logo_white_transparent_wgreen.png",
    switchTo: isEN ? "../es/index.html" : "../en/index.html",
  };

  function getRoutes(language, onIndex) {
    if (language === "en") {
      return {
        home: "./index.html",
        services: onIndex ? "#services" : "./index.html#services",
        about: onIndex ? "#about" : "./index.html#about",
        contact: onIndex ? "#contact" : "./index.html#contact",
      };
    }
    // Spanish kept functional; adjust anchors later if your ids differ.
    return {
      home: "./index.html",
      services: onIndex ? "#services" : "./index.html#services",
      about: onIndex ? "#about" : "./index.html#about",
      contact: onIndex ? "#contacto" : "./index.html#contacto",
    };
  }

  // Duplicates items for seamless loop (translateX(-50%))
  function initClientsMarquee() {
    const tracks = document.querySelectorAll("[data-clients-track]");
    if (!tracks.length) return;

    tracks.forEach((track) => {
      if (track.dataset.duped === "1") return;
      const kids = Array.from(track.children);
      kids.forEach((node) => track.appendChild(node.cloneNode(true)));
      track.dataset.duped = "1";
    });
  }

  // Header shrink on scroll (requires CSS .header.is-scrolled ...)
  function initHeaderShrink() {
    const header = document.querySelector(".header");
    if (!header) return;

    const THRESHOLD = 12;

    const apply = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      header.classList.toggle("is-scrolled", y > THRESHOLD);

      const h = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--header-h", `${Math.round(h)}px`);
    };

    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply, { passive: true });
  }

  // Mobile menu toggle (robust: toggles 'hidden')
  function initMobileNav() {
    const btn = document.querySelector("[data-mobile-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");
    if (!btn || !panel) return;

    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    const setOpen = (open) => {
      panel.classList.toggle("hidden", !open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    };

    setOpen(false);

    btn.addEventListener("click", () => {
      const willOpen = panel.classList.contains("hidden");
      setOpen(willOpen);
    });

    panel.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      setOpen(false);
    });
  }

  async function injectPartials() {
    const headerHost = document.getElementById("siteHeader");
    const footerHost = document.getElementById("siteFooter");
    if (!headerHost || !footerHost) return;

    const [headerHTML, footerHTML] = await Promise.all([
      fetch(P.partialHeader).then((r) => {
        if (!r.ok) throw new Error(`Header partial not found: ${P.partialHeader}`);
        return r.text();
      }),
      fetch(P.partialFooter).then((r) => {
        if (!r.ok) throw new Error(`Footer partial not found: ${P.partialFooter}`);
        return r.text();
      }),
    ]);

    headerHost.innerHTML = headerHTML;
    footerHost.innerHTML = footerHTML;

    const r = getRoutes(lang, isLangIndex);

    // Logo
    const logo = headerHost.querySelector("[data-logo]");
    if (logo) logo.src = P.logo;

    // Brand home
    const home = headerHost.querySelector("[data-home]");
    if (home) home.href = r.home;

    // Header nav
    const navHome = headerHost.querySelector('[data-nav="home"]');
    if (navHome) navHome.href = r.home;

    const navServices = headerHost.querySelector('[data-nav="services"]');
    if (navServices) navServices.href = r.services;

    const navAbout = headerHost.querySelector('[data-nav="about"]');
    if (navAbout) navAbout.href = r.about;

    const navContact = headerHost.querySelector('[data-nav="contact"]');
    if (navContact) navContact.href = r.contact;

    // CTA
    const cta = headerHost.querySelector("[data-cta]");
    if (cta) cta.href = r.contact;

    // Footer links
    const fHome = footerHost.querySelector('[data-foot="home"]');
    if (fHome) fHome.href = r.home;

    const fServices = footerHost.querySelector('[data-foot="services"]');
    if (fServices) fServices.href = r.services;

    const fAbout = footerHost.querySelector('[data-foot="about"]');
    if (fAbout) fAbout.href = r.about;

    const fContact = footerHost.querySelector('[data-foot="contact"]');
    if (fContact) fContact.href = r.contact;

    // Language switch
    const langSwitch = headerHost.querySelector("[data-lang-switch]");
    if (langSwitch) {
      langSwitch.href = P.switchTo;
      langSwitch.textContent = lang === "en" ? "ES" : "EN";
    }

    initClientsMarquee();
    initHeaderShrink();
    initMobileNav();
  }

  injectPartials().catch((err) => {
    console.error("Failed to inject partials:", err);
  });
})();
