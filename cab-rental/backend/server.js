require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const bootstrap = require("./src/config/bootstrap");
const initSockets = require("./src/sockets"); 

(async () => {
  await bootstrap();

  const server = http.createServer(app);
  initSockets(server); 

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})();
