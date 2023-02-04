const launchesDatabase = require("./launches.mongo");
const axios = require("axios");
const planets = require("./planets.mongo");
const DEFAULT_FLIGHT_NUMBER = 100;
const launch = {
  flightNumber: 100, // flightNumber in spacex api
  mission: "Kepler Explanation X", // name in spacex api
  rocket: "Explorer IS1", // rocketname in spacex api
  launchDate: new Date("December 27, 2030"), // date_local in spacex api
  target: "Kepler-442 b", // Change this to see the affect of save Launch function that planet exist or not.  // not applicable in spacex api
  customers: ["ZTM", "NASA"], // payload.customers for each payload
  upcoming: true, // upcoming in spacex api
  success: true, // success in spacex api
};
// launches.set(launch.flightNumber, launch);
saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function populateLaunches() {
  console.log("Downloading launch data....");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payload = launchDoc["payloads"];
    const customers = payload.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("First launch found");
  } else {
    await populateLaunches();
  }
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase
    .findOne
    // findOne is the first document with latest flight Number
    ()
    .sort("-flightNumber"); // - is for sort max to min.

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}
async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({ flightNumber: 1 }) // flightNumber :1 is for ascending and -1 is for descending
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  // await launchesDatabase.updateOne(  // we are changing updateOne with findOneAndUpdate to remove set insert property so hacker can't get that property.
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  // This is used for checking that planet exists in out habitable planet list or not. if It is in out planet database then only allowed to add.
  if (!planet) {
    throw new Error("No Matching Planet found");
  }

  const latestFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    flightNumber: latestFlightNumber,
    upcoming: true,
    success: true,
    customers: ["Zero to Mastery", "NASA"],
  });
  await saveLaunch(newLaunch);
  return newLaunch;
}

// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       flightNumber: launch.flightNumber,
//       upcoming: true,
//       success: true,
//       customer: ["Zero to Mastery", "NASA"],
//     })
//   );
// }

async function abortLaunchWithId(launchid) {
  return await launchesDatabase.updateOne(
    {
      flightNumber: launchid,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  // const aborted = launches.get(launchid);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  // addNewLaunch,
  scheduleNewLaunch,
  abortLaunchWithId,
  loadLaunchData,
};
