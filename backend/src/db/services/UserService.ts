import User from "../models/User";
import ValidationError from "../../utils/ValidationError";
import { TableFields } from "../../utils/constants";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default class UserService {
    static insertUserRecord = async (data: any) => {
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

    static findByEmail = (email: string) =>
        new ProjectionBuilder(async function (this: any) {
            return await User.findOne({ [TableFields.email]: email }, this);
        });

    static authToken = async (user: any) => {
        const secret = process.env.JWT_SECRET || "default_secret_key_change_me";

        const token = jwt.sign({ [TableFields.ID]: user[TableFields.ID].toString() }, secret);
        user[TableFields.tokens] = user[TableFields.tokens].concat({ [TableFields.token]: token });
        await user.save();
        return token;
    };

    static findByCredentials = (email: string, password: string) => {
        return new ProjectionBuilder(async function (this: any) {
            const user: any = await User.findOne({ [TableFields.email]: email });

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

    static getUserById = (id: string) =>
        new ProjectionBuilder(async function (this: any) {
            return await User.findById(id, this);
        });
}

class ProjectionBuilder {
    private projection: Record<string, number> = {};
    private methodToExecute: (this: Record<string, number>) => Promise<any>;

    constructor(methodToExecute: (this: Record<string, number>) => Promise<any>) {
        this.methodToExecute = methodToExecute;
    }

    withBasicInfo() {
        this.projection[TableFields.username] = 1;
        this.projection[TableFields.ID] = 1;
        this.projection[TableFields.email] = 1;
        this.projection[TableFields._createdAt] = 1;
        this.projection[TableFields._updatedAt] = 1;
        return this;
    }

    withId() {
        this.projection[TableFields.ID] = 1;
        return this;
    }

    async execute() {
        return await this.methodToExecute.call(this.projection);
    }
}
