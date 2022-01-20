require("dotenv").config();

const fs = require("fs");
const mustache = require("mustache");
const { MongoClient } = require("mongodb");

const DB_URL = process.env.MONGO_URL;
const SESSION_NAME = "simulacro2022";
const atFile = "./templates/admin";
const utFile = "./templates/user";
const rootTestFolder = "./tests";
const testFolder = rootTestFolder + "/" + SESSION_NAME;

async function pullSessionFromDatabase(session_name) {
  const client = new MongoClient(DB_URL);

  try {
    await client.connect();

    const result = await client
      .db("myFirstDatabase")
      .collection("sessions")
      .findOne({ name: session_name });
    return result;
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

async function pullUsersFromDatabase(session_name) {
  const client = new MongoClient(DB_URL);

  try {
    await client.connect();

    const result = await client
      .db("myFirstDatabase")
      .collection("users")
      .find({ subject: session_name })
      .project({ _id: 0, code: 1 })
      .toArray();

    return result;
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

async function formatMongoDBData(session_name) {
  try {
    const session = await pullSessionFromDatabase(session_name);
    const users = await pullUsersFromDatabase(session_name);

    const formatedData = {
      token: session.tokens[0],
      users: users.map((user) => parseInt(user.code)),
    };
    return formatedData;
  } catch (error) {
    console.error(error);
  }
}

formatMongoDBData(SESSION_NAME)
  .then((data) => {
    console.log(data);
  })
  .catch((error) => console.error(error));

// if (!fs.existsSync(testFolder)) {
//   fs.mkdirSync(testFolder);
// } else {
//   console.error(`Output test directory <${testFolder}> already exists.`);
//   process.exit(1);
// }

// var adminTemplate = null;
// try {
//   adminTemplate = fs.readFileSync(atFile, "utf8");
// } catch (err) {
//   console.error(`Error reading admin template <${atFile}>:` + err);
//   process.exit(1);
// }

// var userTemplate = null;
// try {
//   userTemplate = fs.readFileSync(utFile, "utf8");
// } catch (err) {
//   console.error(`Error reading user template <${utFile}>:` + err);
//   process.exit(1);
// }

// const adminTestFile = testFolder + "/admin.spec.js";
// const adminTest = mustache.render(adminTemplate, { SESSION_NAME });

// try {
//   fs.writeFileSync(adminTestFile, adminTest);
// } catch (err) {
//   console.error(`Error writing admin test <${adminTestFile}>:` + err);
//   process.exit(1);
// }

// CODE_LIST.forEach((code) => {
//   const userTestFile = testFolder + "/" + code + ".spec.js";
//   const userTest = mustache.render(userTemplate, { code, token });

//   try {
//     fs.writeFileSync(userTestFile, userTest);
//   } catch (err) {
//     console.error(`Error writing user test <${userTestFile}>:` + err);
//     process.exit(1);
//   }
// });

// console.log(
//   `Test with ${CODE_LIST.length} users for session <${SESSION_NAME}> generated at:\n  <${testFolder}>`
// );
// console.log("\nRun it with the following command:");
// console.log(`npx playwright test ${testFolder}`);
