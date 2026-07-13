import express from "express";
import { initConnection } from "./db/mongoose";
import cors from "cors";
import Util from "./utils/util";
import morgan from "morgan";
import chalk from "chalk";
import http from "http";
import dotenv from "dotenv";

import availabilityRoutes from "./routes/availabilityRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        credentials: true,
    })
);
app.use(morgan("dev"));

app.use(
    express.urlencoded({
        extended: false,
        limit: "5gb",
        parameterLimit: 50000,
    }),
);
app.use(express.json({ limit: "5gb" }));

// Register routes statically
app.use(availabilityRoutes);
app.use(bookingRoutes);
app.use(userRoutes);

app.get("/", (req, res) => {
    res.sendStatus(200);
});

initConnection(() => {
    const httpServer = http.createServer(app);
    const port = process.env.PORT || 3000;

    httpServer.listen(port, () => {
        console.log(`Server is running on ${chalk.cyan.italic.underline(Util.getBaseURL())}`);
    });
});
