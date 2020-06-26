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

    const filterData = await circulatonRepo.get({
      Newspaper: getData[4].Newspaper,
    });
    assert.deepEqual(filterData[0], getData[4]);

    const limitData = await circulatonRepo.get({}, 3);
    assert.equal(limitData.length, 3);
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
