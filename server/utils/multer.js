const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { fileURLToPath } = require("url");

const { dirname } = path;

// Config name file and destination
const storageProductImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/products')
  },
  filename: function (req, file, cb) {
    console.log("This is file info: ", file);
    const productID = uuidv4();
    const fileName = `${productID}.${file.originalname.split('.')[1]}`;
    req.productID = fileName;
    cb(null, fileName)
  }

});

// Config name file and destination
const storageVariantImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/variants')
  },
  filename: function (req, file, cb) {
    console.log("This is file info: ", file);
    const variantID = uuidv4();
    const fileName = `${variantID}.${file.originalname.split('.')[1]}`;
    req.variantID = fileName;
    cb(null, fileName)
  }

});

const storagePilotAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/pilotavatars')
  },
  filename: function (req, file, cb) {
    console.log(file);
    const avatarId = uuidv4();
    const fileName = `${avatarId}.${file.originalname.split('.')[1]}`;
    req.avatarId = fileName;
    cb(null, fileName)
  }

});

const storageAirplaneAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/airplaneimages')
  },
  filename: function (req, file, cb) {
    console.log(file);
    const avatarId = uuidv4();
    const fileName = `${avatarId}.${file.originalname.split('.')[1]}`;
    req.avatarId = fileName;
    cb(null, fileName)
  }

});

exports.uploadProductImage = multer({
  storage: storageProductImage
});

exports.uploadVariantImage = multer({
  storage: storageVariantImage
});

exports.uploadPilotAvatar = multer({
  storage: storagePilotAvatar
});

exports.uploadAirplaneAvatar = multer({
  storage: storageAirplaneAvatar
});
