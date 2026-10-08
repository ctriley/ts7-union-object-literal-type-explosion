import { createPlugin } from "./plugin";

const p0 = createPlugin("p0");
const p1 = createPlugin("p1");
const p2 = createPlugin("p2");
const p3 = createPlugin("p3");
const p4 = createPlugin("p4");
const p5 = createPlugin("p5");
const p6 = createPlugin("p6");
const p7 = createPlugin("p7");
const p8 = createPlugin("p8");
const p9 = createPlugin("p9");
const p10 = createPlugin("p10");
const p11 = createPlugin("p11");
const p12 = createPlugin("p12");
const p13 = createPlugin("p13");
const p14 = createPlugin("p14");
const p15 = createPlugin("p15");

// `configure` called on a union of 16 plugin types, with an object-literal argument.
export const configured = [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15].map((plugin) => plugin.configure({}));
