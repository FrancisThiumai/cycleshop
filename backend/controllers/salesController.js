const PartModel = require("../models/partmodel");
const PartInfo = require("../models/partinfo");
const Sale = require("../models/sales");
const BicycleInfo = require("../models/bicycleInfo");
const mongoose = require("mongoose");

async function reserveOnePart(modelId, saleId, session) {
  const model = await PartModel.findById(modelId).session(session);

  if (!model) {
    throw new Error(`Part model not found: ${modelId}`);
  }

  const part = await PartInfo.findOne({ modelId, saleId: null }).session(session);

  if (!part) {
    throw new Error(`Not enough stock for ${model.modelName}`);
  }

  part.saleId = saleId;
  part.soldPrice = model.currentPrice;
  await part.save({ session });

  return { partId: part._id, price: model.currentPrice };
}

exports.getPartTypes = async (req, res, next) => {
  try {
    const parttypes = await PartModel.distinct("partType");
    res.json(parttypes);
  } catch (err) {
    next(err);
  }
};

exports.getModels = async (req, res, next) => {
  try {
    const { parttype } = req.params;
    const forAdd = req.query.add === "true";

    if (forAdd) {
      return res.json(await PartModel.find({ partType: parttype }));
    }

    const availableModelIds = await PartInfo.distinct("modelId", {
      saleId: null,
    });

    const models = await PartModel.find({
      partType: parttype,
      _id: { $in: availableModelIds },
    });

    res.json(models);
  } catch (err) {
    next(err);
  }
};


exports.estimateBicyclePrice = async (req, res, next) => {
  try {
    const { components } = req.body;
    const { frame, gear, brake, tyre1, tyre2, extras = [] } = components || {};

    const modelIds = [frame, gear, brake, tyre1, tyre2, ...extras].filter(Boolean);

    if (modelIds.length === 0) {
      return res.json({ total: 0, breakdown: [] });
    }

    const models = await PartModel.find({ _id: { $in: modelIds } });
    const modelById = new Map(models.map((m) => [String(m._id), m]));

    const breakdown = modelIds.map((modelId) => {
      const model = modelById.get(String(modelId));
      return {
        modelId,
        modelName: model ? model.modelName : "Unknown part",
        price: model ? model.currentPrice : 0,
      };
    });

    const total = breakdown.reduce((sum, item) => sum + item.price, 0);

    res.json({ total, breakdown });
  } catch (err) {
    next(err);
  }
};

exports.createSale = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { saleType, paymentMethod, transactionId, salePrice } = req.body;
    const resolvedSaleType = saleType === "bicycle" ? "bicycle" : "parts";

    session.startTransaction();

    const sale = new Sale({
      seller: req.user._id,
      saleDate: new Date(),
      saleType: resolvedSaleType,
      paymentMethod,
      transactionId: transactionId || null,
      verified: false,
    });

    if (resolvedSaleType === "bicycle") {
      if (salePrice === undefined || salePrice === null || salePrice < 0) {
        throw new Error("salePrice is required for a bicycle sale");
      }

      const { components } = req.body;
      const { frame, gear, brake, tyre1, tyre2, extras = [] } = components || {};

      if (!frame || !gear || !brake || !tyre1 || !tyre2) {
        throw new Error(
          "A bicycle sale requires a frame, gear, brake, and two tyres"
        );
      }

      sale.salePrice = salePrice;
      await sale.save({ session });

      const { partId: framePartId } = await reserveOnePart(frame, sale._id, session);
      const { partId: gearPartId } = await reserveOnePart(gear, sale._id, session);
      const { partId: brakePartId } = await reserveOnePart(brake, sale._id, session);
      const { partId: tyre1PartId } = await reserveOnePart(tyre1, sale._id, session);
      const { partId: tyre2PartId } = await reserveOnePart(tyre2, sale._id, session);

      const extraPartIds = [];
      for (const extraModelId of extras) {
        const { partId } = await reserveOnePart(extraModelId, sale._id, session);
        extraPartIds.push(partId);
      }

      await BicycleInfo.create(
        [
          {
            saleId: sale._id,
            frame: framePartId,
            gear: gearPartId,
            brake: brakePartId,
            tyre1: tyre1PartId,
            tyre2: tyre2PartId,
            extras: extraPartIds,
          },
        ],
        { session }
      );
    } else {
      const { items } = req.body;
      let total = 0;

      for (const item of items) {
        const { modelId, quantity } = item;

        for (let i = 0; i < quantity; i++) {
          const { price } = await reserveOnePart(modelId, sale._id, session);
          total += price;
        }
      }

      sale.salePrice = total;
      await sale.save({ session });
    }

    await session.commitTransaction();

    res.status(201).json(sale);
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
};

exports.getSales = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const sales = await Sale.find({ seller: req.user._id }).sort({
      saleDate: -1,
    });
    res.json(sales);
  } catch (err) {
    next(err);
  }
};


exports.getAllSales = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "manager" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only managers and admins can view all sales",
      });
    }

    const sales = await Sale.find().sort({ saleDate: -1 });
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

exports.getSaleDetail = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { saleId } = req.params;
    const sale = await Sale.findById(saleId);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const isOwner = String(sale.seller) === String(req.user._id);
    const isPrivileged = req.user.role === "manager" || req.user.role === "admin";

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: "Not authorized to view this sale" });
    }

    const parts = await PartInfo.find({ saleId: sale._id }).populate("modelId");

    let bicycle = null;
    if (sale.saleType === "bicycle") {
      bicycle = await BicycleInfo.findOne({ saleId: sale._id }).populate({
        path: "frame gear brake tyre1 tyre2 extras",
        populate: { path: "modelId" },
      });
    }

    res.json({ sale, parts, bicycle });
  } catch (err) {
    next(err);
  }
};

exports.verifySale = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "manager" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only managers and admins can verify transactions",
      });
    }

    const { saleId } = req.params;
    const sale = await Sale.findById(saleId);

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    sale.verified = !sale.verified;
    await sale.save();

    res.json(sale);
  } catch (err) {
    next(err);
  }
};