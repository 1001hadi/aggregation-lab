import db from "../db/connection.mjs";

export async function getAvg(req, res) {
  let collection = await db.collection("grades");
  let result = await collection
    .aggregate(
      [
        {
          $project: {
            _id: 0,
            class_id: 1,
            learner_id: 1,
            avg: { $avg: "$scores.score" },
          },
        },
      ],
      { maxTimeMS: 60000, allowDiskUse: true }
    )
    .limit(10)
    .toArray();
  res.json(result);
}

// step 3 create a GET route at /grades/stats
export async function getGradeStats(req, res) {
  let collection = await db.collection("grades");
  try {
    const stats = await collection
      .aggregate([
        // calculate the weighted average for each learner
        {
          $unwind: "$scores",
        },
        {
          $group: {
            _id: "$learner_id",
            weightedAvg: {
              $sum: { $multiply: ["$scores.score", "$scores.weight"] },
            },
            totalWeight: { $sum: "$scores.weight" },
          },
        },
        {
          $project: {
            _id: 0,
            learner_id: "$_id",
            weightedAvg: {
              $cond: [
                { $eq: ["$totalWeight", 0] },
                0,
                { $divide: ["$weightedAvg", "$totalWeight"] },
              ],
            },
          },
        },
        // count the number of learners with an average above 70
        {
          $group: {
            _id: null,
            above70Count: {
              $sum: {
                $cond: [{ $gt: ["$weightedAvg", 70] }, 1, 0],
              },
            },
            totalLearners: { $sum: 1 },
          },
        },
        // calculate the percentage
        {
          $project: {
            _id: 0,
            above70Count: 1,
            totalLearners: 1,
            percentageAbove70: {
              $cond: [
                { $eq: ["$totalLearners", 0] },
                0,
                {
                  $multiply: [
                    { $divide: ["$above70Count", "$totalLearners"] },
                    100,
                  ],
                },
              ],
            },
          },
        },
      ])
      .toArray();

    if (stats.length > 0) {
      res.json(stats[0]);
    } else {
      res.json({ above70Count: 0, totalLearners: 0, percentageAbove70: 0 });
    }
  } catch (err) {
    console.error("Error getting grade:", err);
  }
}

// sandBox get learner average solution
export async function getLearnerAvg(req, res) {
  let collection = await db.collection("grades");

  let result = await collection
    .aggregate([
      {
        $match: { learner_id: Number(req.params.id) },
      },
      {
        $unwind: { path: "$scores" },
      },
      {
        $group: {
          _id: "$class_id",
          quiz: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "quiz"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          exam: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "exam"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          homework: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "homework"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          class_id: "$_id",
          avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
        },
      },
    ])
    .toArray();

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
}

//// single avg for 1 learner
export async function getTotalLearnerAvg(req, res) {
  let collection = await db.collection("grades");

  let result = await collection
    .aggregate([
      {
        $match: { learner_id: Number(req.params.id) },
      },
      {
        $unwind: { path: "$scores" },
      },
      {
        $group: {
          _id: "$class_id",
          quiz: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "quiz"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          exam: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "exam"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          homework: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "homework"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          class_id: "$_id",
          avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAvg: { $avg: "$avg" },
        },
      },
    ])
    .toArray();

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
}

// export default { getAvg, getLearnerAvg };
