// Prepares files in the browser before upload:
// - photos are shrunk to max 2000px and saved as JPEG (smaller, cheaper to read, fixes iPhone HEIC where the browser can)
// - PDFs: the text is taken out (PDF.js) and each page is turned into a JPEG image
// If anything fails, the original file is sent unchanged.
(function () {
  var PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
  var MAX_SIDE = 2000, QUALITY = 0.85, MAX_PAGES = 10;
  var pdfReady = null;

  function loadPdfJs() {
    if (pdfReady) return pdfReady;
    pdfReady = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = PDFJS + "pdf.min.js";
      s.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js"; resolve(window.pdfjsLib); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return pdfReady;
  }

  function canvasToBlob(canvas) {
    return new Promise(function (res) { canvas.toBlob(res, "image/jpeg", QUALITY); });
  }

  function imageToJpeg(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
        var ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        canvasToBlob(c).then(function (b) { resolve(b ? [{ blob: b, name: file.name.replace(/\.\w+$/, "") + ".jpg" }] : [{ blob: file, name: file.name }]); });
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve([{ blob: file, name: file.name }]); };
      img.src = url;
    });
  }

  function pdfToPages(file, textParts) {
    return loadPdfJs().then(function (pdfjsLib) {
      return file.arrayBuffer().then(function (buf) { return pdfjsLib.getDocument({ data: buf }).promise; });
    }).then(function (pdf) {
      var out = [], n = Math.min(pdf.numPages, MAX_PAGES), chain = Promise.resolve();
      for (var i = 1; i <= n; i++) (function (i) {
        chain = chain.then(function () { return pdf.getPage(i); }).then(function (page) {
          return page.getTextContent().then(function (tc) {
            textParts.push("--- Page " + i + " ---\n" + tc.items.map(function (it) { return it.str + (it.hasEOL ? "\n" : " "); }).join(""));
            var v = page.getViewport({ scale: 1 });
            var scale = Math.min(2.5, MAX_SIDE / Math.max(v.width, v.height));
            var vp = page.getViewport({ scale: scale });
            var c = document.createElement("canvas"); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
            var ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
            return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () { return canvasToBlob(c); });
          }).then(function (b) { if (b) out.push({ blob: b, name: "page-" + i + ".jpg" }); });
        });
      })(i);
      return chain.then(function () { return out.length ? out : [{ blob: file, name: file.name }]; });
    }).catch(function () { return [{ blob: file, name: file.name }]; });
  }

  window.TLS_PREPARE = function (files) {
    var textParts = [], all = [], chain = Promise.resolve();
    files.forEach(function (f) {
      chain = chain.then(function () {
        var isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
        return (isPdf ? pdfToPages(f, textParts) : imageToJpeg(f)).then(function (items) { all = all.concat(items); });
      });
    });
    return chain.then(function () { return { files: all.slice(0, MAX_PAGES), text: textParts.join("\n").trim() }; });
  };
})();
