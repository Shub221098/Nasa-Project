const API_URL = "http://localhost:8000/v1";
async function httpGetPlanets() {
  try {
    const res = await fetch(`${API_URL}/planets`);
    return await res.json();
  } catch (err) {
    console.log(err);
  }
}

async function httpGetLaunches() {
  // TODO: Once API is ready.
  try {
    const res = await fetch(`${API_URL}/launches`);
    const fetchLaunches = await res.json();
    return fetchLaunches.sort((a, b) => a.flightNumber - b.flightNumber);
  } catch (err) {
    console.log(err);
  }
  // Load launches, sort by flight number, a nd return as JSON.
}

async function httpSubmitLaunch(launch) {
  // TODO: Once API is ready.
  try {
    return await fetch(`${API_URL}/launches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(launch),
    });
  } catch (err) {
    return {
      ok: false,
    };
  }
  // Submit given launch data to launch system.
}

async function httpAbortLaunch(id) {
  // TODO: Once API is ready.
  try {
    return await fetch(`${API_URL}/launches/${id}`, {
      method: "DELETE",
    });
  } catch (err) {
    return {
      ok: false,
    };
  }
  // Delete launch with given ID.
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
