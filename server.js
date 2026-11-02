import express from "express";
import "dotenv/config";
import handleError from "./middleware/errorMiddleware.js";
import sessionMiddleware from "./middleware/sessionMiddleware.js";
import userRoutes from "./routes/userRoute.js";
import taskRoute from "./routes/taskRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(sessionMiddleware);
app.use("/user", userRoutes);
app.use("/task", taskRoute);
app.use(handleError);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
