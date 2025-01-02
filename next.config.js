/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    typescript: {
        // Danger: this will ignore ALL type errors, not just the one above
        ignoreBuildErrors: true,
    },
};

export default config;
