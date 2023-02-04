const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanets = (await getAllPlanets()).length;
        console.log(`${countPlanets} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  ); // this will give all planets list
}

async function savePlanet(planet) {
  try {
    // As it will give error sometimes so we use try and catch
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        // if the above condition checks that planet doesn't exist then only this will set the planet.
        keplerName: planet.kepler_name,
      },
      {
        // upsert will only update the planet with add only that planet insert + update;
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Count not save a planet ${err}`);
  }
}
module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
