const { MongoClient, ObjectID } = require("mongodb");

function circulationRepo() {
  const url = "mongodb://localhost:27017";
  const dbName = "circulation";

  function get(query, limit) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        let items = db.collection("newspapers").find(query);

        if (limit > 0) {
          items = items.limit(limit);
        }

        resolve(await items.toArray());
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }
  function getById(id) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);
        const item = await db
          .collection("newspapers")
          .findOne({ _id: ObjectID(id) });
        resolve(item);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }
  function add(item) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);
        const addedItem = await db.collection("newspapers").insertOne(item);

        resolve(addedItem.ops[0]);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }
  function update(id, newItem) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);
        const updatedItem = await db
          .collection("newspapers")
          .findOneAndReplace({ _id: ObjectID(id) }, newItem, {
            returnOriginal: false,
          });

        resolve(updatedItem.value);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }
  function remove(id) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        const removed = await db
          .collection("newspapers")
          .deleteOne({ _id: ObjectID(id) });
        resolve(removed.deletedCount === 1);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }
  function loadData(data) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        const results = await db.collection("newspapers").insertMany(data);
        resolve(results);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }
  function avarageFinalist() {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        const avarage = await db
          .collection("newspapers")
          .aggregate([
            {
              $group: {
                _id: null,
                avgFinal: {
                  $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014",
                },
              },
            },
          ])
          .toArray();

        resolve(avarage[0].avgFinal);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }
  function avarageFinalistByChange() {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        const avarage = await db
          .collection("newspapers")
          //$project allows you to modify the content of an object
          .aggregate([
            {
              $project: {
                Newspaper: 1,
                "Pulitzer Prize Winners and Finalists, 1990-2014": 1,
                "Change in Daily Circulation, 2004-2013": 1,
                overallChange: {
                  $cond: {
                    if: {
                      $gte: ["$Change in Daily Circulation, 2004-2013", 0],
                    },
                    then: "positive",
                    else: "negative",
                  },
                },
              },
            },
            {
              $group: {
                _id: "$overallChange",
                avgFinal: {
                  $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014",
                },
              },
            },
          ])
          .toArray();

        resolve(avarage);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }
  return {
    loadData,
    get,
    getById,
    add,
    update,
    remove,
    avarageFinalist,
    avarageFinalistByChange,
  };
}

module.exports = circulationRepo();
