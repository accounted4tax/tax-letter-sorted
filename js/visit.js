// Anonymous visit number for the funnel counts (not linked to any person).
// Also keeps a private preview code (?preview=...) for testing before launch.
(function () {
  function get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  var id = get("tls_visit");
  if (!id) {
    id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16); });
    set("tls_visit", id);
  }
  var p = new URLSearchParams(location.search).get("preview");
  if (p) set("tls_preview", p);
  window.TLS_VISIT = { id: id, preview: get("tls_preview") || p || "" };
})();
