module.exports = {
  root: true,
  extends: ["jc", "jc/typescript-typecheck"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./*/tsconfig.json"],
  },
};
