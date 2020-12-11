const express = require("express");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const { readDB, writeDB } = require("../../lib/utilities");
const { EROFS } = require("constants");
const { read } = require("fs-extra");

const router = express.Router();

const reviewsFilePath = path.join(__dirname, "reviews.json");

router.get("/", async (req, res, next) => {
  try {
    const reviewsDB = await readDB(reviewsFilePath);

    res.status(200).send(reviewsDB);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const reviewsDB = await readDB(reviewsFilePath);
    const review = reviewsDB.find((review) => review._id === req.params.id);

    if (!review) {
      const err = new Error();
      err.message = "ID not found";
      err.httpStatusCode = 404;
      next(err);
    } else {
      res.status(200).send(review);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post(
  "/",
  [
    check("comment")
      .exists()
      .withMessage("We require your comment and better be a good one!!!")
      .isLength({ min: 5 })
      .withMessage("Really not even 5 characters!!!"),
    check("rate")
      .exists()
      .withMessage(
        "Please rate our product(You know what rate to give it right ?!!!)"
      )
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating should be between 1-5"),
    check("elementId")
      .exists()
      .withMessage(
        "Come on we need Id of the product ,give us the correct one please !"
      ),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;

        next(err);
      } else {
        const reviewsDB = await readDB(reviewsFilePath);

        const newReview = {
          ...req.body,
          _id: uniqid(),
          createdAt: new Date(),
        };
        reviewsDB.push(newReview);

        await writeDB(reviewsFilePath, reviewsDB);

        res.status(201).send({ _id: newReview._id });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.put(
  "/:id",
  [
    check("comment")
      .exists()
      .withMessage("We require your comment and better be a good one!!!")
      .isLength({ min: 5 })
      .withMessage("Really not even 5 characters!!!"),
    check("rate")
      .exists()
      .withMessage(
        "Please rate our product(You know what rate to give it right ?!!!)"
      )
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating should be between 1-5"),
    check("elementId")
      .exists()
      .withMessage(
        "Come on we need Id of the product ,give us the correct one please !"
      ),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        const reviewsDB = await readDB(reviewsFilePath);
        const newReviewsDB = reviewsDB.filter(
          (review) => review._id !== req.params.id
        );
        const reviewID = reviewsDB.find(
          (review) => review._id === req.params.id
        );
        if (!reviewID) {
          const err = new Error();
          err.message = "ID not found";
          err.httpStatusCode = 404;
          next(err);
        } else {
          const modifiedReview = {
            ...req.body,
            _id: req.params.id,
            modifiedAt: new Date(),
          };

          newReviewsDB.push(modifiedReview);

          await writeDB(reviewsFilePath, newReviewsDB);

          res.status(203).send({ _id: modifiedReview._id });
        }
      } else {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const reviewsDB = await readDB(reviewsFilePath);
    const modifiedReviewsDB = reviewsDB.filter(
      (review) => review._id !== req.params.id
    );
    const reviewID = reviewsDB.find((review) => review._id === req.params.id);

    if (!reviewID) {
      const err = new Error();
      err.message = "ID not found";
      err.httpStatusCode = 404;
      next(err);
    } else {
      await writeDB(reviewsFilePath, modifiedReviewsDB);
      res.status(204).send();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
