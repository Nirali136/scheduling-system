const API = require("../utils/apiBuilder");
const AvailabilityController = require("../controllers/users/AvailabilityController");
const auth = require("../middleware/auth");

const router = API.configRoute("/availability")
    .addPath("/")
    .asPOST(AvailabilityController.saveAvailability)
    .userMiddlewares(auth)
    .build()

    .addPath("/:userId")
    .asGET(AvailabilityController.getAvailability)
    .build()

    .getRouter();

module.exports = router;
