// imports
require("dotenv").config();
const fs = require("fs");
const mustache = require("mustache");
const { getMongoDBData } = require("./utils/db");

// variables
const SESSION_NAME = "simulacro2022";
const atFile = "./templates/admin";
const utFile = "./templates/user";
const rootTestFolder = "./tests";
const testFolder = rootTestFolder + "/" + SESSION_NAME;

// declare functions
function createTestFolder() {
  if (!fs.existsSync(testFolder)) {
    fs.mkdirSync(testFolder);
  } else {
    console.error(`Output test directory <${testFolder}> already exists.`);
    process.exit(1);
  }
}

function generateAdminTemplate() {
  let adminTemplate = null;
  try {
    adminTemplate = fs.readFileSync(atFile, "utf8");
  } catch (err) {
    console.error(`Error reading admin template <${atFile}>: ${err}`);
    process.exit(1);
  }

  const adminTestFile = testFolder + "/admin.spec.js";
  const adminTest = mustache.render(adminTemplate, { session: SESSION_NAME });

  try {
    fs.writeFileSync(adminTestFile, adminTest);
  } catch (err) {
    console.error(`Error writing admin test <${adminTestFile}>: ${err}`);
    process.exit(1);
  }
}

function generateUserTemplates(session_users, session_token) {
  let userTemplate = null;
  try {
    userTemplate = fs.readFileSync(utFile, "utf8");
  } catch (err) {
    console.error(`Error reading user template <${utFile}>: ${err}`);
    process.exit(1);
  }

  session_users.forEach((code) => {
    const userTestFile = testFolder + "/" + code + ".spec.js";
    const userTest = mustache.render(userTemplate, {
      code,
      token: session_token,
    });

    try {
      fs.writeFileSync(userTestFile, userTest);
    } catch (err) {
      console.error(`Error writing user test <${userTestFile}>: ${err}`);
      process.exit(1);
    }
  });
}

function printResults(userLength) {
  console.log(
    `Test with ${userLength} users for session <${SESSION_NAME}> generated at:\n  <${testFolder}>`
  );
  console.log("\nRun it with the following command:");
  console.log(`npx playwright test ${testFolder}`);
}

// execute functions
createTestFolder();
generateAdminTemplate();
getMongoDBData(SESSION_NAME)
  .then(({ users, token }) => {
    generateUserTemplates(users, token);
    printResults(users.length);
  })
  .catch((error) => console.error(error));
