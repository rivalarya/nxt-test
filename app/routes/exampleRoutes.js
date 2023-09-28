const { exampleMiddleware } = require("../middleware");
const exampleController = require("../controllers/exampleController");
const { verifyJWT, isAdmin } = require("../middleware/exampleMiddleware");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  const router = require("express").Router();

  router.get(
    "/",
    [verifyJWT],
    exampleController.refactorMe1
  );

  router.get(
    "/:position",
    [verifyJWT],
    exampleController.getData
  );

  router.post(
    "/",
    [isAdmin],
    exampleController.refactoreMe2
  );

  app.use("/api/data", router);
  app.use((err, req, res, next) => {
    console.error('Uncaught Exception:', err);
    const statusCode = err.statusCode || 500
    return res.status(statusCode)
      .json({ statusCode, success: false, data: {}, message: err.message })
  });

  app.ws('/data', (ws) => {
    console.log('Client connected');

    exampleController.callmeWebSocket(ws);

    const fetchInterval = 3 * 60 * 1000; // Dalam milidetik
    const dataFetchInterval = setInterval(() => {
      exampleController.callmeWebSocket(ws);
    }, fetchInterval);

    ws.on('close', () => {
      console.log('Client disconnected');
      clearInterval(dataFetchInterval);
    });
  });
};