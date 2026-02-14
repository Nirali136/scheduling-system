const { TableFields } = require("../../utils/constants");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        [TableFields.username]: {
            type: String,
            trim: true,
            required: true
        },
        [TableFields.email]: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
        },
        [TableFields.password]: {
            type: String,
            required: true,
            minlength: 7,
            trim: true,
        },
        [TableFields.tokens]: [
            {
                [TableFields.token]: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
