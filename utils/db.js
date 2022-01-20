const { MongoClient } = require("mongodb");
const DB_URL = process.env.MONGO_URL;
const DB_NAME = "flockjs";
const mongodbClient = new MongoClient(DB_URL);

async function pullSessionFromDatabase(session_name) {
  try {
    await mongodbClient.connect();

    const result = await mongodbClient
      .db(DB_NAME)
      .collection("sessions")
      .findOne({ name: session_name });
    return result;
  } catch (error) {
    console.error(error);
  } finally {
    await mongodbClient.close();
  }
}

async function pullUsersFromDatabase(session_name) {
  try {
    await mongodbClient.connect();

    const result = await mongodbClient
      .db(DB_NAME)
      .collection("users")
      .find({ subject: session_name })
      .project({ _id: 0, code: 1 })
      .toArray();

    return result;
  } catch (error) {
    console.error(error);
  } finally {
    await mongodbClient.close();
  }
}

async function getMongoDBData(session_name) {
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

module.exports.getMongoDBData = getMongoDBData;
