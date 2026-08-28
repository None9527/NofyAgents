var e = [`.xlsx`, `.xlsm`, `.xls`],
  t = [`.docx`],
  n = [`.doc`];
function r(r) {
  if (!r) return null;
  let i = r.trim().toLowerCase();
  return t.some(e => i.endsWith(e)) ? `docx` : n.some(e => i.endsWith(e)) ? `doc` : e.some(e => i.endsWith(e)) ? `excel` : null;
}
function i({
  availableWidth: e,
  naturalHeight: t,
  naturalWidth: n
}) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || !Number.isFinite(n) || e <= 0 || t <= 0 || n <= 0) return null;
  let r = Math.min(1, e / n);
  return {
    scale: r,
    width: n * r,
    height: t * r
  };
}
function a(e) {
  let t = atob(e),
    n = new Uint8Array(t.length);
  for (let e = 0; e < t.length; e += 1) n[e] = t.charCodeAt(e);
  return n.buffer;
}
export { a as n, r, i as t };
