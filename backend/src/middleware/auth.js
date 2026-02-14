const jwt = require("jsonwebtoken");
const User = require("../db/models/User");
const { ResponseStatus, ValidationMsgs } = require("../utils/constants");
const ValidationError = require("../utils/ValidationError");

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
         const secret = process.env.JWT_SECRET || "default_secret_key_change_me";
        const decoded = jwt.verify(token, secret);
        const user = await User.findOne({
            _id: decoded._id,
        });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(ResponseStatus.Unauthorized).send({ error: "Please authenticate." });
    }
};

module.exports = auth;
