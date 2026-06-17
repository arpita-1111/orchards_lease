import express from "express";

const router=express.Router();

router.post("/register");

router.post("/login");

router.post("/admin/login");

export default router;