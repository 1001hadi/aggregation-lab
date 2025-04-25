import express from "express";
import {
  getAvg,
  getLearnerAvg,
  getTotalLearnerAvg,
  getGradesStats,
  getGradesStatsByClass,
} from "../controllers/routesLogic.mjs";

const router = express.Router();

// // test routes
router.get("/", getAvg);
router.get("/grades/stats", getGradesStats);
router.get("/grades/stats/:id", getGradesStatsByClass);
router.get("/learner/:id/avg_class", getLearnerAvg);
router.get("/learner/:id/avg_lerner", getTotalLearnerAvg);

export default router;
