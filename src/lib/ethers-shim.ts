// Ethers v6 shim to satisfy libraries that expect a named `utils` export
// from `ethers` (v5-style), while still using v6 APIs in our app.

import * as ethersAll from "ethers";

// Re-export everything from ethers v6 so regular imports keep working.
export * from "ethers";

// Provide a `utils` namespace that points to the full ethers module.
// This is enough for many older libraries that just expect `ethers.utils.*`.
// eslint-disable-next-line import/no-unused-modules
export const utils = ethersAll;


