// Loads lang/<code>.json and fills every element that has data-i18n="key".
// data-i18n-attr="aria-label" puts the text in that attribute instead.
(function () {
  var cfg = window.TLS_CONFIG;
  var store = {
    get: function () { try { return localStorage.getItem("tls_lang"); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem("tls_lang", v); } catch (e) {} }
  };

  function pickLanguage() {
    var fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl && cfg.languages.indexOf(fromUrl) > -1) return fromUrl;
    var saved = store.get();
    if (saved && cfg.languages.indexOf(saved) > -1) return saved;
    var nav = (navigator.language || "").slice(0, 2).toLowerCase();
    return cfg.languages.indexOf(nav) > -1 ? nav : cfg.defaultLanguage;
  }

  function lookup(dict, key) {
    return key.split(".").reduce(function (o, k) { return o && o[k]; }, dict);
  }

  function fill(text, vars) {
    return String(text).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
  }

  var english = null;

  function apply(dict, lang) {
    var vars = { licence: cfg.aatLicence, email: cfg.contactEmail, phone: cfg.phone };
    document.documentElement.lang = lang;
    document.documentElement.dir = (dict._meta && dict._meta.direction) || "ltr";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var text = lookup(dict, key);
      if (text == null && english) text = lookup(english, key);   // fall back to English
      if (text == null) return;
      if (el.dataset.i18nVars) {
        el.dataset.i18nVars.split(",").forEach(function (p) {
          var kv = p.split("="); vars[kv[0]] = kv[1];
        });
      }
      var out = fill(text, vars);
      var attr = el.getAttribute("data-i18n-attr");
      if (attr) el.setAttribute(attr, out); else el.textContent = out;
    });
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang-btn") === lang ? "true" : "false");
    });
    var note = document.querySelector("[data-translation-note]");
    if (note) note.hidden = (lang === "en");
    document.dispatchEvent(new CustomEvent("tls:language", { detail: { lang: lang } }));
  }

  function load(lang) {
    var base = document.documentElement.getAttribute("data-base") || "";
    var get = function (l) { return fetch(base + "lang/" + l + ".json", { cache: "no-cache" }).then(function (r) { return r.json(); }); };
    var englishReady = english ? Promise.resolve(english) : get("en").then(function (d) { english = d; return d; });
    return englishReady.then(function () { return lang === "en" ? english : get(lang); })
      .then(function (dict) { apply(dict, lang); store.set(lang); })
      .catch(function () { if (lang !== "en") load("en"); });
  }

  window.TLS_I18N = { load: load, current: pickLanguage };

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.addEventListener("click", function () { load(b.getAttribute("data-lang-btn")); });
    });
    load(pickLanguage());
  });
})();
