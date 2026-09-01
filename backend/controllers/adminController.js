const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const PartModel = require("../models/partmodel");
const PartInfo = require("../models/partinfo");
const PriceHistory = require("../models/priceHistory");

const ROLES = ["seller", "manager", "admin"];

const RESOURCES = {
  users: {
    label: "Users",
    model: User,
    select: "-password",
    sort: { createdAt: -1 },
  },
  partModels: {
    label: "Part Models",
    model: PartModel,
    sort: { createdAt: -1 },
  },
  partInfo: {
    label: "Part Info (Inventory)",
    model: PartInfo,
    populate: { path: "modelId", select: "modelName partType" },
    sort: { createdAt: -1 },
  },
  priceHistory: {
    label: "Price History",
    model: PriceHistory,
    populate: { path: "modelId", select: "modelName partType" },
    sort: { date: -1 },
  },
};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function handleWriteError(err, res, next) {
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(", ") || "value";
    return res.status(409).json({ message: `A record with that ${field} already exists` });
  }

  if (err && err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  next(err);
}

exports.listResources = (req, res) => {
  res.json(Object.entries(RESOURCES).map(([key, { label }]) => ({ key, label })));
};

exports.listRows = async (req, res, next) => {
  try {
    const resource = RESOURCES[req.params.resource];
    if (!resource) {
      return res.status(404).json({ message: "Unknown resource" });
    }

    let query = resource.model.find().sort(resource.sort).limit(500);
    if (resource.select) query = query.select(resource.select);
    if (resource.populate) query = query.populate(resource.populate);

    res.json(await query);
  } catch (err) {
    next(err);
  }
};

exports.createRow = async (req, res, next) => {
  switch (req.params.resource) {
    case "users":
      return exports.createUser(req, res, next);
    case "partModels":
      return exports.createPartModel(req, res, next);
    case "partInfo":
      return exports.createPartInfo(req, res, next);
    case "priceHistory":
      return exports.createPriceHistory(req, res, next);
    default:
      return res.status(404).json({ message: "Unknown resource" });
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    if (role && !ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${ROLES.join(", ")}` });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    const { password: _omit, ...safeUser } = user.toObject();
    res.status(201).json(safeUser);
  } catch (err) {
    handleWriteError(err, res, next);
  }
};

exports.createPartModel = async (req, res, next) => {
  try {
    const { modelName, partType, currentPrice } = req.body;

    if (!modelName || !partType || currentPrice === undefined) {
      return res.status(400).json({ message: "modelName, partType and currentPrice are required" });
    }

    if (typeof currentPrice !== "number" || currentPrice < 0) {
      return res.status(400).json({ message: "currentPrice must be a non-negative number" });
    }

    const partModel = new PartModel({
      modelName: modelName.trim(),
      partType: partType.trim(),
      currentPrice,
    });
    await partModel.save();

    res.status(201).json(partModel);
  } catch (err) {
    handleWriteError(err, res, next);
  }
};

exports.createPartInfo = async (req, res, next) => {
  try {
    const { modelId, cost, purchaseDate } = req.body;

    if (!modelId || cost === undefined || !purchaseDate) {
      return res.status(400).json({ message: "modelId, cost and purchaseDate are required" });
    }

    if (!isValidId(modelId)) {
      return res.status(400).json({ message: "Invalid modelId" });
    }

    if (typeof cost !== "number" || cost < 0) {
      return res.status(400).json({ message: "cost must be a non-negative number" });
    }

    const modelExists = await PartModel.exists({ _id: modelId });
    if (!modelExists) {
      return res.status(400).json({ message: "No part model found for that modelId" });
    }

    const partInfo = new PartInfo({
      modelId,
      cost,
      purchaseDate: new Date(purchaseDate),
      saleId: null,
      soldPrice: null,
    });
    await partInfo.save();

    res.status(201).json(partInfo);
  } catch (err) {
    handleWriteError(err, res, next);
  }
};

exports.createPriceHistory = async (req, res, next) => {
  try {
    const { modelId, price, date } = req.body;

    if (!modelId || price === undefined || !date) {
      return res.status(400).json({ message: "modelId, price and date are required" });
    }

    if (!isValidId(modelId)) {
      return res.status(400).json({ message: "Invalid modelId" });
    }

    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({ message: "price must be a non-negative number" });
    }

    const modelExists = await PartModel.exists({ _id: modelId });
    if (!modelExists) {
      return res.status(400).json({ message: "No part model found for that modelId" });
    }

    const priceHistory = new PriceHistory({ modelId, price, date: new Date(date) });
    await priceHistory.save();

    res.status(201).json(priceHistory);
  } catch (err) {
    handleWriteError(err, res, next);
  }
};

exports.deleteRow = async (req, res, next) => {
  try {
    const { resource: resourceKey, id } = req.params;
    const resource = RESOURCES[resourceKey];

    if (!resource) {
      return res.status(404).json({ message: "Unknown resource" });
    }

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    if (resourceKey === "users" && req.user._id.toString() === id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    if (resourceKey === "partInfo") {
      const partInfo = await PartInfo.findById(id);
      if (!partInfo) {
        return res.status(404).json({ message: "Not found" });
      }
      await partInfo.deleteOne();
      return res.json({ message: "Deleted", _id: id });
    }

    const deleted = await resource.model.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted", _id: id });
  } catch (err) {
    next(err);
  }
};
