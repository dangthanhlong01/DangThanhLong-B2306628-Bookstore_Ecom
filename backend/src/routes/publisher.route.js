import express from "express";
import upload from "../middlewares/upload.middleware.js";
import publisherController from "../controllers/publisher.controller.js";

import {
    authMiddleware,
    adminMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
    "/",
    publisherController.getPublishers
);

router.get(
    "/slug/:slug",
    publisherController.getPublisherBySlug
);

router.get(
    "/:id",
    publisherController.getPublisherById
);

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    publisherController.createPublisher
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    publisherController.updatePublisher
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    publisherController.deletePublisher
);

export default router;