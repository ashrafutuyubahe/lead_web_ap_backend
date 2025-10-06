  const express = require("express");
  const http = require("http");
  const socketIo = require("socket.io");
  const dotenv = require("dotenv");
  dotenv.config();
  const PORT = process.env.PORT || 3000;
  const connectDB = require("./config/db");
  const authRoutes = require("./routes/authRoute");
  const attendendenceRoutes= require("./routes/attendenceRoutes");
  const monitorAttendance= require("./utils/monitorAttendance");
  const memberRoutes= require("./routes/memberRoutes")
  const logger = require("./utils/logger");
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger'); 
  const cors= require("cors");


  




  const app = express();

  app.use(express.json());

  const server = http.createServer(app);

  app.use(cors({
    credentials: true,
    origin: "*",
    methods:"GET,POST,PUT,DELETE"
  }));



  // const io = socketIo(server, {
  //   cors: {
  //     origin: "*",
  //   },
  // });

  //api section
  app.use("/choir_manager/v1/auth", authRoutes);
  app.use("/choir_manager/v1/attendaces",attendendenceRoutes);
  app.use("/choir_manager/v1/member",memberRoutes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // setInterval(() => {
  //   monitorAttendance(io);
  // }, 300000);



  server.listen(PORT, () => {
    logger.info(`WebSocket  and server are both running on port ${PORT}...`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
