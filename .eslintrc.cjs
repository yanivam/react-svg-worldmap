module.exports = {
  root: true,
  extends: ["jc", "jc/typescript-typecheck"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./lib/tsconfig.eslint.json", "./website/tsconfig.json"],
  },
};
