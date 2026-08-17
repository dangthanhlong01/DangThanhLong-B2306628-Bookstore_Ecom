import express from "express";
import chatbotController from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post(
    "/message",
    chatbotController.sendMessage
);

router.get(
    "/welcome",
    chatbotController.getWelcomeMessage
);

export default router;