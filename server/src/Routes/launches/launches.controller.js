const {
  getAllLaunches,
  // addNewLaunch,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchWithId,
} = require("../../Models/launches.model");

const { getPagination } = require("../../mongoose/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}
async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  console.log(launch);
  if (
    !launch.mission ||
    !launch.launchDate ||
    !launch.rocket ||
    !launch.target
  ) {
    return res.status(400).json({
      message: "Missing Required Launch Property",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      message: "Invalid Launch Date",
    });
  }
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchid = Number(req.params.id);
  const existLaunch = await existsLaunchWithId(launchid);
  if (!existLaunch) {
    return res.status(404).json({
      message: "Launch not found",
    });
  }
  const aborted = await abortLaunchWithId(launchid);
  if (!aborted) {
    return res.status(404).json({
      message: "Launch not aborted",
    });
  }
  return res.status(200).json({
    ok: true,
  });
}
module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
