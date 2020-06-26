const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

const circulatonRepo = require("./repos/circulationRepo");
const data = require("./circulation.json");

const url = "mongodb://localhost:27017";
const dbName = "circulation";

async function main() {
  const client = new MongoClient(url);
  await client.connect();

  try {
    const results = await circulatonRepo.loadData(data);
    assert.equal(data.length, results.insertedCount);

    const getData = await circulatonRepo.get();
    assert.equal(data.length, getData.length);
  } catch (error) {
    console.log(error);
  } finally {
    //   console.log(results.insertedCount, results.ops);
    const admin = client.db(dbName).admin();
    //   console.log(await admin.serverStatus());
    await client.db(dbName).dropDatabase();
    console.log(await admin.listDatabases());

    client.close();
  }
}

main();
