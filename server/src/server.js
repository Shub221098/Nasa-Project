const http = require("http");
require("dotenv").config();
const { mongoConnect } = require("./mongoose/mongo");
const app = require("./app");
const { loadPlanetsData } = require("./Models/planets.model");
const { loadLaunchData } = require("./Models/launches.model");
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
