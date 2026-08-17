import express from "express";
import addressController from "../controllers/address.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, addressController.getAddresses);

router.post("/", authMiddleware, addressController.addAddress);

router.put(
    "/:addressId",
    authMiddleware,
    addressController.updateAddress
);

router.delete(
    "/:addressId",
    authMiddleware,
    addressController.deleteAddress
);

export default router;