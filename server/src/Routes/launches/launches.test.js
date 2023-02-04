// Testing our Api
// Supertest provides some methods and used for making request to API for testing purposes.
const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../mongoose/mongo");

describe("launches API", () => {
  // connect with mongodb
  beforeAll(async () => {
    await mongoConnect();
  });
  afterAll(async () => {
    await mongoDisconnect();
  });
  // Testing End-points with supertest Get Method
  describe("Test Get / launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app).get("/v1/launches");

      // use instead of of writing  expect(response.statusCode).toBe(200) like long syntax;
    });
  });
});

// Testing End-Points with supertest POST Method
describe("Test POST / launch", () => {
  const completeLaunchDate = {
    mission: "USS Enterprise",
    rocket: "Tesla",
    target: "Kepler-1652 b",
    launchDate: "2020-01-01",
  };
  const completeLaunchWithoutDate = {
    mission: "USS Enterprise",
    rocket: "Tesla",
    target: "Kepler-1652 b",
  };

  const completeLaunchInvalidDate = {
    mission: "USS Enterprise",
    rocket: "Tesla",
    target: "Kepler-1652 b",
    launchDate: "zoot",
  };
  // test("It should respond with 201 success created", async () => {
  //   const response = await request(app)
  //     .post("/v1/launches")
  //     .send(completeLaunchDate)
  //     .expect("Content-type", /json/)
  //     .expect(201);

  //   const requestDate = new Date(completeLaunchDate.launchDate).valueOf();
  //   const responseDate = new Date(response.body.launchDate).valueOf();
  //   console.log(responseDate);
  //   expect(responseDate).toBe(requestDate);
  //   expect(response.body).toMatchObject(completeLaunchWithoutDate);
  // });
  test("It should respond with 201 created", async () => {
    const response = await request(app)
      .post("/v1/launches")
      .send(completeLaunchData)
      .expect("Content-Type", /json/)
      .expect(201);

    const requestDate = new Date(completeLaunchData.launchDate).valueOf();
    const responseDate = new Date(response.body.launchDate).valueOf();
    expect(responseDate).toBe(requestDate);

    expect(response.body).toMatchObject(launchDataWithoutDate);
  });

  test("It should catch missing required properties", async () => {
    const response = await request(app)
      .post("/v1/launches")
      .send(completeLaunchWithoutDate)
      .expect("content-type", /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      message: "Missing Required Launch Property",
    });
  });

  test("It should catch invalid dates", async () => {
    const response = await request(app)
      .post("/v1/launches")
      .send(completeLaunchInvalidDate)
      .expect("content-type", /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      message: "Invalid Launch Date",
    });
  });
});
