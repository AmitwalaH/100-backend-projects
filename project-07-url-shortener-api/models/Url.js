const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          // Simple URL validation regex
          return /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/.*)?$/.test(v);
        },
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
      maxlength: 10,
      validate: {
        validator: function (v) {
          // Simple alphanumeric validation for shortCode
          return /^[a-zA-Z0-9]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid short code!`,
      },
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Url = mongoose.model("Url", urlSchema);
module.exports = Url;
