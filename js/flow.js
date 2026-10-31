// Shared helpers for the screens after "Check details":
// translations (t), dates and amounts, and calls to the case-flow function on Supabase.
// Nothing secret here: the private case link lives only in this browser tab (sessionStorage).
window.TLS_FLOW = (function () {
  var cfg = window.TLS_CONFIG;
  var dict = null, english = null;
  var params = new URLSearchParams(location.search);

  function get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function getJSON(k) { try { return JSON.parse(get(k) || "null"); } catch (e) { return null; } }
  function setJSON(k, v) { set(k, JSON.stringify(v)); }

  function lookup(d, key) { return key.split(".").reduce(function (o, k) { return o && o[k]; }, d); }
  function t(key, vars) {
    var v = lookup(dict, key);
    if (v == null) v = lookup(english, key);
    if (v == null) v = key;
    vars = vars || {};
    if (vars.email == null) vars.email = cfg.contactEmail;
    if (vars.phone == null) vars.phone = cfg.phone;
    return String(v).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
  }
  function lang() { return document.documentElement.lang || "en"; }
  function locale() { return lang() === "ro" ? "ro-RO" : "en-GB"; }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(String(iso).slice(0, 10) + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" });
  }
  function money(n) {
    if (n == null || n === "" || isNaN(Number(n))) return "";
    var x = Number(n);
    return "£" + x.toLocaleString("en-GB", { minimumFractionDigits: x % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function daysUntil(iso) {
    if (!iso) return null;
    var a = new Date(today() + "T00:00:00"), b = new Date(String(iso).slice(0, 10) + "T00:00:00");
    return Math.round((b - a) / 86400000);
  }

  function call(payload) { return callFn("case-flow", payload); }
  function callFn(name, payload) {
    payload.case = payload.case === undefined ? get("tls_case") : payload.case;
    payload.preview = window.TLS_VISIT.preview;
    payload.visit_id = window.TLS_VISIT.id;
    payload.language = lang();
    return fetch(cfg.functionsUrl + "/" + name, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); });
  }

  // Loads the language file whenever the language changes, then calls back.
  function onLanguage(cb) {
    document.addEventListener("tls:language", function (e) {
      var l = e.detail.lang;
      var getL = function (x) { return fetch("lang/" + x + ".json").then(function (r) { return r.json(); }); };
      var en = english ? Promise.resolve(english) : getL("en").then(function (d) { english = d; return d; });
      en.then(function () { return l === "en" ? english : getL(l); })
        .then(function (d) { dict = d; cb(l); });
    });
  }

  // Small element builder: el("p", {class: "lead"}, "text" or [children])
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] === true) n.setAttribute(k, "");
      else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    (Array.isArray(kids) ? kids : kids == null ? [] : [kids]).forEach(function (c) {
      if (c == null || c === false) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  // Rules files live on this site; "inherits" pulls in the parent file (same as the server).
  function loadRules(id) {
    return fetch("rules/" + id + ".json").then(function (r) { return r.json(); }).then(function (d) {
      var parent = d.inherits_from || d.inherits;
      if (!parent) return d;
      return loadRules(parent).then(function (p) { return Object.assign({}, p, d); });
    });
  }

  return {
    t: t, lang: lang, fmtDate: fmtDate, money: money, today: today, daysUntil: daysUntil,
    call: call, callFn: callFn, onLanguage: onLanguage, el: el, loadRules: loadRules,
    get: get, set: set, getJSON: getJSON, setJSON: setJSON,
    demo: params.get("demo") === "1"
  };
})();
