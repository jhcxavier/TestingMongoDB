const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

const circulatonRepo = require("./repos/circulationRepo");
const data = require("./circulation.json");
const circulationRepo = require("./repos/circulationRepo");

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

    const id = getData[4]._id.toString();
    const byId = await circulatonRepo.getById(id);
    assert.deepEqual(byId, getData[4]);

    const newItem = {
      Newspaper: "New Paper",
      "Daily Circulation, 2004": 100,
      "Daily Circulation, 2013": 100,
      "Change in Daily Circulation, 2004-2013": 1,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 0,
    };
    const addedItem = await circulatonRepo.add(newItem);
    assert(addedItem._id);
    const addedItemQUery = await circulatonRepo.getById(addedItem._id);
    assert.deepEqual(addedItemQUery, newItem);

    const updatedItem = await circulatonRepo.update(addedItem._id, {
      Newspaper: "My new Paper",
      "Daily Circulation, 2004": 100,
      "Daily Circulation, 2013": 100,
      "Change in Daily Circulation, 2004-2013": 1,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 0,
    });
    assert.equal(updatedItem.Newspaper, "My new Paper");

    const newAddedItemQuery = await circulationRepo.getById(addedItem._id);
    assert.equal(newAddedItemQuery.Newspaper, "My new Paper");

    const removed = await circulationRepo.remove(addedItem._id);
    assert(removed);
    const deletedItem = await circulatonRepo.getById(addedItem._id);
    assert.equal(deletedItem, null);

    const avgFinalists = await circulationRepo.avarageFinalist();
    console.log("avarage finalist is: ", avgFinalists);
  } catch (error) {
    console.log(error);
  } finally {
    //   console.log(results.insertedCount, results.ops);
    const admin = client.db(dbName).admin();
    //   console.log(await admin.serverStatus());
    // await client.db(dbName).dropDatabase();
    console.log(await admin.listDatabases());

    client.close();
  }
}

main();
