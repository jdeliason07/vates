/* ============================================================
   vates — storefront behaviour
   Client-side state only. Nothing is persisted, nothing is sent.
   Four parts: the store (cart, drawer, checkout), the shop UI (the
   announcement bar, the menu panel, the collection tabs, the signup
   band), and the film-to-reel handover in Our story.
   ============================================================ */
(function () {
  "use strict";

  var PRODUCT = {
    id: "no-01",
    name: "No. 01",
    price: 89,
    /* The drawer shows the bottle on its own — at 4.5rem a whole
       room is a smudge. */
    image: "assets/img/no-01-thumb.webp",
    max: 10
  };

  /** @type {{id:string,qty:number}[]} — in-memory only, cleared on reload. */
  var cart = [];

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var el = {
    year: document.getElementById("year"),
    drawer: document.getElementById("order-drawer"),
    backdrop: document.getElementById("drawer-backdrop"),
    close: document.getElementById("drawer-close"),
    open: document.getElementById("cart-open"),
    count: document.getElementById("cart-count"),
    items: document.getElementById("line-items"),
    empty: document.getElementById("drawer-empty"),
    box: document.getElementById("box-contents"),
    total: document.getElementById("drawer-total"),
    checkout: document.getElementById("checkout"),
    notice: document.getElementById("drawer-notice"),
    menu: document.getElementById("menu"),
    menuOpen: document.getElementById("menu-open"),
    menuClose: document.getElementById("menu-close")
  };

  if (el.year) el.year.textContent = String(new Date().getFullYear());

  /* ── helpers ─────────────────────────────────────────────── */

  function money(value) {
    return "$" + value.toLocaleString("en-US");
  }

  function clamp(value, min, max) {
    if (isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  function totalPrice() {
    return cart.reduce(function (sum, line) { return sum + line.qty * PRODUCT.price; }, 0);
  }

  function totalQty() {
    return cart.reduce(function (sum, line) { return sum + line.qty; }, 0);
  }

  /* ── cart ────────────────────────────────────────────────── */

  function addToCart(qty) {
    var line = cart.filter(function (l) { return l.id === PRODUCT.id; })[0];
    if (line) {
      line.qty = clamp(line.qty + qty, 1, PRODUCT.max);
    } else {
      cart.push({ id: PRODUCT.id, qty: clamp(qty, 1, PRODUCT.max) });
    }
    render();
  }

  function setLineQty(id, qty) {
    cart = cart
      .map(function (line) {
        return line.id === id ? { id: id, qty: clamp(qty, 0, PRODUCT.max) } : line;
      })
      .filter(function (line) { return line.qty > 0; });
    render();
  }

  function removeLine(id) {
    cart = cart.filter(function (line) { return line.id !== id; });
    render();
  }

  /* ── rendering ───────────────────────────────────────────── */

  function lineItemNode(line) {
    var li = document.createElement("li");
    li.className = "line-item";
    li.dataset.id = line.id;

    li.innerHTML =
      '<div class="line-item__thumb">' +
        '<img src="' + PRODUCT.image + '" alt="">' +
      "</div>" +
      "<div>" +
        '<div class="line-item__head">' +
          '<span class="line-item__name">' + PRODUCT.name +
            '<span class="line-item__aka"> — smoke</span>' +
          "</span>" +
        "</div>" +
        '<div class="line-item__controls">' +
          '<div class="stepper" role="group" aria-label="Quantity, ' + PRODUCT.name + '">' +
            '<button type="button" class="stepper__btn" data-line-step="-1" aria-label="Decrease quantity">−</button>' +
            '<input class="stepper__input" type="number" min="1" max="' + PRODUCT.max + '" step="1" ' +
              'inputmode="numeric" value="' + line.qty + '" aria-label="Quantity, ' + PRODUCT.name + '">' +
            '<button type="button" class="stepper__btn" data-line-step="1" aria-label="Increase quantity">+</button>' +
          "</div>" +
          '<button type="button" class="line-item__remove" data-remove>Remove</button>' +
        "</div>" +
      "</div>";

    return li;
  }

  /* The drawer list is rebuilt wholesale on every change, so remember which
     control the user was on and hand focus back to its replacement. */
  function focusToken() {
    var active = document.activeElement;
    if (!active || !el.items.contains(active)) return null;

    var item = active.closest(".line-item");
    if (!item) return null;

    var selector = active.dataset.lineStep
      ? '[data-line-step="' + active.dataset.lineStep + '"]'
      : active.hasAttribute("data-remove")
        ? "[data-remove]"
        : ".stepper__input";

    return { id: item.dataset.id, selector: selector };
  }

  function restoreFocus(token) {
    if (!token) return;
    var item = el.items.querySelector('.line-item[data-id="' + token.id + '"]');
    var node = item && item.querySelector(token.selector);
    if (node) node.focus();
    else el.close.focus();
  }

  function render() {
    var token = focusToken();

    el.items.innerHTML = "";
    cart.forEach(function (line) { el.items.appendChild(lineItemNode(line)); });

    el.empty.hidden = cart.length > 0;
    /* The box list is the mirror of the empty state: it describes what
       is being bought, so it belongs only when there is something in
       the cart. */
    if (el.box) el.box.hidden = cart.length === 0;
    el.total.textContent = money(totalPrice());
    el.checkout.disabled = cart.length === 0;
    if (el.count) el.count.textContent = String(totalQty());

    if (cart.length === 0) hideNotice();
    if (isOpen(el.drawer)) restoreFocus(token);
  }

  function showNotice(message) {
    el.notice.textContent = message;
    el.notice.hidden = false;
  }

  function hideNotice() {
    el.notice.hidden = true;
    el.notice.textContent = "";
  }

  /* ── the two panels ──────────────────────────────────────
     The cart drawer and the menu are the same object opening from
     opposite edges, over one backdrop. Only ever one at a time. --- */

  var lastFocused = null;
  var closeTimers = new WeakMap();
  var openPanel = null;

  function isOpen(panel) {
    return !!panel && !panel.hidden;
  }

  function focusableIn(panel) {
    return Array.prototype.filter.call(
      panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (node) { return !node.disabled && node.getClientRects().length > 0; }
    );
  }

  function openPanelEl(panel, focusFirst) {
    if (isOpen(panel)) return;
    if (openPanel && openPanel !== panel) closePanel(openPanel);

    window.clearTimeout(closeTimers.get(panel));
    lastFocused = document.activeElement;
    openPanel = panel;

    panel.hidden = false;
    el.backdrop.hidden = false;
    document.body.classList.add("is-locked");

    // force a reflow so the transform transition actually runs
    void panel.offsetWidth;
    panel.classList.add("is-open");
    el.backdrop.classList.add("is-open");

    if (focusFirst && typeof focusFirst.focus === "function") focusFirst.focus();
    if (el.menuOpen && panel === el.menu) el.menuOpen.setAttribute("aria-expanded", "true");
  }

  function closePanel(panel) {
    if (!isOpen(panel)) return;

    panel.classList.remove("is-open");
    el.backdrop.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    if (openPanel === panel) openPanel = null;

    closeTimers.set(panel, window.setTimeout(function () {
      panel.hidden = true;
      if (!openPanel) el.backdrop.hidden = true;
    }, reduceMotion.matches ? 0 : 360));

    if (el.menuOpen && panel === el.menu) el.menuOpen.setAttribute("aria-expanded", "false");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function trapTab(event) {
    if (!openPanel) return;
    var nodes = focusableIn(openPanel);
    if (nodes.length === 0) return;

    var first = nodes[0];
    var last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openDrawer() { openPanelEl(el.drawer, el.close); }
  function closeDrawer() { closePanel(el.drawer); }

  /* ── the edition line ────────────────────────────────────
     From config.js. With no number set it stays as written in the
     markup — "An edition of 500 — numbered by hand" — which is honest
     as long as the run is actually capped at the total. Set
     product.edition.number once real inventory exists (the Stripe
     dashboard is the source of truth) and this upgrades it on its own.
     Never wired to anything that counts up by itself: a figure nobody
     placed there on purpose is fabricated scarcity, not a feature. */
  (function () {
    var editionEl = document.getElementById("product-edition");
    if (!editionEl) return;
    var edition = (window.VATES && window.VATES.product && window.VATES.product.edition) || {};
    var total = edition.total;
    var number = edition.number;
    if (number != null && total != null) {
      var padded = String(number);
      while (padded.length < 3) padded = "0" + padded;
      editionEl.textContent = "No. " + padded + " of " + total + " — numbered by hand";
    } else if (total != null) {
      editionEl.textContent = "An edition of " + total + " — numbered by hand";
    }
  })();

  /* Fires once on load. It is what the ad platforms build their
     retargeting audiences from — everyone who saw the bottle and did
     not buy it yet. */
  if (window.VATES_TRACK) window.VATES_TRACK.track("view");

  /* The shortest path there is from the advert to the receipt. With a
     Payment Link configured, Checkout leaves for Stripe on the click —
     the attribution token rides along as client_reference_id, so the
     sale lands in the dashboard already credited to whoever sent them.

     With no link configured it falls back to the demonstration drawer,
     so the button is never dead while the storefront is being set up. */
  function checkoutUrl() {
    var checkout = (window.VATES && window.VATES.checkout) || {};
    var link = checkout.paymentLink || "";
    if (!link) return "";
    var ref = "";
    try {
      ref = (window.VATES_TRACK && window.VATES_TRACK.reference()) || "";
    } catch (e) {}
    var parts = [];
    if (ref) parts.push("client_reference_id=" + encodeURIComponent(ref));

    /* Stripe carries utm_* through to the redirect URL after payment,
       which client_reference_id does not do — so these are how
       thanks.html knows which campaign the sale belongs to when it
       reports the conversion. */
    try {
      var camp = (window.VATES_TRACK && window.VATES_TRACK.campaign()) || {};
      Object.keys(camp).forEach(function (k) {
        parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(camp[k]));
      });
    } catch (e) {}

    if (!parts.length) return link;
    return link + (link.indexOf("?") < 0 ? "?" : "&") + parts.join("&");
  }

  function goToCheckout() {
    var url = checkoutUrl();
    if (!url) return false;
    if (window.VATES_TRACK) window.VATES_TRACK.track("checkout");
    /* The pixels queue their beacons synchronously but send them a tick
       later; a sixtieth of a second is under the threshold of noticing
       and is the difference between a counted click and a lost one. */
    window.setTimeout(function () { window.location.href = url; }, 60);
    return true;
  }

  /* The tile's + and the closing band's Purchase both land here: add
     one, open the drawer. The drawer's Checkout is what leaves for
     Stripe — the step in between is where "What's in the box" gets
     read, which is the last thing anyone wants to know before paying. */
  function purchase() {
    hideNotice();
    addToCart(1);
    openDrawer();
    if (window.VATES_TRACK) window.VATES_TRACK.track("add");
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-purchase]"), function (btn) {
    btn.addEventListener("click", purchase);
  });

  if (el.open) el.open.addEventListener("click", function () { openDrawer(); });

  // drawer line-item controls
  el.items.addEventListener("click", function (event) {
    var item = event.target.closest(".line-item");
    if (!item) return;

    if (event.target.closest("[data-remove]")) {
      removeLine(item.dataset.id);
      if (cart.length === 0) el.close.focus();
      return;
    }

    var step = event.target.closest("[data-line-step]");
    if (!step) return;

    var input = item.querySelector(".stepper__input");
    setLineQty(item.dataset.id, parseInt(input.value, 10) + Number(step.dataset.lineStep));
  });

  el.items.addEventListener("change", function (event) {
    var input = event.target.closest(".stepper__input");
    if (!input) return;
    var item = input.closest(".line-item");
    setLineQty(item.dataset.id, parseInt(input.value, 10));
  });

  // falls back to the demonstration notice when no Payment Link is set
  el.checkout.addEventListener("click", function () {
    if (goToCheckout()) return;
    showNotice("This is a demonstration only — no payment is taken and no order is placed.");
  });

  el.close.addEventListener("click", closeDrawer);
  el.backdrop.addEventListener("click", function () { closePanel(openPanel); });

  if (el.menuOpen && el.menu) {
    el.menuOpen.addEventListener("click", function () {
      openPanelEl(el.menu, el.menuClose);
    });
    el.menuClose.addEventListener("click", function () { closePanel(el.menu); });
    /* Every link in the menu goes somewhere on this page or the next —
       either way the panel has done its job. */
    el.menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closePanel(el.menu);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (!openPanel) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel(openPanel);
    } else if (event.key === "Tab") {
      trapTab(event);
    }
  });

  render();

  /* ── The announcement bar ────────────────────────────────
     Cross-fades between the standing lines, and stops advancing on
     its own the moment someone uses the arrows — an auto-rotating
     line that moves while it is being read is worse than none. ---- */

  (function () {
    var bar = document.getElementById("announce");
    if (!bar) return;

    var items = bar.querySelectorAll(".announce__item");
    if (items.length < 2) return;

    var at = 0;
    var timer = null;
    var auto = !reduceMotion.matches;

    function show(next) {
      at = (next + items.length) % items.length;
      Array.prototype.forEach.call(items, function (item, i) {
        item.classList.toggle("is-current", i === at);
      });
    }

    function tick() {
      window.clearTimeout(timer);
      if (!auto || document.hidden) return;
      timer = window.setTimeout(function () { show(at + 1); tick(); }, 5200);
    }

    function step(by) {
      auto = false;                       // hands off once a hand is on it
      window.clearTimeout(timer);
      show(at + by);
    }

    document.getElementById("announce-prev").addEventListener("click", function () { step(-1); });
    document.getElementById("announce-next").addEventListener("click", function () { step(1); });
    document.addEventListener("visibilitychange", tick);
    tick();
  })();

  /* ── The collection tabs ─────────────────────────────────
     One grid, filtered by each tile's data-collection list. The count
     under the tabs is read off what is actually showing, so it cannot
     drift from the grid, and the rule's thumb slides to the tab that
     is open. Anything with data-tab elsewhere on the page (the rail,
     the menu) selects a collection too. ------------------------- */

  (function () {
    var tabs = document.querySelectorAll(".tabs__btn");
    var grid = document.getElementById("grid");
    if (!tabs.length || !grid) return;

    var cards = grid.querySelectorAll(".card");
    var count = document.getElementById("shop-count");
    var thumb = document.getElementById("tabs-thumb");
    var track = thumb && thumb.parentNode;

    if (track) track.style.setProperty("--n", tabs.length);

    function select(name) {
      var index = 0;
      var shown = 0;

      Array.prototype.forEach.call(tabs, function (tab, i) {
        var isIt = tab.dataset.collection === name;
        tab.setAttribute("aria-selected", isIt ? "true" : "false");
        if (isIt) {
          index = i;
          grid.setAttribute("aria-labelledby", tab.id);
        }
      });

      Array.prototype.forEach.call(cards, function (card) {
        var list = (card.dataset.collection || "").split(/\s+/);
        var showing = list.indexOf(name) > -1;
        card.hidden = !showing;
        if (showing) shown += 1;
      });

      if (count) count.textContent = shown + (shown === 1 ? " Product" : " Products");
      if (track) track.style.setProperty("--i", index);
    }

    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener("click", function () { select(tab.dataset.collection); });
    });

    /* The rail and the menu name a collection with data-tab; they also
       carry an href to #shop, so the browser does the scrolling. */
    Array.prototype.forEach.call(document.querySelectorAll("[data-tab]"), function (link) {
      link.addEventListener("click", function () { select(link.dataset.tab); });
    });

    select("best");
  })();

  /* ── The signup band ─────────────────────────────────────
     Email or SMS, and neither has anywhere to send an address yet. A
     static site can't collect one on its own — this wants a real
     endpoint (a form service, or a small serverless function) before
     it goes live, and once it has one, collecting addresses belongs in
     the privacy page too. Until then the form says so rather than
     pretending to have sent anything. --------------------------- */

  (function () {
    var form = document.getElementById("waitlist");
    if (!form) return;

    var input = document.getElementById("waitlist-email");
    var label = document.getElementById("waitlist-label");
    var note = document.getElementById("waitlist-note");
    var modes = {
      email: document.getElementById("mode-email"),
      sms: document.getElementById("mode-sms")
    };

    function setMode(which) {
      Object.keys(modes).forEach(function (key) {
        if (modes[key]) modes[key].setAttribute("aria-pressed", key === which ? "true" : "false");
      });
      if (which === "sms") {
        input.type = "tel";
        input.autocomplete = "tel";
        input.placeholder = "Enter Your Number.";
        if (label) label.textContent = "Your phone number";
      } else {
        input.type = "email";
        input.autocomplete = "email";
        input.placeholder = "Enter Your Email.";
        if (label) label.textContent = "Your email address";
      }
      if (note) note.hidden = true;
    }

    if (modes.email) modes.email.addEventListener("click", function () { setMode("email"); });
    if (modes.sms) modes.sms.addEventListener("click", function () { setMode("sms"); });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!note) return;
      note.textContent = "The list isn't connected yet — nothing was sent.";
      note.hidden = false;
    });
  })();

  /* ── The film, then the reel ─────────────────────────────
     The archive reel lives inside the film's own frame and takes
     over the moment the film ends. The pictures are named in the
     markup: data-frame-src is the path with {n} standing in for a
     two-digit number, counted from 01 up to data-frame-count.
     Replaying the film puts it back on top; the reel returns at the
     next "ended". Holds its picture when the tab is hidden or the
     section is off screen. ---------------------------------------- */

  var film = document.getElementById("about-film");
  var reel = document.getElementById("about-reel");

  if (film && reel) {
    var frames = (function () {
      var list = [];
      var template = reel.getAttribute("data-frame-src");
      var count = parseInt(reel.getAttribute("data-frame-count"), 10);
      if (!template || !(count > 0)) return list;
      for (var i = 1; i <= count; i++) {
        list.push(template.replace("{n}", (i < 10 ? "0" : "") + i));
      }
      return list;
    })();

    var slots = reel.querySelectorAll("img");
    var idle = 1, cursor = -1, timer = null, visible = true, active = false;
    var warmed = 0;
    var HOLD = 2600;

    /* The sourced quotes, keyed by the frame's two-digit number. A frame
       with a list takes the next entry each time it comes round; a frame
       with no entry runs without a quote. A missing or malformed block
       is caught: the reel runs, it just runs quietly. */
    var quotes = (function () {
      try {
        return JSON.parse(document.getElementById("reel-captions").textContent) || {};
      } catch (e) { return {}; }
    })();
    var quoteTurns = {};
    var quoteBox = document.getElementById("about-quote");

    var say = function (frameIndex) {
      if (!quoteBox) return;
      var key = (frameIndex < 9 ? "0" : "") + (frameIndex + 1);
      var list = quotes[key];
      if (!list || !list.length) { quoteBox.hidden = true; return; }
      var at = quoteTurns[key] || 0;
      quoteTurns[key] = (at + 1) % list.length;
      var entry = list[at];
      quoteBox.querySelector(".story__quote").textContent = entry.q || "";
      quoteBox.querySelector(".story__quote-by").textContent = entry.who || "";
      quoteBox.hidden = false;
    };

    /* Pull the first pictures into cache while the film plays, so the
       handover lands on a decoded frame rather than a fetch. */
    var warmNext = function () {
      if (warmed >= frames.length) return;
      var img = new Image();
      img.src = frames[warmed];
      warmed += 1;
    };

    var turn = function () {
      if (!frames.length) return;
      cursor = (cursor + 1) % frames.length;
      var slot = slots[idle];
      slot.src = frames[cursor];
      var done = function () {
        if (!active) return;
        slot.classList.add("is-current");
        slots[1 - idle].classList.remove("is-current");
        idle = 1 - idle;
        say(cursor);
        warmNext();
        hold();
      };
      if (slot.decode) slot.decode().then(done)["catch"](done);
      else done();
    };

    var hold = function () {
      window.clearTimeout(timer);
      if (!active || document.hidden || !visible || reduceMotion.matches) return;
      timer = window.setTimeout(turn, HOLD);
    };

    film.addEventListener("play", function () {
      /* Replay: the film comes back on top, the reel stands down. */
      active = false;
      window.clearTimeout(timer);
      slots[0].classList.remove("is-current");
      slots[1].classList.remove("is-current");
      if (quoteBox) quoteBox.hidden = true;
      /* a head start for the handover */
      warmNext(); warmNext(); warmNext();
    });

    film.addEventListener("ended", function () {
      active = true;
      turn();   // under reduced motion this lands one still and stays
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        hold();
      }, { threshold: 0.1 }).observe(reel);
    }
    document.addEventListener("visibilitychange", hold);
  }
})();
