"use strict";

// ?덈룄???ъ씠利?泥댄겕
const windowSize = {
  winSize: null,
  breakPoint: 1024,

  setWinSize() {
    this.winSize = window.innerWidth >= this.breakPoint ? "pc" : "mob";
  },

  getWinSize() {
    return this.winSize;
  },
};

// ?ㅽ겕濡?諛⑺뼢 泥댄겕
const scrollManager = {
  _scrollY: 0,
  _scrollH: 0,
  _lastScrollY: 0,

  updateScrollValues() {
    this._scrollY = window.scrollY;
    this._scrollH = document.body.scrollHeight;
  },

  handleScrollDirection() {
    const $wrap = document.querySelector("#wrap");
    if ($wrap) {
      const _conOffsetTop = document.querySelector("#container").offsetTop;
      const _scrollY = window.scrollY;
      const _scrollDown = _scrollY > this._lastScrollY;
      const _scrollUp = _scrollY < this._lastScrollY;

      if (_scrollY > _conOffsetTop + 50 && _scrollDown) {
        $wrap.classList.add("scroll-down");
        $wrap.classList.remove("scroll-up");
      } else if (_scrollY > _conOffsetTop + 50 && _scrollUp) {
        $wrap.classList.add("scroll-up");
        $wrap.classList.remove("scroll-down");
      } else {
        $wrap.classList.remove("scroll-down", "scroll-up");
      }

      this._lastScrollY = _scrollY;
    }
  },

  getscrollY() {
    return this._scrollY;
  },

  getScrollH() {
    return this._scrollH;
  },
};

// common
const common = {
  focusTrap(trap) {
    const focusableElements = trap.querySelectorAll(`a, button, [tabindex="0"], input, textarea, select`);

    if (!focusableElements.length) return;

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    trap.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        if (event.shiftKey && document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement.focus();
          // 紐⑤떖 ?ㅽ뵂 ??泥?珥덉젏 ??갑???쒖뼱(modal-content媛 泥レ큹?먯씠 ?꾨땲硫??ъ슜 ?덊빐????
        } else if (event.key === "Tab" && event.shiftKey && document.activeElement === trap) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
      }
    });
  },
};

/*** * krds_mainMenuPC * ***/
const krds_mainMenuPC = {
  init() {
    const gnbMenu = document.querySelector(".krds-main-menu:not(.sample) .gnb-menu");

    if (!gnbMenu) return;

    // gnb ?띿꽦?ㅼ젙
    gnbMenu.setAttribute("aria-label", "硫붿씤 硫붾돱");

    // dimed ?붿냼瑜??ㅼ젙, 湲곗〈 dimed媛 ?놁쓣 寃쎌슦 ?앹꽦
    this.backdrop = document.querySelector(".gnb-backdrop") || this.createBackdrop();

    // 二?硫붾돱 諛??쒕툕 硫붾돱???몃━嫄곕? ?ㅼ젙?섍퀬, 媛??몃━嫄곗뿉 ?대깽?몃? ?곌껐
    const mainTriggers = gnbMenu.querySelectorAll(".gnb-main-trigger");
    const subTriggers = gnbMenu.querySelectorAll(".gnb-sub-trigger:not(.is-link)");
    mainTriggers.forEach((mainTrigger) => this.setupMainTrigger(mainTrigger));
    this.attachEvents(mainTriggers, subTriggers);
    this.setupKeyboardNavigation(mainTriggers);
  },
  setupMainTrigger(mainTrigger) {
    const toggleWrap = mainTrigger.nextElementSibling;
    if (toggleWrap) {
      const uniqueIdx = `gnb-main-menu-${Math.random().toString(36).substring(2, 9)}`;
      mainTrigger.setAttribute("aria-controls", uniqueIdx);
      mainTrigger.setAttribute("aria-expanded", "false");
      mainTrigger.setAttribute("aria-haspopup", "true");
      toggleWrap.setAttribute("id", uniqueIdx);

      // ?섏쐞 硫붾돱 ?ㅼ젙
      const mainList = toggleWrap.querySelector(".gnb-main-list");
      if (mainList?.getAttribute("data-has-submenu") === "true") {
        const subTriggers = mainList.querySelectorAll(".gnb-sub-trigger");
        subTriggers.forEach((subTrigger) => this.setupSubTrigger(subTrigger));
        if (subTriggers.length > 0 && !subTriggers[0].classList.contains("is-link")) {
          subTriggers[0].classList.add("active");
          subTriggers[0].setAttribute("aria-expanded", "true");
          subTriggers[0].nextElementSibling?.classList.add("active");
        }
      }
    }
  },
  setupSubTrigger(subTrigger) {
    const hasMenu = subTrigger.nextElementSibling;
    if (hasMenu) {
      const uniqueIdx = `gnb-sub-menu-${Math.random().toString(36).substring(2, 9)}`;
      subTrigger.setAttribute("aria-controls", uniqueIdx);
      subTrigger.setAttribute("aria-expanded", "false");
      subTrigger.setAttribute("aria-haspopup", "true");
      hasMenu.setAttribute("id", uniqueIdx);
    }
  },
  toggleMainMenu(mainTrigger) {
    const isActive = mainTrigger.classList.contains("active");
    const isDropDown = mainTrigger.classList.contains("is-dropdown");
    if (!isActive && mainTrigger.nextElementSibling) {
      this.resetMainMenu();
      mainTrigger.setAttribute("aria-expanded", "true");
      mainTrigger.classList.add("active");
      mainTrigger.nextElementSibling.classList.add("is-open");
      if (!isDropDown) {
        this.toggleBackdrop(true);
        this.toggleScrollbar(true);
        this.adjustSubMenuHeight(mainTrigger.nextElementSibling.querySelector(".gnb-main-list"));
      }
    } else {
      this.closeMainMenu();
    }
  },
  toggleSubMenu(subTrigger) {
    const otherSubTriggers = subTrigger.closest("ul").querySelectorAll(".gnb-sub-trigger:not(.is-link)");
    otherSubTriggers.forEach((trigger) => {
      trigger.classList.remove("active");
      trigger.setAttribute("aria-expanded", "false");
      trigger.nextElementSibling?.classList.remove("active");
    });
    subTrigger.classList.add("active");
    subTrigger.setAttribute("aria-expanded", "true");
    subTrigger.nextElementSibling?.classList.add("active");
    this.adjustSubMenuHeight(subTrigger.closest(".gnb-main-list"));
  },
  createBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.classList.add("gnb-backdrop");
    document.body.appendChild(backdrop);
    // backdrop.style.display = "none";
    return backdrop;
  },
  toggleBackdrop(isOpen) {
    this.backdrop?.classList.toggle("active", isOpen);
    document.body.classList.toggle("is-gnb-web", isOpen);
    // this.backdrop.style.display = isOpen ? "block" : "none";
  },
  adjustSubMenuHeight(target) {
    // ?쒕툕 硫붾돱 ?믪씠瑜??쒖꽦 硫붾돱??留욎떠 議곗젙
    const activeSubList = target.querySelector(".gnb-sub-list.active");
    const height = activeSubList?.scrollHeight || 0;
    target.style.minHeight = `${height}px`;
  },
  toggleScrollbar(isEnabled) {
    const isScrollNeeded = document.body.scrollHeight > window.innerHeight;
    document.body.classList.toggle("hasScrollY", isEnabled && isScrollNeeded);
  },
  resetMainMenu() {
    document.querySelectorAll(".krds-main-menu:not(.sample) .gnb-main-trigger:not(.is-link)").forEach((mainTrigger) => {
      mainTrigger.classList.remove("active");
      mainTrigger.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll(".krds-main-menu:not(.sample) .gnb-toggle-wrap").forEach((toggleWrap) => {
      toggleWrap.classList.remove("is-open");
    });
  },
  closeMainMenu() {
    this.resetMainMenu();
    this.toggleBackdrop(false);
    this.toggleScrollbar(false);
  },
  attachEvents(mainTriggers, subTriggers) {
    // krds-main-menu ?몃? ?대┃???リ린
    document.addEventListener("click", ({ target }) => {
      if (!target.closest(".krds-main-menu")) this.closeMainMenu();
    });

    // 諛깅뱶濡??대┃ ??硫붾돱 ?リ린
    // this.backdrop.addEventListener("click", () => this.closeMainMenu());

    // ESC ?ㅻ? ?뚮윭 硫붾돱瑜??リ굅?? TAB ?ㅻ줈 珥덉젏??硫붾돱 ?몃?濡??대룞?덉쓣 ??硫붾돱 ?リ린
    document.addEventListener("keyup", (event) => {
      if (event.code === "Escape" || !event.target.closest(".krds-main-menu")) {
        this.closeMainMenu();
      }
    });

    // 硫붿씤 硫붾돱 ?몃━嫄??ㅼ젙
    mainTriggers.forEach((mainTrigger) => {
      mainTrigger.addEventListener("click", () => this.toggleMainMenu(mainTrigger));
    });

    // ?쒕툕 硫붾돱 ?몃━嫄??ㅼ젙
    subTriggers.forEach((subTrigger) => {
      subTrigger.addEventListener("click", () => this.toggleSubMenu(subTrigger));
    });
  },
  setupKeyboardNavigation(mainTriggers) {
    const focusMenuItem = (element) => {
      if (element) {
        element.focus();
      }
    };
    const findFocusableElement = (element, direction) => {
      const sibling = direction === "next" ? "nextElementSibling" : "previousElementSibling";
      const parent = element.closest("li")?.[sibling];
      return parent ? parent.querySelector("[data-trigger]") : null;
    };
    // Home, End, 諛⑺뼢?ㅻ? ?듯빐 硫붾돱 ??ぉ 媛꾩쓽 ?대룞??泥섎━
    document.addEventListener("keydown", (event) => {
      const target = event.target;
      if (target.getAttribute("data-trigger")) {
        switch (event.key) {
          case "Home":
            event.preventDefault();
            focusMenuItem(mainTriggers[0]);
            break;
          case "End":
            event.preventDefault();
            focusMenuItem(mainTriggers[mainTriggers.length - 1]);
            break;
          case "ArrowRight":
          case "ArrowDown":
            event.preventDefault();
            const nextElement = findFocusableElement(target, "next");
            focusMenuItem(nextElement);
            break;
          case "ArrowLeft":
          case "ArrowUp":
            event.preventDefault();
            const previousElement = findFocusableElement(target, "prev");
            focusMenuItem(previousElement);
            break;
          default:
            break;
        }
      }
    });
  },
};

/*** * krds_mainMenuMobile * ***/
const krds_mainMenuMobile = {
  init() {
    const mobileGnb = document.querySelector(".krds-main-menu-mobile:not(.sample)");

    if (!mobileGnb) return;

    if (mobileGnb.classList.contains("is-open")) {
      this.openMainMenu(mobileGnb);
    } else {
      mobileGnb.style.display = "none";
    }

    // gnb ?몃? ?대┃ 泥섎━
    mobileGnb.addEventListener("click", (event) => {
      if (!event.target.closest(".gnb-wrap")) {
        mobileGnb.querySelector(".gnb-wrap").focus();
      }
    });

    // ?묎렐???ㅼ젙(tab)
    this.setupAriaAttributes(mobileGnb);

    this.attachEvents(mobileGnb);
  },
  setupAriaAttributes(mobileGnb) {
    const tabList = mobileGnb.querySelector(".menu-wrap");
    if (tabList) {
      tabList.querySelector(".menu-wrap ul").setAttribute("role", "tablist");
      tabList.querySelectorAll(".menu-wrap li").forEach((li) => li.setAttribute("role", "none"));

      const tabs = document.querySelectorAll(".menu-wrap .gnb-main-trigger");
      tabs.forEach((item, idx) => {
        item.setAttribute("role", "tab");
        item.setAttribute("aria-selected", "false");
        item.setAttribute("aria-controls", item.getAttribute("href").substring(1));
        item.setAttribute("id", `tab-${idx}`);

        // gnb-main-trigger ?대┃???대떦 ?꾩튂濡??ㅽ겕濡?
        item.addEventListener("click", (event) => {
          event.preventDefault();
          const id = item.getAttribute("aria-controls");
          const top = document.getElementById(id).offsetTop
          const gnbBody = document.querySelector(".gnb-body");
          gnbBody.scrollTo({
            left: 0,
            top: top,
            behavior: "smooth",
          });
        })
      });

      const tabPanels = document.querySelectorAll(".submenu-wrap .gnb-sub-list");
      tabPanels.forEach((item, idx) => {
        item.setAttribute("role", "tabpanel");
        item.setAttribute("aria-labelledby", `tab-${idx}`);
      });
    }
  },
  attachEvents(mobileGnb) {
    const id = mobileGnb.getAttribute("id");
    const openGnb = document.querySelector(`[aria-controls=${id}]`);
    const closeGnb = mobileGnb.querySelector("#close-nav");

    openGnb.addEventListener("click", () => this.openMainMenu(mobileGnb));
    closeGnb.addEventListener("click", () => this.closeMainMenu(mobileGnb));
    this.setupAnchorScroll(mobileGnb);
    this.setupAnchorLinks(mobileGnb);

    // 諛섏쓳??泥섎━
    window.addEventListener("resize", () => {
      const isPC = windowSize.getWinSize() === "pc";
      if (isPC) this.closeMainMenu(mobileGnb);
    });
  },
  openMainMenu(mobileGnb) {
    const navContainer = mobileGnb.querySelector(".gnb-wrap");
    // const id = mobileGnb.getAttribute("id");
    // const openGnb = document.querySelector(`[aria-controls=${id}]`);
    // const header = document.querySelector("#krds-header");

    mobileGnb.style.display = "block";
    navContainer.setAttribute("tabindex", 0);
    // openGnb.setAttribute("aria-expanded", "true");
    // header.style.zIndex = "1000";

    // active 硫붾돱濡??ㅽ겕濡??대룞
    const activeTrigger = document.querySelector(".gnb-main-trigger.active");
    if (activeTrigger) {
      const id = activeTrigger.getAttribute("aria-controls");
      const top = document.getElementById(id).offsetTop;
      const gnbBody = document.querySelector(".gnb-body");
      gnbBody.style.scrollBehavior = "auto";
      gnbBody.scrollTop = top
    } 
    
    setTimeout(() => {
      mobileGnb.classList.add("is-backdrop");
      mobileGnb.classList.add("is-open");
      document.body.classList.add("is-gnb-mobile");
    }, 100);

    // transition 醫낅즺???ㅽ뻾
    mobileGnb.addEventListener("transitionend", function onTransitionEnd() {
      navContainer.focus();
      mobileGnb.removeEventListener("transitionend", onTransitionEnd);

      // inert ?ㅼ젙
      document.querySelector("#krds-header .header-in").setAttribute("inert", "");
      document.getElementById("container")?.setAttribute("inert", "");
      document.getElementById("footer")?.setAttribute("inert", "");
      
      // ?ъ빱???몃옪 ?ㅼ젙
      common.focusTrap(mobileGnb);
    });

  },
  closeMainMenu(mobileGnb) {
    const id = mobileGnb.getAttribute("id");
    const openGnb = document.querySelector(`[aria-controls=${id}]`);
    // const header = document.querySelector("#krds-header");

    mobileGnb.classList.remove("is-backdrop");
    mobileGnb.classList.remove("is-open");
    // openGnb.setAttribute("aria-expanded", "false");
    // header.style.zIndex = "";

    // inert ?ㅼ젙
    document.querySelector("#krds-header .header-in").removeAttribute("inert");
    document.getElementById("container")?.removeAttribute("inert");
    document.getElementById("footer")?.removeAttribute("inert");
    
    // transition 醫낅즺???ㅽ뻾
    mobileGnb.addEventListener("transitionend", function onTransitionEnd() {
      openGnb.focus();
      mobileGnb.removeEventListener("transitionend", onTransitionEnd);
    });
    
    setTimeout(() => {
      mobileGnb.style.display = "none";
      document.body.classList.remove("is-gnb-mobile");
    }, 400);
  },
  setupAnchorScroll(mobileGnb) {
    const gnbBody = mobileGnb.querySelector(".gnb-body");
    const navContainer = mobileGnb.querySelector(".gnb-wrap");
    const navItems = mobileGnb.querySelectorAll(".submenu-wrap .gnb-sub-list");
    const headerTabArea = mobileGnb.querySelector(".gnb-tab-nav");
    const headerTabMenu = headerTabArea?.querySelector(".menu-wrap");

    gnbBody.addEventListener("scroll", () => {
      const scrollTop = gnbBody.scrollTop;
      const scrollHeight = gnbBody.scrollHeight;
      const bodyHeight = gnbBody.clientHeight;

      navItems.forEach((item) => {
        const id = item.getAttribute("id");
        const menuLink = mobileGnb.querySelector(`[href="#${id}"]`);
        const offset = item.offsetTop;
        if (scrollTop >= offset || bodyHeight + scrollTop >= scrollHeight) {
          this.resetAnchorMenu();
          menuLink.classList.add("active");
          menuLink.setAttribute("aria-selected", "true");
          if (headerTabArea) {
            const headerTabMenuUl = headerTabMenu.querySelector("ul");
            gnbBody.addEventListener("scrollend", () => {
              headerTabMenuUl.scrollLeft = menuLink.offsetLeft;
            });
          }
        }
      });

      this.handleTopScroll(headerTabArea, navContainer, gnbBody);
    });
  },
  handleTopScroll(headerTabArea, navContainer, gnbBody) {
    // gnb-mobile-type1(headerTabArea: gnb-tab-nav)
    let lastBodyScrollY = 0;

    if (!headerTabArea) return; // ?붿냼媛 ?놁쓣 寃쎌슦 ?⑥닔 醫낅즺

    gnbBody.addEventListener("scroll", (event) => {
      const bodyScrollY = event.target.scrollTop;

      if (bodyScrollY > 0) {
        headerTabArea.style.height = `${headerTabArea.scrollHeight}px`;
        headerTabArea.style.transition = "ease-out .4s";
        navContainer.classList.add("is-active");
      } else if (bodyScrollY < 50 && bodyScrollY < lastBodyScrollY) {
        headerTabArea.style.height = "";
        headerTabArea.style.transition = "ease-out .4s .2s";
        setTimeout(() => {
          navContainer.classList.remove("is-active");
        }, 600);
      }

      lastBodyScrollY = bodyScrollY;
    });
  },
  setupAnchorLinks(mobileGnb) {
    const menuItems = mobileGnb.querySelectorAll(".menu-wrap .gnb-main-trigger");
    const navItems = mobileGnb.querySelectorAll(".submenu-wrap .gnb-sub-list");

    if (!document.querySelector(".menu-wrap .gnb-main-trigger.active")) {
      menuItems[0].classList.add("active");
      menuItems[0].setAttribute("aria-selected", "true");
    }

    // 3depth
    navItems.forEach((item) => {
      const depth3Items = item.querySelectorAll(".has-depth3");
      if (depth3Items.length > 0) {
        depth3Items.forEach((item) => {
          if (item.classList.contains("active")) {
            item.classList.add("active");
            item.setAttribute("aria-expanded", "true");
            item.nextElementSibling.classList.add("is-open");
          } else {
            item.setAttribute("aria-expanded", "false");
          }
          item.addEventListener("click", (event) => this.handleDepth3Click(event, item));
        });
      }
    });

    // 4depth
    navItems.forEach((item) => {
      const depth4Items = item.querySelectorAll(".has-depth4");
      if (depth4Items.length > 0) {
        depth4Items.forEach((item) => {
          item.addEventListener("click", (event) => this.handleDepth4Click(event, item));
        });
      }
    });
  },
  handleDepth3Click(event) {
    const isActive = event.target.classList.contains("active");

    const resetList = () => {
      document.querySelectorAll(".has-depth3").forEach((depth3) => {
        depth3.classList.remove("active");
        depth3.setAttribute("aria-expanded", "false");
        depth3.nextElementSibling.classList.remove("is-open");
      });
    };

    if (!isActive) {
      // resetList();
      event.target.classList.add("active");
      event.target.setAttribute("aria-expanded", "true");
      event.target.nextElementSibling.classList.add("is-open");
    } else {
      // resetList();
      event.target.classList.remove("active");
      event.target.setAttribute("aria-expanded", "false");
      event.target.nextElementSibling.classList.remove("is-open");
    }
  },
  handleDepth4Click(event) {
    const target = event.target.nextElementSibling;
    const prevButton = target.querySelector(".trigger-prev");
    const closeButton = target.querySelector(".trigger-close");

    target.style.display = "block";
    setTimeout(() => {
      target.classList.add("is-open");
    }, 0);
    prevButton.focus();

    const depth4Close = () => {
      target.classList.remove("is-open");
      event.target.focus();
      setTimeout(() => {
        target.style.display = "";
      }, 400);
    };

    prevButton.addEventListener("click", depth4Close);
    closeButton.addEventListener("click", depth4Close);

    // ?ъ빱???몃옪 ?ㅼ젙
    common.focusTrap(target);
  },
  resetAnchorMenu() {
    document.querySelectorAll(".krds-main-menu-mobile .menu-wrap .gnb-main-trigger").forEach((menu) => {
      menu.classList.remove("active");
      menu.setAttribute("aria-selected", "false");
    });
  },
};

/*** * krds_sideNavigation * ***/
const krds_sideNavigation = {
  init() {
    this.setupSideNavLists();
    this.setupToggleEvents();
    this.setupPopupEvents();
  },
  setupSideNavLists() {
    const sideNavLists = document.querySelectorAll(".krds-side-navigation .lnb-list");
    sideNavLists.forEach((navList) => {
      const navItems = navList.querySelectorAll("li");
      navItems.forEach((navItem) => this.setupNavItem(navItem));
    });
  },
  setupNavItem(navItem) {
    const navButton = navItem.querySelector(".lnb-btn");
    if (!navButton || !navButton.className.includes("lnb-toggle")) return;

    const uniqueIdx = `lnbmenu-${Math.random().toString(36).substring(2, 9)}`;
    const navSubmenu = navButton.nextElementSibling;

    // aria ?ㅼ젙
    navButton.setAttribute("aria-controls", uniqueIdx);
    navButton.setAttribute("aria-expanded", navButton.classList.contains("active"));

    // ?쒕툕硫붾돱 id ?ㅼ젙 諛?popup 泥섎━
    if (navButton.classList.contains("lnb-toggle-popup")) {
      navButton.setAttribute("aria-haspopup", "true");
    }
    if (navSubmenu && navSubmenu.className.includes("lnb-submenu")) {
      const navSubmenuList = navSubmenu.classList.contains("lnb-submenu-lv2") ? navSubmenu : navSubmenu.querySelector(":scope > ul");
      navSubmenuList?.setAttribute("id", uniqueIdx);
    }
  },
  setupToggleEvents() {
    const toggleButtons = document.querySelectorAll(".krds-side-navigation .lnb-list:not(.exception-case) .lnb-toggle");
    toggleButtons.forEach((toggleButton) => {
      toggleButton.addEventListener("click", () => {
        const expand = toggleButton.getAttribute("aria-expanded") !== "true";
        
        //this.toggleMenu(toggleButton, expand); ?대┃ ???대떦 踰꾪듉留??쒖꽦???곹깭濡?蹂寃쎈릺???대떦 ?대깽??二쇱꽍泥섎━.
        //this.closeSiblingMenus(toggleButton);  ?대┃ ???대떦 踰꾪듉留??쒖꽦???곹깭濡?蹂寃쎈릺???대떦 ?대깽??二쇱꽍泥섎━.
        this.setActiveNav(toggleButton, expand);
      });
    });
  },
  setActiveNav(toggleButton, expand){
    const parentListItem = toggleButton.closest("li");
    toggleButton.setAttribute('aria-expanded', expand ? 'true' : 'false');
    parentListItem.classList.toggle('active', expand);
  },
  setupPopupEvents() {
    let lastClickedButton = null;

    const popupToggleButtons = document.querySelectorAll(".lnb-toggle-popup");
    const popupSubmenus = document.querySelectorAll(".lnb-submenu-lv2");

    // ?앹뾽 ?좉? 踰꾪듉
    popupToggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const popupSubmenu = button.nextElementSibling;
        if (popupSubmenu && popupSubmenu.classList.contains("lnb-submenu-lv2")) {
          popupSubmenu.classList.add("active");
          button.setAttribute("aria-expanded", "true");

          popupSubmenu.addEventListener(
            "transitionend",
            () => {
              popupSubmenu.querySelector(".lnb-btn-tit")?.focus();
            },
            { once: true }
          );

          lastClickedButton = button;
        }
      });
    });

    // ?쒕툕 硫붾돱媛 ?ъ빱?ㅻ? ?껋쑝硫?鍮꾪솢?깊솕
    popupSubmenus.forEach((popupSubmenu) => {
      popupSubmenu.addEventListener("focusout", (event) => {
        // ?ъ빱?ㅺ? ?쒕툕硫붾돱 諛뽰쑝濡??섍컮?붿? ?뺤씤
        if (!popupSubmenu.contains(event.relatedTarget)) {
          popupSubmenu.classList.remove("active");

          if (lastClickedButton) {
            lastClickedButton.setAttribute("aria-expanded", "false");
            popupSubmenu.addEventListener(
              "transitionend",
              () => {
                lastClickedButton.focus();
              },
              { once: true }
            );
          }
        }
      });

      // lnb-btn-tit ?대┃ ???쒕툕硫붾돱 ?リ린
      const subMenuTitleButton = popupSubmenu.querySelector(".lnb-btn-tit");
      subMenuTitleButton?.addEventListener("click", () => {
        lastClickedButton?.focus();
      });
    });
  },
  toggleMenu(toggleButton, expand) {
    const parentListItem = toggleButton.closest("li");
    toggleButton.setAttribute("aria-expanded", expand);
    toggleButton.classList.toggle("active", expand);
    parentListItem.classList.toggle("active", expand);
  },
  closeSiblingMenus(toggleButton) {
    const parentListItem = toggleButton.closest("li");
    const siblingButtons = parentListItem.parentNode.querySelectorAll(":scope > li > .lnb-toggle");
    siblingButtons.forEach((siblingButton) => {
      if (siblingButton !== toggleButton) {
        this.toggleMenu(siblingButton, false); 
      }
    });
  },
  setActiveCurrentPage() {
    // ?쒖꽦?붾맂 ?섏씠吏瑜?李얜뒗 ??媛쒕컻 ?섍꼍??留욊쾶 ?섏젙)
    const currentPage = window.location.pathname.split("/").slice(-1)[0].replace(".html", "");
    const lnbLinks = document.querySelectorAll(".krds-side-navigation .lnb-link");
    lnbLinks.forEach((link) => {
      const linkPage = link.getAttribute("href").split("/").pop().replace(".html", "");
      if (linkPage === currentPage) {
        link.closest(".lnb-item").classList.add("active");
        link.closest(".lnb-item").querySelector(".lnb-toggle")?.classList.add("active");
        link.closest(".lnb-item").querySelector(".lnb-toggle")?.setAttribute("aria-expanded", "true");
        link.closest("li").classList.add("active");
        // ?묎렐???꾩옱 ?섏씠吏 ?쒖떆 aria-current
        link.setAttribute("aria-current", "page");
      }
    });
  },
};

/*** * krds_tab * ***/
const krds_tab = {
  layerTabArea: null,
  init() {
    this.layerTabArea = document.querySelectorAll(".krds-tab-area.layer");

    if (!this.layerTabArea.length) return;

    this.setupTabs();
  },
  setupTabs() {
    this.layerTabArea.forEach((tabArea) => {
      const layerTabs = tabArea.querySelectorAll(".tab > ul > li");

      // ???ㅼ젙
      layerTabs.forEach((tab) => {
        // ?대? ?대깽?멸? ?곌껐????쓣 嫄대꼫?
        if (!tab.dataset.listenerAttached) {
          // ?곌껐?????⑤꼸 李얘린
          const control = tab.getAttribute("aria-controls");
          const selectedTabPanel = document.getElementById(control);

          // aria ?ㅼ젙
          tab.setAttribute("aria-selected", "false");
          tab.setAttribute("role", "tab");
          selectedTabPanel.setAttribute("role", "tabpanel");

          // 珥덇린 active ?ㅼ젙
          if (tab.classList.contains("active")) {
            if (!tab.querySelector("button .sr-only")) {
              tab.setAttribute("aria-selected", "true");
              tab.querySelector("button").append(this.createAccText()); // 珥덉젏??踰꾪듉?대씪 aria-selected ?泥??띿뒪???꾩슂
            }
          }

          // ?대┃ ?대깽??
          tab.addEventListener("click", () => {
            const closestTabs = tab.closest(".krds-tab-area.layer > .tab").querySelectorAll("li");
            const closestTabPanels = tab.closest(".krds-tab-area.layer").querySelectorAll(":scope > .tab-conts-wrap > .tab-conts");

            this.resetTabs(closestTabs, closestTabPanels);

            tab.classList.add("active");
            tab.querySelector("button").append(this.createAccText());
            tab.setAttribute("aria-selected", "true");
            selectedTabPanel.classList.add("active");
          });

          // ?ㅻ낫???대깽??
          this.setupKeyboardNavigation(tab);

          // ?대깽?멸? 異붽?????쓣 ?쒖떆
          tab.dataset.listenerAttached = "true";
        }
      });
    });
  },
  createAccText() {
    const tabAccTag = document.createElement("i");
    tabAccTag.classList.add("sr-only");
    tabAccTag.textContent = "?좏깮??;
    return tabAccTag;
  },
  resetTabs(closestTabs, closestTabPanels) {
    closestTabs.forEach((tab) => {
      tab.classList.remove("active");
      tab.setAttribute("aria-selected", "false");
      // ?泥??띿뒪????젣
      const srOnly = tab.querySelector(".sr-only");
      if (srOnly) tab.querySelector("button").removeChild(srOnly);
    });
    closestTabPanels.forEach((panel) => {
      panel.classList.remove("active");
    });
  },
  setupKeyboardNavigation(tab) {
    tab.addEventListener("keydown", function (event) {
      let newTab;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        newTab = tab.nextElementSibling?.querySelector("button");
      } else if (event.key === "ArrowLeft") {
        newTab = tab.previousElementSibling?.querySelector("button");
      }
      newTab?.focus();
    });
  },
};

/*** * krds_accordion * ***/
const krds_accordion = {
  accordionButtons: null,
  accordionHandlers: new Map(),
  init() {
    this.accordionButtons = document.querySelectorAll(".btn-accordion");

    if (!this.accordionButtons.length) return;

    this.setupAccordions();
  },
  accordionToggle(button, accordionItems, accordionType, currentItem) {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    // singleOpen ??낆씪 寃쎌슦, ?ㅻⅨ ??ぉ ?リ린
    if (accordionType !== "multiOpen" && !currentItem.classList.contains("active")) {
      accordionItems.forEach((otherItem) => {
        const otherButton = otherItem.querySelector(".btn-accordion");
        otherButton.setAttribute("aria-expanded", "false");
        otherButton.classList.remove("active");
        otherItem.classList.remove("active");
      });
    }
    // ?꾩옱 ??ぉ ?곹깭 ?좉?
    button.setAttribute("aria-expanded", !isExpanded);
    button.classList.toggle("active", !isExpanded);
    currentItem.classList.toggle("active", !isExpanded);
  },
  setupAccordions() {
    this.accordionButtons.forEach((button, idx) => {
      const accordionContainer = button.closest(".krds-accordion");
      const accordionItems = accordionContainer.querySelectorAll(".accordion-item");
      const currentItem = button.closest(".accordion-item");
      const accordionContent = currentItem.querySelector(".accordion-collapse");
      const accordionType = accordionContainer.dataset.type || "singleOpen";
      const isOpen = accordionContainer.classList.contains("is-open");

      // ?묎렐???띿꽦 珥덇린媛??ㅼ젙
      this.setupAriaAttributes(button, accordionContent, idx);

      // 珥덇린 ?ㅽ뵂 ?곹깭 ?ㅼ젙
      if (isOpen || currentItem.classList.contains("active")) {
        button.setAttribute("aria-expanded", "true");
        button.classList.add("active");
        currentItem.classList.add("active");
      }

      // ?몃뱾??怨좎젙 諛????
      let toggleHandler = this.accordionHandlers.get(button);
      if (!toggleHandler) {
        toggleHandler = this.accordionToggle.bind(this, button, accordionItems, accordionType, currentItem);
        this.accordionHandlers.set(button, toggleHandler);
      }

      // 湲곗〈 ?대깽??由ъ뒪???쒓굅 諛??덈줈 ?깅줉
      button.removeEventListener("click", toggleHandler);
      button.addEventListener("click", toggleHandler);
    });
  },
  setupAriaAttributes(button, accordionContent, idx) {
    const uniqueIdx = `${idx}${Math.random().toString(36).substring(2, 9)}`;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("id", `accordionHeader-id-${uniqueIdx}`);
    button.setAttribute("aria-controls", `accordionCollapse-id-${uniqueIdx}`);
    accordionContent.setAttribute("role", "region");
    accordionContent.setAttribute("id", `accordionCollapse-id-${uniqueIdx}`);
    accordionContent.setAttribute("aria-labelledby", `accordionHeader-id-${uniqueIdx}`);
  },
};

/*** * krds_modal * ***/
const krds_modal = {
  modalOpenTriggers: null,
  modalCloseTriggers: null,
  outsideClickHandlers: {},
  init() {
    this.modalOpenTriggers = document.querySelectorAll(".open-modal");
    this.modalCloseTriggers = document.querySelectorAll(".close-modal");

    if (!this.modalOpenTriggers.length || !this.modalCloseTriggers.length) return;

    this.setupTriggers();
  },
  setupTriggers() {
    // 紐⑤떖 ?닿린 ?대깽???ㅼ젙
    this.modalOpenTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        const modalId = trigger.getAttribute("data-target");

        if (modalId) {
          // aria ?ㅼ젙
          trigger.setAttribute("data-modal-id", modalId);
          trigger.classList.add("modal-opened");
          trigger.setAttribute("tabindex", "-1");

          this.openModal(modalId);
        }
      });
    });
    // 紐⑤떖 ?リ린 ?대깽???ㅼ젙
    this.modalCloseTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        const modalId = trigger.closest(".krds-modal").getAttribute("id");

        if (modalId) {
          this.closeModal(modalId);
        }
      });
    });
  },
  openModal(id) {
    const modalElement = document.getElementById(id);
    const dialogElement = modalElement.querySelector(".modal-content");
    const modalBack = modalElement.querySelector(".modal-back");
    // const modalTitle = modalElement.querySelector(".modal-title");
    const modalConts = modalElement.querySelector(".modal-conts");

    document.querySelector("body").classList.add("scroll-no");
    dialogElement.removeAttribute("tabindex");
    modalElement.setAttribute("role", "dialog");
    modalElement.classList.add("shown");
    modalBack.classList.add("in");
    // modalTitle.setAttribute("tabindex", "0");

    // modal-conts ?ㅽ겕濡??쇰븣 tabindex 泥섎━
    if (modalConts.scrollHeight > modalConts.clientHeight) {
      modalConts.setAttribute("tabindex", "0");
    } else {
      modalConts.removeAttribute("tabindex");
    }

    // css transition ?쒕젅??
    setTimeout(() => {
      modalElement.classList.add("in");
    }, 150);
    
    //?대┛ ?앹뾽李??ъ빱??
    const focusables = modalElement.querySelectorAll(`a, button, [tabindex="0"], input, textarea, select`);
    setTimeout(() => {
      // modalTitle.focus();
      focusables[0].focus();
    }, 350);

    // ESC 紐⑤떖 ?リ린
    dialogElement.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" || event.key === "Esc") {
          this.closeModal(dialogElement.closest(".krds-modal").id);
        }
      },
      { once: true }
    );

    // 紐⑤떖 ?몃? ?대┃ 泥섎━ ?몃뱾???뺤쓽 諛????
    if (!this.outsideClickHandlers[id]) {
      this.outsideClickHandlers[id] = (event) => {
        if (!event.target.closest(".modal-content")) {
          // modalTitle.focus();
          focusables[0].focus();

          // dialogElement.focus();
          // this.closeModal(id);
        }
      };
    }
    // ?대깽??由ъ뒪???쒓굅 ???ㅼ떆 ?깅줉
    modalElement.removeEventListener("click", this.outsideClickHandlers[id]);
    modalElement.addEventListener("click", this.outsideClickHandlers[id]);

    // ?ъ빱???몃옪 ?ㅼ젙
    common.focusTrap(dialogElement);

    // 2媛??댁긽??紐⑤떖???대젮 ?덈뒗 寃쎌슦 z-index ?낅뜲?댄듃
    this.updateZIndex(modalElement);

    // inert ?ㅼ젙
    document.getElementById("wrap")?.setAttribute("inert", "");
  },
  closeModal(id) {
    const modalElement = document.getElementById(id);
    const openModals = document.querySelectorAll(".modal.in:not(.sample)");
    const modalBack = modalElement.querySelector(".modal-back");

    modalElement.classList.remove("in");
    modalBack.classList.remove("in");

    // css transition ?쒕젅??
    setTimeout(() => {
      modalElement.classList.remove("shown");
    }, 350);

    // 留덉?留?紐⑤떖???ロ옄 ???섏씠吏 ?ㅽ겕濡?蹂듭썝
    if (openModals.length < 2) {
      document.querySelector("body").classList.remove("scroll-no");
    }
    
    // inert ?ㅼ젙
    document.getElementById("wrap")?.removeAttribute("inert");

    // 紐⑤떖???댁뿀??踰꾪듉?쇰줈 ?ъ빱??蹂듦?
    this.returnFocusToTrigger(id);
  },
  updateZIndex(modalElement) {
    const openModals = document.querySelectorAll(".modal.in:not(.sample)");
    const openModalsLengtn = openModals.length + 1;
    const newZIndex = 1010 + openModalsLengtn;
    if (openModalsLengtn > 1) {
      modalElement.style.zIndex = newZIndex;
      modalElement.querySelector(".modal-back").classList.remove("in");
    }
  },
  returnFocusToTrigger(id) {
    const triggerButton = document.querySelector(`.modal-opened[data-modal-id="${id}"]`);
    if (triggerButton) {
      triggerButton.focus();
      triggerButton.setAttribute("tabindex", "0");
      triggerButton.classList.remove("modal-opened");
      triggerButton.removeAttribute("data-modal-id");
    }
  },
};

/*** * krds_contextualHelp * ***/
const krds_contextualHelp = {
  tooltipButtons: null,
  init() {
    this.tooltipButtons = document.querySelectorAll(".krds-contextual-help .tooltip-btn");

    if (!this.tooltipButtons.length) return;

    this.setupTooltips();
    this.setupFocusOutEvent();
  },
  setupTooltips() {
    this.tooltipButtons.forEach((button) => {
      const tooltipContainer = button.closest(".krds-contextual-help");
      const tooltipPopover = tooltipContainer.querySelector(".tooltip-popover");
      const closeButton = tooltipPopover.querySelector(".tooltip-close");

      button.setAttribute("aria-expanded", "false");
      tooltipPopover.setAttribute("role", "tooltip");

      // tooltipWrap???ъ??섏씠 ?놁쓣??湲곕낯媛??ㅼ젙
      if (tooltipContainer && tooltipContainer.classList.length === 1) {
        tooltipContainer.classList.add("top", "left");
      }

      button.addEventListener("click", () => {
        this.toggleTooltip(button, tooltipPopover, tooltipContainer);
      });
      closeButton.addEventListener("click", () => {
        this.closeAllTooltips();
      });

      window.addEventListener("resize", () => {
        this.adjustTooltipPosition(tooltipContainer, tooltipPopover);
      });

      // ESC ?リ린
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" || event.key === "Esc") {
          this.closeAllTooltips();
        }
      });
    });
  },
  toggleTooltip(button, tooltipPopover, tooltipContainer) {
    const isVisible = tooltipPopover.style.display === "block";

    this.closeAllTooltips();

    if (!isVisible) {
      tooltipPopover.style.display = "block";
      const focusables = tooltipPopover.querySelector(`a, button, [tabindex="0"], input, textarea, select`);
      focusables?.focus();
      button.setAttribute("aria-expanded", "true");

      this.adjustTooltipPosition(tooltipContainer, tooltipPopover);
    }
  },
  closeAllTooltips() {
    const otherPopovers = document.querySelectorAll(".krds-contextual-help .tooltip-popover");
    otherPopovers.forEach((popover) => {
      popover.style.display = "none";
    });
    this.tooltipButtons.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
  },
  adjustTooltipPosition(tooltipContainer, tooltipPopover) {
    // const isMobile = windowSize.getWinSize() === "mob";
    const isMobile = window.innerWidth <= 768;
    const tooltipAction = tooltipContainer.querySelector(".tooltip-action");

    if (isMobile) {
      const rootStyles = getComputedStyle(document.querySelector(":root"));
      const contentsPaddingX = rootStyles.getPropertyValue("--krds-contents-padding-x").trim().split("px")[0];
      const tooltipActionRect = tooltipAction.getBoundingClientRect();
      const offsetLeft = tooltipActionRect.left - contentsPaddingX;
      const width = document.body.clientWidth - (contentsPaddingX * 2);
      tooltipPopover.style.left = `-${offsetLeft}px`;
      tooltipPopover.style.width = `${width}px`;
    } else {
      tooltipPopover.style.left = "";
      tooltipPopover.style.right = "";
      tooltipPopover.style.width = "360px";
    }
  },
  setupFocusOutEvent() {
    document.addEventListener("click", (event) => {
      const clickedInsideTooltip = event.target.closest(".tooltip-action");
      if (!clickedInsideTooltip ) {
        this.closeAllTooltips();
      } else {
        const FocusPopover = clickedInsideTooltip.querySelector('.tooltip-close');
        FocusPopover.addEventListener('focusout', ()=>{
          this.closeAllTooltips();
          clickedInsideTooltip.querySelector(".tooltip-btn")?.focus();
        });
      }
    });
  },
};

/*** * krds_tooltip * ***/
const krds_tooltip = {
  tooltip: null,
  isMobile: null,
  init() {
    this.tooltip = document.querySelectorAll(".krds-tooltip");
    this.isMobile = windowSize.getWinSize() === "mob";

    if (!this.tooltip.length) return;

    this.setupTooltips();
    this.setupGlobalEvents();
  },
  setupTooltips() {
    this.tooltip.forEach((item, index) => {
      //  tooltipText
      const tooltipText = item.getAttribute("data-tooltip");
      const disabled = item.hasAttribute("disabled");

      if (!tooltipText || disabled) return;

      // ID 遺??
      const uniqueIdx = `tooltip-popover-${index}${Math.random().toString(36).substring(2, 9)}`;
      item.setAttribute("aria-labelledby", uniqueIdx);

      // TooltipPopover ?앹꽦
      const tooltipBtnText = item.innerText;
      const tooltipPopover = this.createTooltipPopover(uniqueIdx, tooltipBtnText, tooltipText);
      item.parentNode.insertBefore(tooltipPopover, item.nextSibling);

      // Show/Hide ?⑥닔 ?뺤쓽
      const showTooltip = () => this.showTooltip(item, tooltipPopover);

      // ?대깽???깅줉
      this.registerEvents(item, showTooltip);

      // ESC ?リ린
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" || event.key === "Esc") {
          this.closeAllTooltips();
        }
      });
    });
  },
  createTooltipPopover(uniqueIdx, tooltipBtnText, tooltipText) {
    const tooltipPopover = document.createElement("div");
    tooltipPopover.classList.add("krds-tooltip-popover");
    tooltipPopover.setAttribute("id", uniqueIdx);
    tooltipPopover.setAttribute("aria-hidden", "true");
    tooltipPopover.innerHTML = "";
    tooltipPopover.innerHTML = `
      <span class="sr-only">${tooltipBtnText}</span>
      ${tooltipText}
    `;

    return tooltipPopover;
  },
  registerEvents(item, showTooltip) {
    item.addEventListener("mouseover", showTooltip);
    item.addEventListener("mouseout", this.closeAllTooltips);
    item.addEventListener("focus", showTooltip);
    item.addEventListener("focusout", this.closeAllTooltips);
  },
  showTooltip(item, tooltipPopover) {
    // tooltip-box
    if (item.classList.contains("tooltip-box")) {
      tooltipPopover.classList.add("tooltip-box");
    }
    // tooltip-vertical
    if (item.classList.contains("tooltip-vertical")) {
      tooltipPopover.classList.add("tooltip-vertical");
    }

    tooltipPopover.classList.add("active");

    const { top, left } = this.calculateTooltipPosition(item, tooltipPopover);
    const mobileSmall = window.innerWidth <= 420;
    tooltipPopover.style.top = `${top}px`;
    tooltipPopover.style.left = mobileSmall ? "50%" : `${left}px`;
  },
  closeAllTooltips() {
    const otherPopovers = document.querySelectorAll(".krds-tooltip-popover");
    otherPopovers.forEach((popover) => {
      if (!popover.classList.contains("active")) return;
      popover.style = "";
      popover.className = "krds-tooltip-popover";
    });
  },
  calculateTooltipPosition(item, tooltipPopover) {
    // ?댄똻怨?湲곗? ?붿냼 媛꾧꺽
    const tooltipGap = 12;
    const { clientHeight: tooltipHeight, clientWidth: tooltipWidth } = tooltipPopover;
    const { top: itemTop, left: itemLeft, right: itemRight, height: itemHeight, width: itemWidth } = item.getBoundingClientRect();
    const halfWindowWidth = window.innerWidth / 2;
    const halfWindowHeight = window.innerHeight / 2;

    let tooltipTop;
    let tooltipLeft;

    const isVertical = this.isMobile || item.classList.contains("tooltip-box") || item.classList.contains("tooltip-vertical");

    if (isVertical) {
      if (itemTop + itemHeight > halfWindowHeight) {
        tooltipTop = itemTop - tooltipHeight - tooltipGap; // ?꾩そ
        tooltipPopover.classList.add("top");
      } else {
        tooltipTop = itemTop + itemHeight + tooltipGap; // ?꾨옒履?
        tooltipPopover.classList.add("bottom");
      }
      // 醫뚯슦 ?꾩튂
      if (itemLeft + itemWidth > halfWindowWidth) {
        tooltipLeft = itemRight - tooltipWidth; // ?ㅻⅨ履??뺣젹
        tooltipPopover.classList.add("right");
        // ?붾㈃ ?ㅻⅨ履??ъ쑀 怨듦컙??異⑸텇????媛?대뜲 ?뺣젹
        if (window.innerWidth - (itemLeft + itemWidth) > tooltipWidth / 2) {
          tooltipLeft = itemLeft + (itemWidth - tooltipWidth) / 2;
          tooltipPopover.classList.remove("right");
        }
      } else {
        // ?붾㈃ ?쇱そ ?ъ쑀 怨듦컙??異⑸텇????媛?대뜲 ?뺣젹
        tooltipLeft = itemLeft + (itemWidth - tooltipWidth) / 2;
        // ?쇱そ 怨듦컙 遺議???蹂댁젙
        if (tooltipLeft < 0) {
          tooltipLeft = itemLeft;
          tooltipPopover.classList.add("left");
        } else {
          tooltipPopover.classList.remove("left");
        }
      }
    } else {
      // 媛濡쒗삎 ?댄똻
      tooltipTop = itemTop + (itemHeight - tooltipHeight) / 2;
      if (itemLeft + itemWidth > halfWindowWidth) {
        tooltipLeft = itemLeft - tooltipWidth - tooltipGap; // ?쇱そ
        tooltipPopover.classList.add("right");
      } else {
        tooltipLeft = itemRight + tooltipGap; // ?ㅻⅨ履?
        tooltipPopover.classList.remove("right");
      }
    }
    return { top: tooltipTop, left: tooltipLeft };
  },
  setupGlobalEvents() {
    window.addEventListener("scroll", () => {
      this.closeAllTooltips();
    });
    window.addEventListener("resize", () => {
      this.isMobile = windowSize.getWinSize() === "mob";
      this.closeAllTooltips();
    });
  },
};

/*** * krds_calendar * ***/ // *btn-set-date: aria-pressed > aria-selected 蹂寃??댁빞???곸쐞 ?띿꽦??媛숈씠)
const krds_calendar = {
  datePickerArea: null,
  activeDateSelector: null,
  init() {
    this.datePickerArea = document.querySelectorAll(".krds-calendar-area");

    if (!this.datePickerArea.length) return;

    this.setupDatePicker();
    this.setupGlobalListeners();
    this.setupOpenCloseEvents();
    this.setupDateComboBox("init");
    this.toggleDateSelector();
    this.actionDatePicker();

    // ui ?숈옉 ?뺤씤???뚯뒪??肄붾뱶
    this.example();
  },
  setupDatePicker() {
    this.datePickerArea.forEach((datePicker) => {
      datePicker.querySelector(".calendar-wrap").setAttribute("tabindex", "0");

      // ?묎렐??珥덇린媛??ㅼ젙
      datePicker.querySelectorAll(".calendar-tbl td").forEach((cell) => {
        const dateButton = cell.querySelector(".btn-set-date");
        if (!dateButton) return;
        if (cell.classList.contains("period")) {
          dateButton.setAttribute("aria-pressed", "true");
        }
        if (cell.classList.contains("day-event")) {
          dateButton.setAttribute("aria-label", `${dateButton.innerText} ?쇱젙?덉쓬`);
        }
        if (cell.classList.contains("today")) {
          dateButton.setAttribute("aria-label", `${dateButton.innerText} ?ㅻ뒛`);
        }
      });
    });
  },
  setupGlobalListeners() {
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".calendar-conts")) {
        this.closeAllDatePickers();
      }
    });
  },
  setupOpenCloseEvents() {
    const datePickerButtons = document.querySelectorAll(".form-btn-datepicker");
    datePickerButtons.forEach((button) => {
      button.addEventListener("click", () => this.openDatePicker(button));
    });

    // ???대룞 ?リ린
    this.datePickerArea.forEach((datePicker) => {
      // 留덉?留?踰꾪듉??blur????datepicker ?リ린(?ъ빱???몃옪???ъ슜?섏? ?딆쓣???곸슜)
      // const lastActionButton = datePicker.querySelector(".calendar-btn-wrap .krds-btn:last-child");
      // if (lastActionButton) {
      //   lastActionButton.addEventListener("blur", () => this.closeAllDatePickers());
      // }

      // calendar-select??留덉?留?踰꾪듉??blur?????좏깮湲??リ린
      datePicker.querySelectorAll(".calendar-select").forEach((select) => {
        const lastSelectButton = select.querySelector(".sel > li:last-child > button");
        if (lastSelectButton) {
          lastSelectButton.addEventListener("blur", () => {
            this.resetDateSelector();
          });
        }
      });
    });
  },
  openDatePicker(button) {
    // ?대젮?덈뜕 ?щ젰 紐⑤몢 ?リ린
    this.closeAllDatePickers();

    const currentDatePicker = button.closest(".calendar-conts").querySelector(".krds-calendar-area");
    currentDatePicker.classList.add("active");

    // ?묎렐??
    button.setAttribute("aria-expanded", "true");

    // ?ъ빱???몃옪 ?ㅼ젙
    common.focusTrap(currentDatePicker);

    // ?ъ빱???대룞
    setTimeout(() => {
      currentDatePicker.querySelector(".calendar-wrap").focus();
    }, 50);
  },
  resetDateSelector() {
    this.datePickerArea.forEach((datePicker) => {
      const selectMenus = datePicker.querySelectorAll(".calendar-select");
      selectMenus.forEach((select) => select.classList.remove("active"));
      this.setupDateComboBox("reset");
      this.activeDateSelector = null;
    });
  },
  closeAllDatePickers() {
    this.datePickerArea.forEach((datePicker) => {
      if (datePicker.classList.contains("active")) {
        const target = datePicker.closest(".calendar-conts").querySelector(".form-btn-datepicker");
        target.focus();
      }
      datePicker.classList.remove("active");
      this.resetDateSelector();
    });

    // ?묎렐??
    const datePickerButtons = document.querySelectorAll(".form-btn-datepicker");
    datePickerButtons.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
  },
  setupDateComboBox(option, target) {
    const comboBoxs = document.querySelectorAll(".calendar-drop-down > button");
    if (option === "init") {
      comboBoxs.forEach((comboBox, idx) => {
        const listBox = comboBox.nextElementSibling.querySelector(".sel");
        const listOptions = listBox.querySelectorAll("button");
        const uniqueIdx = `${idx}${Math.random().toString(36).substring(2, 9)}`;

        comboBox.setAttribute("role", "combobox");
        comboBox.setAttribute("aria-haspopup", "listbox");
        comboBox.setAttribute("aria-expanded", "false");
        comboBox.setAttribute("aria-controls", `combo-list-${uniqueIdx}`);

        listBox.setAttribute("role", "listbox");
        listBox.setAttribute("id", `combo-list-${uniqueIdx}`);
        listBox.querySelectorAll("li").forEach((li) => li.setAttribute("role", "none"));

        listOptions.forEach((listOption) => {
          listOption.setAttribute("role", "option");
          listOption.setAttribute("aria-selected", "false");
          if (listOption.classList.contains("active")) {
            listOption.setAttribute("aria-selected", "true");
            comboBox.innerHTML = listOption.innerHTML;
          }
        });
      });
    }
    if (option === "reset") {
      comboBoxs.forEach((comboBox) => {
        comboBox.setAttribute("aria-expanded", "false");
      });
      if (target) {
        target.setAttribute("aria-expanded", "true");
      }
    }
    if (option === "change") {
      comboBoxs.forEach((comboBox) => {
        const listBox = comboBox.nextElementSibling.querySelector(".sel");
        const listOptions = listBox.querySelectorAll("button");

        comboBox.setAttribute("aria-expanded", "false");

        listOptions.forEach((listOption) => {
          listOption.classList.remove("active");
          listOption.setAttribute("aria-selected", "false");
        });
      });
      if (target) {
        target.setAttribute("aria-selected", "true");
        target.classList.add("active");
        target.closest(".calendar-drop-down").querySelector("button").innerHTML = target.innerHTML;
      }

      // ui ?숈옉 ?뺤씤???뚯뒪??肄붾뱶
      this.example();
    }
  },
  toggleDateSelector() {
    this.datePickerArea.forEach((datePicker) => {
      const selectToggleButtons = datePicker.querySelectorAll(".calendar-drop-down .btn-cal-switch");
      const selectOptions = datePicker.querySelectorAll(".calendar-select .sel button");

      // 怨듯넻 ?대깽??泥섎━
      const handleBtnClick = (event, selectMenu) => {
        const layer = selectMenu;

        // ?대? ?쒖꽦?붾맂 ?덉씠???リ린
        if (this.activeDateSelector === layer) {
          layer.classList.remove("active");
          this.setupDateComboBox("reset");
          this.activeDateSelector = null;
          return;
        }

        // ?꾩옱 ?대젮 ?덈뒗 ?덉씠?닿? ?덉쑝硫??レ쓬
        if (this.activeDateSelector) {
          this.activeDateSelector.classList.remove("active");
          this.setupDateComboBox("reset");
        }

        // ?대┃??踰꾪듉???대떦?섎뒗 ?덉씠???닿린
        layer.classList.add("active");
        this.setupDateComboBox("reset", event.target);
        this.activeDateSelector = layer;
      };

      // ??됲꽣 ?ㅼ젙
      selectToggleButtons.forEach((toggle) => {
        toggle.addEventListener("click", (event) => {
          const selectMenu = event.target.closest(".calendar-drop-down").querySelector(".calendar-select");
          handleBtnClick(event, selectMenu);
        });
      });

      // ?꾨룄, ???좏깮
      selectOptions.forEach((option) => {
        option.addEventListener("click", (event) => {
          this.resetDateSelector();
          this.setupDateComboBox("change", event.target);

          // ?ъ빱???대룞
          setTimeout(() => {
            option.closest(".calendar-drop-down").querySelector(".btn-cal-switch")?.focus();
          }, 50);
        });
      });

      // esc ?リ린
      datePicker.addEventListener("keydown", (event) => {
        if (event.code === "Escape") {
          this.resetDateSelector();
        }
      });
    });
  },
  actionDatePicker() {
    this.datePickerArea.forEach((datePicker) => {
      const actionButtons = datePicker.querySelectorAll(".calendar-btn-wrap button:not(#get-today)");
      actionButtons.forEach((button) => {
        button.addEventListener("click", () => {
          this.closeAllDatePickers();
        });
      });
    });
  },
  // ui ?숈옉 ?뺤씤???뚯뒪??肄붾뱶
  example() {
    this.datePickerArea.forEach((datePicker) => {
      const year = datePicker.querySelector(".calendar-switch-wrap .year").innerText.slice(0, -1);
      const month = datePicker.querySelector(".calendar-switch-wrap .month").innerText.slice(0, -1);
      const caption = datePicker.querySelector(".calendar-tbl caption");
      const tblCells = datePicker.querySelectorAll(".calendar-tbl td");
      const tblCellBtns = datePicker.querySelectorAll(".calendar-tbl td .btn-set-date");
      const actionBtns = datePicker.querySelectorAll(".calendar-btn-wrap button");
      let clickCount = 0;
      let startTd = null;

      // 罹≪뀡 ?ㅼ젙
      caption.innerHTML = `${year}??${month}??;

      // ?뚯뒪?몄슜 (?ㅼ젣 援ы쁽?먯꽌???좎쭨 諛곗뿴??諛쏆븘 泥섎━??
      tblCells.forEach((cell) => {
        const day = cell.querySelector(".btn-set-date").innerText.padStart(2, "0");
        let [numberYear, numberMonth] = [parseFloat(year), parseFloat(month)];
        if (cell.classList.contains("old")) {
          if (numberMonth === 1) {
            numberYear -= 1;
            numberMonth = 12;
          } else {
            numberMonth -= 1;
          }
        } else if (cell.classList.contains("new")) {
          if (numberMonth === 12) {
            numberYear += 1;
            numberMonth = 1;
          } else {
            numberMonth += 1;
          }
        }
        cell.setAttribute("data-date", `${numberYear}.${String(numberMonth).padStart(2, "0")}.${day}`);
      });

      // action
      const accReset = (action, btn, type) => {
        // ?명뭼 ?⑥씪
        const targetInput = btn.closest(".calendar-conts").querySelector("input.datepicker.cal");
        // ?명뭼 遺꾪븷
        const targetInputStart = btn.closest(".calendar-conts").querySelector(".input-group.range.set li:first-child input.datepicker");
        const targetInputEnd = btn.closest(".calendar-conts").querySelector(".input-group.range.set li:last-child input.datepicker");

        action.addEventListener("click", () => {
          if (targetInput) {
            targetInput.setAttribute("type", "text");
            const target = action.innerText;
            if (target === "?ㅻ뒛") {
              accSet();
            }
            if (target === "?뺤씤") {
              if (type === "single") {
                const value = action.closest(".krds-calendar-area").querySelector("td.period.start.end").getAttribute("data-date");
                targetInput.value = value;
              } else {
                const value1 = action.closest(".krds-calendar-area").querySelector("td.period.start")?.getAttribute("data-date");
                const value2 = action.closest(".krds-calendar-area").querySelector("td.period.end")?.getAttribute("data-date") || "";
                targetInput.value = `${value1} ~ ${value2}`;
              }
            }
          } else {
            targetInputStart.setAttribute("type", "text");
            targetInputEnd.setAttribute("type", "text");
            const target = action.innerText;
            if (target === "?ㅻ뒛") {
              accSet();
            }
            if (target === "?뺤씤") {
              const value1 = action.closest(".krds-calendar-area").querySelector("td.period.start")?.getAttribute("data-date");
              const value2 = action.closest(".krds-calendar-area").querySelector("td.period.end")?.getAttribute("data-date") || "";
              targetInputStart.value = value1;
              targetInputEnd.value = value2;
            }
          }
        });
        // 怨듯넻 ?묎렐??
        const accSet = () => {
          const prevItems = action.closest(".krds-calendar-area").querySelectorAll(".period");
          prevItems.forEach((prev) => {
            prev.classList.remove("period", "start", "end");
            prev.querySelector(".btn-set-date").removeAttribute("aria-pressed");
          });
          action.closest(".krds-calendar-area").querySelector("td.today").classList.add("period", "start", "end");
          action.closest(".krds-calendar-area").querySelector("td.today .btn-set-date").setAttribute("aria-pressed", "true");
        };
      };

      // btn-set-date
      tblCellBtns.forEach((btn) => {
        // disabled ?ㅼ젙
        if (btn.closest("td.new, td.old")) {
          btn.setAttribute("disabled", "true");
        }

        // var
        const isSingle = btn.closest(".calendar-wrap").classList.contains("single");

        if (isSingle) {
          btn.addEventListener("click", () => {
            tblCellBtns.forEach((otherBtn) => {
              otherBtn.closest("td").classList.remove("period", "start", "end");
              otherBtn.removeAttribute("aria-pressed");
            });
            btn.closest("td").classList.add("period", "start", "end");
            btn.setAttribute("aria-pressed", "true");  
          });
          // action
          actionBtns.forEach((action) => {
            accReset(action, btn, "single");
          });
        } else {         
          btn.addEventListener("click", () => {
            const currentTd = btn.closest("td");
            // ?꾩옱 td???좎쭨
            const currentDate = new Date(currentTd.getAttribute("data-date"));
            // ??踰덉㎏ ?대┃???? ?쒖옉?좎쭨 ?댁쟾 ?대㈃ 珥덇린??
            if (startTd) {
              const startDate = new Date(startTd.getAttribute("data-date"));
              if (currentDate < startDate) {
                console.log("?쒖옉?좎쭨 ?댁쟾? ?좏깮?????놁뒿?덈떎.");
                startTd = null;
                clickCount = 0;
                // return;
              }
            }

            clickCount++;

            if (clickCount % 2 === 1) {
              tblCellBtns.forEach((otherBtn) => {
                otherBtn.closest("td").classList.remove("period", "start", "end");
                otherBtn.removeAttribute("aria-pressed");
              });
              btn.closest("td").classList.add("period", "start");
              btn.setAttribute("aria-pressed", "true");
              startTd = currentTd;
            } else {
              btn.closest("td").classList.add("period", "end");
              btn.setAttribute("aria-pressed", "true");
              let started = false;
              tblCellBtns.forEach((otherBtn) => {
                const td = otherBtn.closest("td");
                if (td === startTd) {
                  started = true;
                }
                if (started && td !== currentTd) {
                  td.classList.add("period");
                  otherBtn.setAttribute("aria-pressed", "true");
                }
                if (td === currentTd) {
                  started = false;
                }
              });
              startTd = null;
            }
          });
          // action
          actionBtns.forEach((action) => {
            accReset(action, btn);
          });
        }
      });
    });
  },
};

/*** * krds_inPageNavigation * ***/
const krds_inPageNavigation = {
  quickIndicators: null,
  init() {
    this.quickIndicators = document.querySelectorAll(".krds-in-page-navigation-type .krds-in-page-navigation-area:not(.sample) .in-page-navigation-list");

    if (!this.quickIndicators.length) return;

    this.observeListChanges();
    this.setupAnchorScroll();
    this.updateActiveSection();
  },
  observeListChanges() {
    // in-page-navigation-list 蹂寃???setupAnchorScroll ?몄텧
    const quickList = document.querySelector(".krds-in-page-navigation-type .in-page-navigation-list");
    if (!quickList) return;
    const observer = new MutationObserver(() => {
      this.setupAnchorScroll();
    });
    observer.observe(quickList, {
      childList: true,
      subtree: true,
    });
  },
  setupAnchorScroll() {
    this.quickIndicators.forEach((indicator) => {
      const locationList = indicator.querySelectorAll("a");
      locationList.forEach((anchor) => {
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
          anchor.removeEventListener("click", this.applyScroll);
          anchor.removeEventListener("keydown", this.applyScroll);
          anchor.addEventListener("click", this.applyScroll.bind(this, target));
          anchor.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              this.applyScroll(target, event);
            }
          });
        }
      });
    });
  },
  applyScroll(target, event) {
    event.preventDefault();
    const headerHeight = this.calculateHeaderHeight();

    window.scrollTo({
      left: 0,
      top: target.getBoundingClientRect().top + window.scrollY - headerHeight,
      behavior: "smooth",
    });

    // enter 珥덉젏 ?대룞
    if (event.type === "keydown") {
      const focusable = target.querySelector(".sec-tit");

      if (focusable) {
        focusable.setAttribute("tabindex", "-1");
        focusable.focus({ preventScroll: true });
      }
    }
  },
  calculateHeaderHeight() {
    const headerTop = document.querySelector("#krds-masthead")?.clientHeight || 0;
    const headerInner = document.querySelector("#krds-header .header-in")?.clientHeight || 0;
    return headerTop + headerInner;
  },
  updateActiveSection() {
    if (!this.quickIndicators) return;

    const winHeight = window.innerHeight;
    let sectionArea = [];
    const activeTab = document.querySelector(".tab-conts:not(.sample).active");

    // ??씠 ?꾨땺?뚯? ??씪??sectionArea ?ㅼ젙
    if (activeTab) {
      const id = activeTab.getAttribute("id");
      const dataTrue = activeTab.getAttribute("data-quick-nav");
      if (dataTrue === "true") {
        sectionArea = document.querySelectorAll(`#${id} .section-link`);
      }
    } else {
      sectionArea = document.querySelectorAll(".scroll-check .section-link");
    }

    //?섏씠吏 ?ㅽ겕濡??????ㅻ퉬寃뚯씠???대떦硫붾돱 active
    if (sectionArea.length > 0) {
      const topHeight = Math.ceil(winHeight / 5); // ?덈룄?곗쓽 20%
      const firstSecTop = sectionArea[0].offsetTop;
      const scrollBottom = window.scrollY + winHeight;
      const scrollHeight = document.body.scrollHeight;
      sectionArea.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - topHeight;
        const sectionId = current.getAttribute("id");
        const navLink = document.querySelector(`.krds-in-page-navigation-area a[href*=${sectionId}]`);
        const firstAnchor = document.querySelector(".krds-in-page-navigation-area .in-page-navigation-list li:first-of-type a");
        const lastAnchor = document.querySelector(".krds-in-page-navigation-area .in-page-navigation-list li:last-of-type a");
        if (scrollBottom >= scrollHeight) {
          // ?ㅽ겕濡ㅼ씠 ?섏씠吏 ?앹뿉 ?꾨떖?덉쓣 ??
          this.setActiveIndicator(lastAnchor);
        }
        else if (window.scrollY <= firstSecTop) {
          // ?ㅽ겕濡ㅼ씠 泥ル쾲吏??뱀뀡蹂대떎 ?꾩뿉 ?덉쓣??
          this.setActiveIndicator(firstAnchor);
        } else if (window.scrollY > sectionTop && window.scrollY <= sectionTop + sectionHeight) {
          // ?꾩옱 ?뱀뀡???덉쓣 ??
          this.setActiveIndicator(navLink);
        }
      });
    }
  },
  setActiveIndicator(anchor) {
    if (anchor) {
      this.quickIndicators.forEach((indicator) => {
        const locationList = indicator.querySelectorAll("a");
        locationList.forEach((anchor) => {
          anchor.classList.remove("active");
        });
      });
      anchor.classList.add("active");
    }
  },
};

/*** * krds_helpPanel * ***/
const krds_helpPanel = {
  helpPanel: null,
  lastFocusedButton: null,
  executeButton: null,
  collapseButton: null,
  init() {
    this.helpPanel = document.querySelector(".krds-help-panel");

    if (!this.helpPanel) return;

    this.executeButton = document.querySelectorAll(".btn-help-exec");
    this.collapseButton = this.helpPanel.querySelector(".btn-help-panel.fold");

    this.setupPadding();
    this.observeMastHead();
    this.setupHelpButtons();
    this.toggleScrollLock();
  },
  setupPadding() {
    const topBannerHeight = document.querySelector("#krds-masthead")?.offsetHeight;
    const headerHeight = document.querySelector("#krds-header .header-in")?.offsetHeight;
    const defaultPadding = topBannerHeight + headerHeight;
    const hiddenBannerPadding = headerHeight;

    const expandBox = document.querySelector(".help-panel-wrap");
    const expandButton = document.querySelector(".btn-help-panel.expand");

    const applyPadding = (padding) => {
      expandButton.style.marginTop = padding;
      if (windowSize.getWinSize() === "pc") {
        expandBox.style.paddingTop = padding;
        this.collapseButton.style.marginTop = padding;
      } else {
        expandBox.removeAttribute("style");
        this.collapseButton.removeAttribute("style");
      }
    };

    // bn-hidden: ?ㅻ뜑 諛곕꼫 ?④?, scroll-down: ?ㅻ뜑 ?④?
    if (document.body.classList.contains("bn-hidden")) {
      if (document.querySelector("#wrap").classList.contains("scroll-down")) {
        applyPadding("0");
      } else {
        applyPadding(`${hiddenBannerPadding}px`);
      }
    } else {
      applyPadding(`${defaultPadding}px`);
    }
  },
  observeMastHead() {
    const topBanner = document.querySelector("#krds-masthead");
    if (!topBanner) return;
    const body = document.body;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          body.classList.toggle("bn-hidden", !entry.isIntersecting);
        });
      },
      { root: null, threshold: 0 }
    );
    observer.observe(topBanner);
  },
  setupHelpButtons() {
    this.executeButton.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.lastFocusedButton = btn;
        this.toggleHelpPanel("open", btn);
      });
      btn.setAttribute("aria-expanded", "false");
    });
    if (this.collapseButton) {
      this.collapseButton.addEventListener("click", () => {
        this.toggleHelpPanel("close");
      });
    }
  },
  toggleHelpPanel(action, triggerBtn) {
    const helpWrap = document.querySelector(".help-panel-wrap");
    const innerContainer = document.querySelector("#container > .inner");

    if (!helpWrap || !innerContainer || !this.helpPanel) return;

    if (action === "open") {
      if (windowSize.getWinSize() === "mob") {
        document.body.classList.add("scroll-no");
      }

      this.helpPanel.classList.add("expand");
      helpWrap.setAttribute("tabindex", "0");

      if (triggerBtn) {
        setTimeout(() => {
          helpWrap.focus();
        }, 50);
      }

      // ?꾩??⑤꼸? ?섏씠吏???쒓컻留??덇퀬 而⑦듃濡ㅽ븯??踰꾪듉? ?щ윭媛쒖씪??
      this.executeButton.forEach((btn) => {
        btn.setAttribute("aria-expanded", "true");
      });

      // inner媛 flexible??寃쎌슦
      if (innerContainer.classList.contains("help-panel-flexible")) {
        innerContainer.classList.add("help-panel-expanded");
      }
    } else if (action === "close") {
      if (windowSize.getWinSize() === "mob") {
        document.body.classList.remove("scroll-no");
      }

      this.helpPanel.classList.remove("expand");
      helpWrap.removeAttribute("tabindex");

      if (this.lastFocusedButton) {
        this.lastFocusedButton.focus();
      } else {
        // 泥섏쓬 遺???ㅽ뵂?쇰븣 吏??踰꾪듉?쇰줈 ?ъ빱???대룞
        document.querySelector(".btn-help-panel.expand").focus();
      }

      // ?꾩??⑤꼸? ?섏씠吏???쒓컻留??덇퀬 而⑦듃濡ㅽ븯??踰꾪듉? ?щ윭媛쒖씪??
      this.executeButton.forEach((btn) => {
        btn.setAttribute("aria-expanded", "false");
      });

      // inner媛 flexible??寃쎌슦
      if (innerContainer.classList.contains("help-panel-flexible")) {
        innerContainer.classList.remove("help-panel-expanded");
      }
    }
  },
  toggleScrollLock() {
    setTimeout(() => {
      if (windowSize.getWinSize() === "mob" && this.helpPanel.classList.contains("expand")) {
        document.body.classList.add("scroll-no");
      } else {
        document.body.classList.remove("scroll-no");
      }
    }, 0);
  },
};

/*** * krds_disclosure * ***/
const krds_disclosure = {
  disclosures: null,
  init() {
    this.disclosures = document.querySelectorAll(".krds-disclosure");

    if (!this.disclosures.length) return;

    this.setupDisclosure();
  },
  setupDisclosure() {
    this.disclosures.forEach((disclosure) => {
      const disclosureButton = disclosure.querySelector(".btn-conts-expand");
      const disclosureContent = disclosure.querySelector(".expand-wrap");
      const uniqueIdx = `disclosure-${Math.random().toString(36).substring(2, 9)}`;

      // ?덉쇅 泥섎━: disclosureButton ?놁씠 active ?곹깭瑜?吏곸젒 ?ㅼ젙?섏뿬 ?뺤옣 ?곹깭瑜??쒖뼱?섎뒗 寃쎌슦
      if (!disclosureButton) return;

      // aria ?띿꽦 ?ㅼ젙
      disclosureButton.setAttribute("aria-expanded", "false");
      disclosureButton.setAttribute("aria-controls", uniqueIdx);
      disclosureContent.setAttribute("id", uniqueIdx);
      // disclosureContent.setAttribute("aria-hidden", "true"); // ?꾩떆: disclosure ?댁슜???쇰?留??몄텧?섎뒗 寃쎌슦
      disclosureContent.setAttribute("inert", "");
      if (disclosure.classList.contains("active")) {
        disclosureButton.setAttribute("aria-expanded", "true");
        // disclosureContent.setAttribute("aria-hidden", "false"); // ?꾩떆: disclosure ?댁슜???쇰?留??몄텧?섎뒗 寃쎌슦
        disclosureContent.removeAttribute("inert");
      }

      disclosureButton.addEventListener("click", () => {
        this.toggleDisclosure(disclosure, disclosureButton, disclosureContent);
      });
    });
  },
  toggleDisclosure(disclosure, disclosureButton, disclosureContent) {
    const isExpanded = disclosureButton.getAttribute("aria-expanded") === "true";

    disclosure.classList.toggle("active", !isExpanded);
    disclosureButton.setAttribute("aria-expanded", !isExpanded);

    // disclosureContent.setAttribute("aria-hidden", isExpanded); // ?꾩떆: disclosure ?댁슜???쇰?留??몄텧?섎뒗 寃쎌슦
    if (isExpanded) {
      disclosureContent.setAttribute("inert", "");
    } else {
      disclosureContent.removeAttribute("inert");
    }
  },
};

/*** * krds_adjustContentScale * ***/
const krds_adjustContentScale = {
  body: document.body,
  scaleLevel: 1,
  minScale: 0.5,
  maxScale: 2,
  init() {
    const scaleButtons = document.querySelectorAll("[data-adjust] [data-adjust-scale]");

    if (!scaleButtons.length) return;

    // root 蹂?섏뿉???ㅼ???媛믪쓣 媛?몄삤湲?
    const root = document.querySelector(":root");
    const rootStyles = getComputedStyle(root);
    const zoomSmall = rootStyles.getPropertyValue("--krds-zoom-small").trim();
    const zoomMedium = rootStyles.getPropertyValue("--krds-zoom-medium").trim();
    const zoomLarge = rootStyles.getPropertyValue("--krds-zoom-large").trim();
    const zoomXlarge = rootStyles.getPropertyValue("--krds-zoom-xlarge").trim();
    const zoomXxlarge = rootStyles.getPropertyValue("--krds-zoom-xxlarge").trim();

    scaleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const scale = button.getAttribute("data-adjust-scale");
        switch (scale) {
          case "sm":
            this.scaleValue(zoomSmall);
            break;
          case "md":
            const others = button.closest(".drop-menu").querySelectorAll(".item-link");
            const defaultSize = button.closest(".drop-menu").querySelector(".item-link.md");
            others.forEach((item) => {
              item.classList.remove("active");
              item.setAttribute("aria-selected", "false");
              item.querySelector(".sr-only").innerHTML = "";
            });
            defaultSize.classList.add("active");
            defaultSize.querySelector(".sr-only").innerHTML = "?좏깮??;
            this.scaleValue(zoomMedium);
            break;
          case "lg":
            this.scaleValue(zoomLarge);
            break;
          case "xlg":
            this.scaleValue(zoomXlarge);
            break;
          case "xxlg":
            this.scaleValue(zoomXxlarge);
            break;
          default:
            break;
        }
      });
    });
  },
  scaleValue(value) {
    this.scaleLevel = value;
    this.body.style.zoom = this.scaleLevel;
  },
  scaleDefault() {
    this.scaleLevel = 1;
    this.body.style.zoom = this.scaleLevel;
  },
  scaleMin() {
    this.scaleLevel = this.minScale;
    this.body.style.zoom = this.scaleLevel;
  },
  scaleMax() {
    this.scaleLevel = this.maxScale;
    this.body.style.zoom = this.scaleLevel;
  },
  scaleUp() {
    if (this.scaleLevel < this.maxScale) {
      this.scaleLevel += 0.1;
      if (this.scaleLevel > this.maxScale) this.scaleLevel = this.maxScale;
      this.body.style.zoom = this.scaleLevel;
    }
  },
  scaleDown() {
    if (this.scaleLevel > this.minScale) {
      this.scaleLevel -= 0.1;
      if (this.scaleLevel < this.minScale) this.scaleLevel = this.minScale;
      this.body.style.zoom = this.scaleLevel;
    }
  },
};

/*** * krds_toggleSwitch * ***/
const krds_toggleSwitch = {
  init() {
    const toggleSwitch = document.querySelectorAll(".krds-form-toggle-switch");

    if (!toggleSwitch.length) return;

    toggleSwitch.forEach((toggle) => {
      const input = toggle.querySelector("input");
      if (!input) return;
      input.addEventListener("focus", () => {
        toggle.classList.add("focus");
      });
      input.addEventListener("focusout", () => {
        toggle.classList.remove("focus");
      });
    });
  },
};

/*** * krds_infoList * ***/
const krds_infoList = {
  init() {
    const infoLists = document.querySelectorAll(".krds-info-list");

    if (!infoLists.length) return;

    infoLists.forEach((list) => {
      list.setAttribute("role", "list");
      const listItems = list.querySelectorAll("li");
      listItems.forEach((item) => {
        item.setAttribute("role", "listitem");
      });
    });
  },
};

/*** * krds_dropEvent(gnb utils / page-title-wrap) * ***/
const krds_dropEvent = {
  dropButtons: null,
  init() {
    this.dropButtons = document.querySelectorAll(".krds-drop-wrap:not(.sample) .drop-btn");

    if (!this.dropButtons.length) return;

    this.setupEventListeners();
    this.setupFocusOutEvent();
  },
  setupEventListeners() {
    this.dropButtons.forEach((button) => {
      const menu = button.nextElementSibling;
      button.setAttribute("aria-expanded", "false");

      button.addEventListener("click", () => {
        const isOpen = menu.style.display === "block";
        this.closeAllDropdowns();
        if (!isOpen) {
          this.openDropdown(button, menu);
        }
      });

      this.setupMenuItems(menu);
    });
  },
  setupMenuItems(menu) {
    const items = menu.querySelectorAll(".item-link");

    items.forEach((item) => {
      item.innerHTML += `<span class="sr-only"></span>`;
      if (item.classList.contains("active")) {
        item.querySelector(".sr-only").innerHTML = "?좏깮??;
      }

      item.addEventListener("click", () => {
        this.activateMenuItem(item);
        this.closeAllDropdowns();
        const button = item.closest(".krds-drop-wrap").querySelector(".drop-btn");
        button?.focus();
      });

      item.addEventListener("focus", () => {
        document.querySelectorAll(".krds-drop-wrap .drop-list .item-link").forEach((item) => {
          item.style.position = "relative";
          item.style.zIndex = "0";
        });
        item.style.zIndex = "1";
      });
    });
  },
  activateMenuItem(selectedItem) {
    const menu = selectedItem.closest(".drop-menu");
    const items = menu.querySelectorAll(".item-link");

    items.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
      item.querySelector(".sr-only").innerText = "";
    });

    selectedItem.classList.add("active");
    selectedItem.setAttribute("aria-selected", "true");
    selectedItem.querySelector(".sr-only").innerText = "?좏깮??;
  },
  openDropdown(button, menu) {
    menu.style.display = "block";
    button.classList.add("active");
    button.setAttribute("aria-expanded", "true");

    // ?щ갚???곕씪 ?꾩튂 議곗젙
    const menuRect = menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    if (menuRect.left < 0) {
      menu.closest(".krds-drop-wrap").classList.add("drop-left");
    } else if (windowWidth < menuRect.left + menuRect.width) {
      menu.closest(".krds-drop-wrap").classList.add("drop-right");
    }

  },
  closeAllDropdowns() {
    document.querySelectorAll(".krds-drop-wrap .drop-menu").forEach((menu) => {
      menu.style.display = "none";
    });
    this.dropButtons.forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-expanded", "false");
    });
  },
  setupFocusOutEvent() {
    // ESC ?リ린
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" || event.key === "Esc") {
        this.closeAllDropdowns();
        event.target.closest(".krds-drop-wrap")?.querySelector(".drop-btn")?.focus();
      }
    });

    // ?쒕∼?ㅼ슫 ?몃? ?대┃ ???リ린
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".krds-drop-wrap")) {
        this.closeAllDropdowns();
      }
    });

    // ?쒕∼?ㅼ슫 ?ъ빱???꾩썐 泥섎━
    this.dropButtons.forEach((button) => {
      const menu = button.nextElementSibling;

      if (!menu) return;

      // ?쒕∼?ㅼ슫 硫붾돱???ъ빱???꾩썐 泥섎━
      menu.addEventListener("focusout", (event) => {
        const isFocusInside = menu.contains(event.relatedTarget) || button.contains(event.relatedTarget);
        if (!isFocusInside) {
          this.closeAllDropdowns();
        }
      });

      // 踰꾪듉???ъ빱???꾩썐 泥섎━
      button.addEventListener("focusout", (event) => {
        const isFocusInside = menu.contains(event.relatedTarget) || button.contains(event.relatedTarget);
        if (!isFocusInside) {
          this.closeAllDropdowns();
        }
      });
    });
  },
};

/*** * krds_chkBox 諛뺤뒪??泥댄겕諛뺤뒪 ?곹깭???곕Ⅸ ?붿옄??蹂寃?* ***/
const krds_chkBox = {
  init() {
    const box = document.querySelectorAll(".chk-group-wrap");
    box.forEach((e) => {
      const boxList = e.querySelectorAll("li");
      boxList.forEach((ele) => {
        ele.removeAttribute("class");
        const thisList = ele.closest("li");
        const checkbox = ele.querySelector("input[type=checkbox]");
        if (checkbox != null) {
          const is_disabled = checkbox.disabled;
          let is_checked = checkbox.checked;

          if (is_disabled == true) {
            thisList.classList.add("disabled");
          } else {
            if (is_checked == true) {
              thisList.classList.add("checked");
            }
          }

          checkbox.addEventListener("click", () => {
            if (is_checked == true) {
              thisList.classList.remove("checked");
              is_checked = false;
            } else {
              thisList.classList.add("checked");
              is_checked = true;
            }
          });
        }

        const rdo = ele.querySelector("input[type=radio]");
        if (rdo != null) {
          const is_disabled = rdo.disabled;
          let is_checked = rdo.checked;

          if (is_disabled == true) {
            thisList.classList.add("disabled");
          } else {
            if (is_checked == true) {
              thisList.classList.add("checked");
            }
          }

          rdo.addEventListener("click", (e) => {
            const rdoGroup = rdo.closest(".chk-group-wrap");
            const rdoLi = rdoGroup.querySelectorAll("li");
            let is_checked2 = e.checked;
            rdoLi.forEach((ele) => {
              ele.classList.remove("checked");
              is_checked2 = false;
            });
            if (is_checked2 == true) {
              thisList.classList.remove("checked");
              is_checked2 = false;
            } else {
              thisList.classList.add("checked");
              is_checked2 = true;
            }
          });
        }
      });
    });

    this.formChipFocus();
  },
  formChipFocus() {
    // form_chip ?쇰븣 ?ъ빱??泥섎━
    const formChip = document.querySelectorAll(".krds-form-chip");

    if (!formChip.length) return;
    
    formChip.forEach((chip) => {
      const input = chip.querySelector("input");
      if (!input) return;
      input.addEventListener("focus", () => {
        chip.classList.add("focus");
      });
      input.addEventListener("focusout", () => {
        chip.classList.remove("focus");
      });
    });

  },
};

/*** * krds_fileUpload ?뚯씪 ?낅줈??: drag ?꾩떆 * ***/
const krds_fileUpload = {
  init() {
    const fileUploads = document.querySelectorAll(".file-upload");
    fileUploads.forEach((fileUpload) => {
      const inputFile = fileUpload.querySelector('input[type="file"]');
      const inputButton = fileUpload.querySelector("button");

      inputButton.addEventListener("click", () => {
        inputFile.click();
      });

      fileUpload.addEventListener("dragover", (e) => {
        fileUpload.classList.add("active");
        e.preventDefault();
      });

      fileUpload.addEventListener("dragleave", (e) => {
        fileUpload.classList.remove("active");
        e.preventDefault();
      });

      fileUpload.addEventListener("drop", (e) => {
        fileUpload.classList.remove("active");
        e.preventDefault();
        // const files = e.dataTransfer.files;
      });
    });
  },
};

/*** * nuriToggleEvent ?꾨━吏??좉? ?대깽???꾩옱???ъ슜 ????* ***/
const nuriToggleEvent = {
  init() {
    const _toggleBtns = document.querySelectorAll("#krds-masthead .toggle-btn");
    _toggleBtns.forEach(($toggleBtn) => {
      $toggleBtn.addEventListener("click", ($btnAct) => {
        const $target = $btnAct.target.closest(".toggle-head");
        const $targetBody = $target.nextElementSibling;
        const _targetBodyH = $targetBody.querySelector(".inner").scrollHeight;
        const $srEl = $btnAct.target.querySelector(".sr-only");

        if (!$target.classList.contains("active")) {
          $srEl.innerText = "?ロ옒";
          $target.classList.add("active");
          $targetBody.classList.add("active");
          $targetBody.style.height = `${_targetBodyH}px`;
          window.addEventListener("resize", () => {
            if ($targetBody.classList.contains("active")) {
              const _targetBodyH = $targetBody.querySelector(".inner").scrollHeight;
              $targetBody.style.height = `${_targetBodyH}px`;
            }
          });
        } else {
          $srEl.innerText = "?대┝";
          $target.classList.remove("active");
          $targetBody.classList.remove("active");
          $targetBody.style.height = "";
        }
      });
    });
  },
};

// 珥덇린 ?대깽??
window.addEventListener("DOMContentLoaded", () => {
  // ?덈룄???ъ씠利?泥댄겕
  windowSize.setWinSize();

  krds_mainMenuPC.init();
  krds_mainMenuMobile.init();
  krds_sideNavigation.init();
  krds_tab.init();
  krds_accordion.init();
  krds_modal.init();
  krds_contextualHelp.init();
  krds_tooltip.init();
  krds_disclosure.init();
  krds_dropEvent.init();
  krds_calendar.init();
  krds_inPageNavigation.init();
  krds_adjustContentScale.init();
  krds_toggleSwitch.init();
  krds_infoList.init();
  krds_chkBox.init();
  krds_fileUpload.init();

  krds_helpPanel.init();
  if (windowSize.getWinSize() === "pc") {
    krds_helpPanel.toggleHelpPanel("open");
  }
});

// ?ㅽ겕濡??대깽??
window.addEventListener("scroll", () => {
  scrollManager.updateScrollValues();
  scrollManager.handleScrollDirection();

  krds_mainMenuPC.closeMainMenu();
  krds_inPageNavigation.updateActiveSection();
  krds_helpPanel.init();
});

// 由ъ궗?댁쫰 ?대깽??
window.addEventListener("resize", () => {
  windowSize.setWinSize();
  krds_helpPanel.init();
});
