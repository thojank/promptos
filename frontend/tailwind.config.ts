import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [
    daisyui({
      themes: ["light --default", "dark --prefersdark", "valentine"],
    }),
  ],
};

export default config;
