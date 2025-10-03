/* Pixel Forge root ESLint config */
module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "import"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:import/recommended",
		"plugin:import/typescript",
		"eslint-config-prettier"
	],
	env: { es2022: true, node: true },
	settings: {
		"import/resolver": { node: { extensions: [".ts", ".tsx", ".js", ".cjs", ".mjs"] } }
	},
	rules: {
		"import/no-default-export": "error",
		"@typescript-eslint/consistent-type-imports": "error"
	},
	ignorePatterns: [
		"dist/**",
		"**/*.d.ts",
		"node_modules/**",
		".turbo/**",
		"coverage/**"
	]
};