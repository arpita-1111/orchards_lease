import express from "express";

import {
me,
getUsers
}
from "../controllers/user.controller.js";

import {
protect,
allow
}
from "../middleware/auth.js";

const router=
express.Router();

router.get(
"/me",
protect,
me
);

router.get(
"/all",
protect,
allow("admin"),
getUsers
);

export default router;