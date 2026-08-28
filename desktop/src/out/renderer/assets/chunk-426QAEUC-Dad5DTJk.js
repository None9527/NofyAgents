import { r as e, t } from "./src-D6nttw3b.js";
import { b as n } from "./chunk-ICPOFSXX-C_rmVRO5.js";
var r = e((e) => {
  let { securityLevel: r } = n(),
    i = t(`body`);
  return (
    r === `sandbox` && (i = t((t(`#i${e}`).node()?.contentDocument ?? document).body)),
    i.select(`#${e}`)
  );
}, `selectSvgElement`);
export { r as t };
