import express from "express";

import authorController from "../controllers/author.controller.js";

import {
    authMiddleware,
    adminMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route công khai
router.get(
    "/",
    authorController.getAuthors
);

router.get(
    "/slug/:slug",
    authorController.getAuthorBySlug
);

router.get(
    "/:id",
    authorController.getAuthorById
);

// Route admin
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    authorController.createAuthor
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    authorController.updateAuthor
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    authorController.deleteAuthor
);

export default router;