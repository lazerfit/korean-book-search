import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
	{
		ignores: ['**/build/**', '**/dist/**', '**/*.mjs', '**/*.config.ts'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	jsxA11y.flatConfigs.recommended,
	prettierPluginRecommended,
	{
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				ecmaVersion: 'latest',
				projectService: true,
				tsconfigRootDir: __dirname,
				project: './tsconfig.json',
				sourceType: 'module',
			},
			globals: { ...globals.browser },
		},
	},
	{
		files: ['**/*.{js,mjs,cjs}', '**/*.test.{ts,js}'],
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		settings: {
			'import/extensions': ['.js', '.ts'],
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: './tsconfig.json',
				},
				node: {
					extensions: ['.js', '.ts'],
				},
			},
		},
		rules: {
			'prettier/prettier': [
				'error',
				{
					endOfLine: 'auto',
				},
			],
		},
	},
);
