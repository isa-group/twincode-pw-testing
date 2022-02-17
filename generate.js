const fs = require("fs");
const mustache = require("mustache");
const { getMongoDBData } = require("./utils/db");

const SESSION_NAME = "simulacro2022";
const MAX_NUMBER_OF_USERS = 2;

const atFile = "./templates/admin";
const utFile = "./templates/user";
const rootTestFolder = "./tests";
const testFolder = rootTestFolder + "/" + SESSION_NAME;

function createTestFolders() {
  if (!fs.existsSync(rootTestFolder)) {
    fs.mkdirSync(rootTestFolder);
  }

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

function generateUserTemplates(session_users, session_token, session_times) {
  let userTemplate = null;
  try {
    userTemplate = fs.readFileSync(utFile, "utf8");
  } catch (err) {
    console.error(`Error reading user template <${utFile}>: ${err}`);
    process.exit(1);
  }

  if (MAX_NUMBER_OF_USERS < 2 || MAX_NUMBER_OF_USERS > session_users.length) {
    console.error(
      `Max number of users must be between 2 and ${session_users.length}`
    );
    process.exit(1);
  }

  session_users.every((code, index) => {
    if (index === MAX_NUMBER_OF_USERS) {
      return false;
    }

    const userTestFile = testFolder + "/" + code + ".spec.js";
    console.log(session_times);
    const userTest = mustache.render(userTemplate, {
      code,
      token: session_token,
      times: session_times,
    });

    try {
      fs.writeFileSync(userTestFile, userTest);
      return true;
    } catch (err) {
      console.error(`Error writing user test <${userTestFile}>: ${err}`);
      process.exit(1);
    }
  });

  printResults(MAX_NUMBER_OF_USERS);
}

function printResults(userLength) {
  console.log(
    `Test with ${userLength} users for session <${SESSION_NAME}> generated at:\n  <${testFolder}>`
  );
  console.log("\nRun it with the following command:");
  console.log(`npx playwright test ${testFolder}`);
}

createTestFolders();
generateAdminTemplate();
getMongoDBData(SESSION_NAME)
  .then(({ users, token, times }) => {
    generateUserTemplates(users, token, times);
  })
  .catch((error) => console.error(error));
