const ClientError = require("../Commons/Exceptions/ClientError");
const NotFoundError = require("../Commons/Exceptions/NotFoundError");
const InvariantError = require("../Commons/Exceptions/InvariantError");
const redis = require("../Infrastructure/redis/redis");
const db = require("../models");
const axios = require('axios');

function calculateIndex(arr) {
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / 10;
}

async function refactorMe1(req, res, next) {
  try {
    const surveyData = (await db.sequelize.query('SELECT * FROM "surveys"'))[0];

    const totalIndex = surveyData.map(({ values }) => calculateIndex(values));

    res.status(200).send({
      statusCode: 200,
      success: true,
      data: totalIndex,
    });
  } catch (error) {
    next(error);
  }
}

async function refactoreMe2(req, res, next) {
  try {
    const { userId, values } = req.body

    if (!userId || !values) throw new ClientError('"userId" dan "values" harus diisi')

    const user = (await db.sequelize.query(`SELECT id FROM "users" WHERE id = ${userId}`))[0]
    if (user.length === 0) throw new NotFoundError('user tidak ditemukan')

    if (!Array.isArray(values)) throw new ClientError('"values" harus berupa array')

    const now = new Date()
    const dataToInsert = {
      values,
      createdAt: now,
      updatedAt: now,
      userId
    };
    await db.sequelize.query('INSERT INTO "surveys" ("values", "createdAt", "updatedAt", "userId") VALUES (ARRAY[:values], :createdAt, :updatedAt, :userId)', {
      replacements: dataToInsert
    })

    await db.sequelize.query('UPDATE "users" SET dosurvey=true')

    res.status(201).send({
      statusCode: 201,
      message: "Survey berhasil disimpan",
      success: true,
      data: dataToInsert,
    });
  } catch (error) {
    next(error);
  }
};

async function callmeWebSocket(ws) {
  try {
    const response = await axios.get('https://livethreatmap.radware.com/api/map/attacks?limit=10');
    const data = response.data;

    storeAttackData(data)
    ws.send(JSON.stringify(data));
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

async function storeAttackData(jsonData) {
  try {
    const valuesSql = []
    for (const data of jsonData) {
      for (const value of data) {
        const {
          sourceCountry,
          destinationCountry,
          millisecond,
          type,
          weight,
          attackTime
        } = value

        valuesSql.push(`('${sourceCountry}', '${destinationCountry}', ${millisecond}, '${type}', ${weight}, '${attackTime}')`)
      }
    }

    const query = `INSERT INTO "attack_data" ("sourceCountry", "destinationCountry", "millisecond", "type", "weight", "attackTime") VALUES ${valuesSql.join(', ')}`
    await db.sequelize.query(query)
  } catch (error) {
    console.error('Error insert attack data:', error.message);
  }
}

async function getData(req, res, next) {
  try {
    const { type } = req.query;
    let { position } = req.params;

    if (!type) throw new ClientError('query "type" harus diisi')
    switch (position) {
      case 'attack':
        position = 'sourceCountry'
        break;
      case 'attacker':
        position = 'destinationCountry'
        break;

      default:
        throw new ClientError('position hanya boleh "attack" atau "attacker"')
        break;
    }

    const query = `SELECT "${position}", COUNT(*) AS totalAttacks
      FROM attack_data
      WHERE type = :type
      GROUP BY "${position}"`;

    const redisKey = `${position}:${type}`
    let result = JSON.parse(await redis.getData(redisKey));
    if (result === null) {
      result = (await db.sequelize.query(query, {
        replacements: { type }
      }))[0]

      await redis.storeData(redisKey, JSON.stringify(result));
    }

    const response = {
      success: true,
      statusCode: 200,
      data: {
        label: result.map(item => item[position]),
        total: result.map(item => item['totalattacks'])
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  refactorMe1,
  refactoreMe2,
  callmeWebSocket,
  getData
}