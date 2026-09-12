import "@testing-library/jest-dom";

/* jsdom is not a browser and jest-environment-jsdom does not pass Node's
   globals through, so a handful of things every modern library assumes are
   simply absent. Importing the Firebase SDK touches fetch at module load,
   which is why a component test with no network in it can fail to even parse
   with "fetch is not defined". */

import { TextDecoder, TextEncoder } from "node:util";

if (typeof globalThis.TextEncoder === "undefined") {
  Object.assign(globalThis, { TextEncoder, TextDecoder });
}

/* Deliberately a rejecting stub rather than a working fetch. A unit test that
   really exercises the network should say so by mocking it, and this message
   is what tells you to. It exists only so that importing a module which
   references fetch does not blow up before the test runs. */
if (typeof globalThis.fetch === "undefined") {
  globalThis.fetch = (() =>
    Promise.reject(
      new Error("fetch is not available in tests — mock it in the test that needs it"),
    )) as unknown as typeof globalThis.fetch;
}
