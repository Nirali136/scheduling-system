const UserService = require("../../db/services/UserService");
const ValidationError = require("../../utils/ValidationError");
const {ValidationMsgs} = require("../../utils/constants");

exports.register = async (req, res) => {
    try {
        const createdUser = await UserService.insertUserRecord(req.body);
        const user = await UserService.getUserById(createdUser._id).withBasicInfo().execute();
        const token = await UserService.authToken(createdUser);
        return {user, token};
    } catch (e) {
        throw e;
    }
};

exports.login = async (req, res) => {
    try {
        const createdUser = await UserService.findByCredentials(req.body.email, req.body.password)
        .withBasicInfo()
        .execute();
        const user = await UserService.getUserById(createdUser._id).withBasicInfo().execute();
        const token = await UserService.authToken(createdUser);
        return {user, token};
    } catch (e) {
        throw new ValidationError(ValidationMsgs.UnableToLogin);
    }
};

exports.logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        return {message: "Logged out successfully"};
    } catch (e) {
        throw e;
    }
};

exports.getProfile = async (req, res) => {
    return req.user;
};
