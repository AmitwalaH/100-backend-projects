const app = require("./app");

if (require.main === module) {
  const { PORT } = require("./config");
  app.listen(PORT, () => {
    console.log(`Demo API running at http://localhost:${PORT}`);
  });
}

module.exports = app;
