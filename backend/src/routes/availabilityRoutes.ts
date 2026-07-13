import API from "../utils/apiBuilder";
import * as AvailabilityController from "../controllers/users/AvailabilityController";
import auth from "../middleware/auth";

const router = API.configRoute("/availability")
    .addPath("/")
    .asPOST(AvailabilityController.saveAvailability)
    .userMiddlewares(auth)
    .build()

    .addPath("/:userId")
    .asGET(AvailabilityController.getAvailability)
    .build()

    .getRouter();

export default router;
