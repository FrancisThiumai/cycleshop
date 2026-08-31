const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const adminController = require("../controllers/adminController");

const adminRouter = express.Router();

adminRouter.use(requireAdmin);

adminRouter.get("/resources", adminController.listResources);
adminRouter.get("/:resource", adminController.listRows);
adminRouter.post("/:resource", adminController.createRow);
adminRouter.delete("/:resource/:id", adminController.deleteRow);

module.exports = adminRouter;
