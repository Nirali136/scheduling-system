import mongoose from 'mongoose';
import chalk from 'chalk';

export class MongoUtil {
    static newObjectId(): mongoose.Types.ObjectId {
        return new mongoose.Types.ObjectId();
    }

    static toObjectId(stringId: string): mongoose.Types.ObjectId {
        return new mongoose.Types.ObjectId(stringId);
    }

    static isValidObjectID(id: any): boolean {
        return mongoose.isValidObjectId(id);
    }
}

export const initConnection = (callback: () => void): void => {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scheduling-system')
        .then(() => {
            console.log(chalk.blue.bold("Database Connection Established✅"));
            callback();
        })
        .catch(err => {
            console.log(chalk.bgRed.bold("⚠️ [Database ERROR]") + chalk.red(err));
            process.exit(1);
        });

    (mongoose.connection as any).on("error", (error) => {
        console.log(chalk.bgRed.bold("⚠️ [Database ERROR]") + chalk.red(error));
    });
};

export { mongoose };
