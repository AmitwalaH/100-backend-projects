const app = require("./app");
const { PORT } = require("./config");

app.listen(PORT, () => {
  console.log(`Demo API running at http://localhost:${PORT}`);
});
