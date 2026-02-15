const User = require("../models/User");
const ValidationError = require("../../utils/ValidationError");
const { TableFields } = require("../../utils/constants");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class UserService {
    static insertUserRecord = async (data) => {
        if (await User.findOne({ [TableFields.email]: data[TableFields.email] })) {
            throw new ValidationError("Email already in use");
        }

        if (data[TableFields.password].length < 7) {
            throw new ValidationError("Password too short");
        }

        if (data[TableFields.password].toLowerCase().includes("password")) {
            throw new ValidationError('Password cannot contain "password"');
        }

        const hashedPassword = await bcrypt.hash(data[TableFields.password], 8);

        const user = new User({
            ...data,
            [TableFields.password]: hashedPassword
        });

        await user.save();
        return user;
    };

    static findByEmail = (email) =>
        new ProjectionBuilder(async function () {
            return await User.findOne({ [TableFields.email]: email }, this);
        });

    static authToken = async (user) => {
        const secret = process.env.JWT_SECRET || "default_secret_key_change_me";

        const token = jwt.sign({ [TableFields.ID]: user[TableFields.ID].toString() }, secret);
        user[TableFields.tokens] = user[TableFields.tokens].concat({ [TableFields.token]: token });
        await user.save();
        return token;
    };

    static findByCredentials = (email, password) => {
        return new ProjectionBuilder(async function () {
            const user = await User.findOne({ [TableFields.email]: email });

            if (!user) {
                throw new Error('Unable to login');
            }

            const isMatch = await bcrypt.compare(password, user[TableFields.password]);

            if (!isMatch) {
                throw new Error('Unable to login');
            }
            return user;
        });

    };

    static getUserById = (id) =>
        new ProjectionBuilder(async function () {
            return await User.findById(id, this);
        });
}

const ProjectionBuilder = class {
    constructor(methodToExecute) {
        const projection = {};

        this.withBasicInfo = () => {
            projection[TableFields.username] = 1;
            projection[TableFields.ID] = 1;
            projection[TableFields.email] = 1;
            projection[TableFields._createdAt] = 1;
            projection[TableFields._updatedAt] = 1;
            return this;
        };

        this.withId = () => {
            projection[TableFields.ID] = 1;
            return this;
        };

        this.execute = async () => await methodToExecute.call(projection);
    }
};

module.exports = UserService;
