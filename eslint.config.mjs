import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import nextPlugin from "@next/eslint-plugin-next"; // Import the plugin
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Base JS configurations
  js.configs.recommended,

  // TypeScript configurations
  ...tseslint.configs.recommended,

  // React configurations
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
  },

  // Next.js plugin configuration
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules, // Include core web vitals rules
    },
  },

  // Global settings
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly", // Define React for JSX transform
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // Project specific rules or overrides
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn", // Lenient 'any' for now
    },
  },
  {
    files: ["app/postcss.config.js"], // Target CommonJS config files
    languageOptions: {
      globals: {
        module: "writable", // Define module for CommonJS
        require: "readonly", // Define require for CommonJS if used
      },
    },
  },
  {
    files: ["tailwind.config.ts"], // Target tailwind.config.ts
    languageOptions: {
      globals: {
        require: "readonly", // Define require if it uses CJS
      },
    },
  },


  // Ignore build artifacts and node_modules
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
]);
