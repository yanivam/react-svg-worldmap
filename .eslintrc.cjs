module.exports = {
  root: true,
  extends: ["jc", "jc/typescript-typecheck"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      "./lib/tsconfig.eslint.json",
      "./regions/tsconfig.json",
      "./website/tsconfig.json",
    ],
  },
};
