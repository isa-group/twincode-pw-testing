const { MongoClient } = require("mongodb");
const DB_URL = process.env.MONGO_URL;

async function pullSessionFromDatabase(session_name) {
  const client = new MongoClient(DB_URL);

  try {
    await client.connect();

    const result = await client
      .db("myFirstDatabase") //TODO: replace database name
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
