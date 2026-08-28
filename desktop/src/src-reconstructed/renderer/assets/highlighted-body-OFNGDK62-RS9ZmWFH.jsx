import { s as e } from "./chunk-Cq_f4orQ.js";
import { t } from "./react-BQLj9xdT.js";
import { t as n } from "./jsx-runtime-B5yMD3-t.js";
import { i as r, n as i, t as a } from "./chunk-BO2N2NFS-CSNAeaxF.js";
var o = e(t(), 1),
  s = n(),
  c = ({
    code: e,
    language: t,
    raw: n,
    className: c,
    startLine: l,
    lineNumbers: u,
    ...d
  }) => {
    let {
        shikiTheme: f
      } = (0, o.useContext)(r),
      p = i(),
      [m, h] = (0, o.useState)(n);
    return (0, o.useEffect)(() => {
      if (!p) {
        h(n);
        return;
      }
      let r = p.highlight({
        code: e,
        language: t,
        themes: f
      }, e => {
        h(e);
      });
      r && h(r);
    }, [e, t, f, p, n]), (0, s.jsx)(a, {
      className: c,
      language: t,
      lineNumbers: u,
      result: m,
      startLine: l,
      ...d
    });
  };
export { c as HighlightedCodeBlockBody };
