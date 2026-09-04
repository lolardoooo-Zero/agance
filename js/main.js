/* ==========================================================================
   AGANCEONLINE — Main Script
   ========================================================================== */
(function(){
  "use strict";

  const LANG_KEY = "aganceonline_lang";
  const PAGES = ["home","about","gallery","location","contact"];
  const html = document.documentElement;

  /* ---------------------------------------------------------------------
     1. LANGUAGE
     --------------------------------------------------------------------- */
  function getSavedLang(){
    return localStorage.getItem(LANG_KEY) || "ar";
  }

  function applyLanguage(lang){
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.ar;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      if(dict[key] !== undefined) el.textContent = dict[key];
    });

    html.lang = lang;
    html.dir = (lang === "ar") ? "rtl" : "ltr";

    document.querySelectorAll(".lang-btn").forEach(btn=>{
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    document.title = lang === "ar"
      ? "AGANCEONLINE — مش مهم المكان، الإسم هو العنوان."
      : "AGANCEONLINE — It's not about the place. The name is the address.";

    localStorage.setItem(LANG_KEY, lang);
  }

  document.querySelectorAll(".lang-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const lang = btn.getAttribute("data-lang");
      if(html.lang === lang) return;
      applyLanguage(lang);
    });
  });

  applyLanguage(getSavedLang());

  /* ---------------------------------------------------------------------
     2. LOADER
     --------------------------------------------------------------------- */
  const loader = document.getElementById("loader");
  const MIN_LOADER_MS = 900;
  const loadStart = Date.now();

  window.addEventListener("load", ()=>{
    const elapsed = Date.now() - loadStart;
    const wait = Math.max(0, MIN_LOADER_MS - elapsed);
    setTimeout(()=>{
      loader.classList.add("hidden");
      document.querySelector(".hero").classList.add("loaded");
    }, wait);
  });

  /* Fallback in case 'load' is delayed by slow external assets */
  setTimeout(()=>{
    loader.classList.add("hidden");
    document.querySelector(".hero").classList.add("loaded");
  }, 3500);

  /* ---------------------------------------------------------------------
     3. NAVBAR SCROLL STATE
     --------------------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  function onScroll(){
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  }
  document.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  /* ---------------------------------------------------------------------
     4. MOBILE MENU
     --------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", ()=>{
    navToggle.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  function closeMobileMenu(){
    navToggle.classList.remove("open");
    navLinks.classList.remove("open");
  }

  /* ---------------------------------------------------------------------
     5. PAGE ROUTING + TRANSITION
     --------------------------------------------------------------------- */
  const overlay = document.getElementById("transition-overlay");
  let transitioning = false;

  function revealPageContent(pageEl){
    const items = pageEl.querySelectorAll(".reveal");
    items.forEach(el=> el.classList.remove("in"));
    // force reflow so the animation restarts each visit
    void pageEl.offsetWidth;
    requestAnimationFrame(()=>{
      items.forEach(el=> el.classList.add("in"));
    });
  }

  function setActivePage(id, { skipAnim=false } = {}){
    if(!PAGES.includes(id)) id = "home";

    document.querySelectorAll(".page").forEach(p=>{
      p.classList.toggle("active", p.id === id);
    });
    document.querySelectorAll(".nav-links a[data-link]").forEach(a=>{
      a.classList.toggle("active", a.getAttribute("href") === "#"+id);
    });

    const activePage = document.getElementById(id);
    if(activePage){
      if(skipAnim){
        activePage.querySelectorAll(".reveal").forEach(el=> el.classList.add("in"));
      } else {
        revealPageContent(activePage);
      }
    }
  }

  function navigateTo(id, { pushHash=true } = {}){
    const current = document.querySelector(".page.active");
    if(current && current.id === id){
      window.scrollTo({ top:0, behavior:"smooth" });
      return;
    }
    if(transitioning) return;
    transitioning = true;

    overlay.classList.add("run");

    setTimeout(()=>{
      window.scrollTo(0,0);
      setActivePage(id);
      if(pushHash) history.replaceState(null, "", "#"+id);
    }, 340); // matches the midpoint of the wipe animation

    setTimeout(()=>{
      overlay.classList.remove("run");
      transitioning = false;
    }, 700);
  }

  document.querySelectorAll("[data-link]").forEach(link=>{
    link.addEventListener("click", (e)=>{
      const href = link.getAttribute("href") || "";
      if(!href.startsWith("#")) return;
      e.preventDefault();
      closeMobileMenu();
      navigateTo(href.slice(1));
    });
  });

  window.addEventListener("popstate", ()=>{
    const id = (location.hash || "#home").slice(1);
    setActivePage(id, { skipAnim:true });
  });

  // Initial page from hash (no transition wipe on first load)
  const initialId = (location.hash || "#home").slice(1);
  setActivePage(initialId, { skipAnim:true });

  /* ---------------------------------------------------------------------
     6. GALLERY RENDER + LIGHTBOX
     --------------------------------------------------------------------- */
  const galleryGrid = document.getElementById("galleryGrid");
  const zoomIcon = '<svg class="zoom" viewBox="0 0 24 24" fill="none" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';

  GALLERY_ITEMS.forEach((item, i)=>{
    const fig = document.createElement("div");
    fig.className = "g-item" + (item.size === "wide" ? " wide" : "") + (item.size === "tall" ? " tall" : "");
    fig.setAttribute("data-index", i);
    if (item.type === "video") {
      fig.innerHTML = `<video src="${item.src}" autoplay muted loop playsinline style="width:100%; height:100%; object-fit:cover; pointer-events:none;"></video>` + zoomIcon;
    } else {
      fig.innerHTML = `<img src="${item.src}" alt="${item.alt || ""}" loading="lazy">` + zoomIcon;
    }
    galleryGrid.appendChild(fig);
  });

  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbVid = document.getElementById("lbVid");
  let lbIndex = 0;

  function openLightbox(i){
    lbIndex = i;
    updateLightbox();
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function updateLightbox(){
    const item = GALLERY_ITEMS[lbIndex];
    if (item.type === "video") {
      lbImg.style.display = "none";
      lbVid.style.display = "block";
      lbVid.src = item.src;
      lbVid.play().catch(e => console.log("Video play error:", e));
    } else {
      lbVid.style.display = "none";
      lbVid.pause();
      lbImg.style.display = "block";
      lbImg.src = item.src;
      lbImg.alt = item.alt || "";
    }
  }
  function closeLightbox(){
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    if (lbVid) lbVid.pause();
  }
  function step(delta){
    lbIndex = (lbIndex + delta + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
    updateLightbox();
  }

  galleryGrid.addEventListener("click", (e)=>{
    const item = e.target.closest(".g-item");
    if(!item) return;
    openLightbox(parseInt(item.getAttribute("data-index"), 10));
  });

  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lbPrev").addEventListener("click", ()=> step(-1));
  document.getElementById("lbNext").addEventListener("click", ()=> step(1));
  lightbox.addEventListener("click", (e)=>{ if(e.target === lightbox) closeLightbox(); });

  document.addEventListener("keydown", (e)=>{
    if(!lightbox.classList.contains("open")) return;
    if(e.key === "Escape") closeLightbox();
    if(e.key === "ArrowRight") step(html.dir === "rtl" ? -1 : 1);
    if(e.key === "ArrowLeft") step(html.dir === "rtl" ? 1 : -1);
  });

  /* ---------------------------------------------------------------------
     7. FOOTER YEAR
     --------------------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();

})();
