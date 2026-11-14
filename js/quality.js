/* Real photo checks for the guided upload (Gap 2): too dark, blurry, or tilted/cut off.
   Runs in the browser on a small copy of the photo – no server needed. */
window.Quality = (function () {
  function loadImage(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  }
  function fileToDataURL(file) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
  }
  // Shrink to keep localStorage small
  async function shrink(src, max = 900, q = 0.7) {
    const img = await loadImage(src);
    const s = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', q);
  }
  async function analyse(src) {
    const img = await loadImage(src);
    const W = 240, H = Math.round(240 * img.height / img.width) || 240;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, W, H);
    const d = ctx.getImageData(0, 0, W, H).data;
    const g = new Float32Array(W * H); let sum = 0;
    for (let i = 0; i < W * H; i++) { const v = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; g[i] = v; sum += v; }
    const brightness = sum / (W * H);
    // Variance of the Laplacian: low = blurry
    let lsum = 0, lsq = 0, n = 0;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x; const l = g[i - W] + g[i + W] + g[i - 1] + g[i + 1] - 4 * g[i];
      lsum += l; lsq += l * l; n++;
    }
    const sharpness = lsq / n - (lsum / n) ** 2;
    let problem = null;
    if (brightness < 70) problem = 'dark';
    else if (sharpness < 25) problem = 'blurry';
    return { brightness: Math.round(brightness), sharpness: Math.round(sharpness), ok: !problem, problem };
  }
  // Demo page: a photographed exam sheet drawn on a canvas (used when no camera is available)
  async function samplePage(page, blurry) {
    try { await document.fonts.load('28px "Patrick Hand"'); } catch (e) { /* fallback font */ }
    const qs = DATA.exam.questions.filter(q => q.page === page);
    const c = document.createElement('canvas'); c.width = 900; c.height = 1200;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#d9cfbf'; ctx.fillRect(0, 0, 900, 1200);
    ctx.save(); ctx.translate(450, 600); ctx.rotate(-0.012); ctx.translate(-450, -600);
    ctx.fillStyle = '#fffdf8'; ctx.fillRect(50, 40, 800, 1120);
    ctx.strokeStyle = '#cfe0f0'; ctx.lineWidth = 2;
    for (let y = 200; y < 1140; y += 48) { ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(830, y); ctx.stroke(); }
    ctx.fillStyle = '#1d2433'; ctx.font = '26px Lexend, sans-serif';
    ctx.fillText('Name: Omar     Class: 4B', 90, 100);
    ctx.fillText('Science – Animals quiz · page ' + page, 90, 145);
    let y = 230;
    for (const q of qs) {
      ctx.fillStyle = '#1d2433'; ctx.font = '24px Lexend, sans-serif';
      ctx.fillText(q.n + '. ' + q.q, 90, y);
      ctx.fillStyle = '#2b4aa0'; ctx.font = '34px "Patrick Hand", cursive';
      if (q.n === 7) { ctx.fillText('water', 120, y + 48); ctx.fillText('and food', 120, y + 96); y += 48; }
      else ctx.fillText(q.n === 6 ? 'in ponds' : q.wrote, 120, y + 48);
      y += 140;
    }
    ctx.restore();
    if (blurry) {
      const b = document.createElement('canvas'); b.width = 900; b.height = 1200;
      const bx = b.getContext('2d'); bx.filter = 'blur(9px)'; bx.drawImage(c, 0, 0); return b.toDataURL('image/jpeg', 0.7);
    }
    return c.toDataURL('image/jpeg', 0.75);
  }
  return { fileToDataURL, shrink, analyse, samplePage };
})();
