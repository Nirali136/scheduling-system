const API = require("../utils/apiBuilder");
const BookingController = require("../controllers/users/BookingController");
const auth = require("../middleware/auth");

const router = API.configRoute("/bookings")
    .addPath("/")
    .asPOST(BookingController.createBooking)
    .build()

    .addPath("/")
    .asGET(BookingController.getBookings)
    .userMiddlewares(auth)
    .build()

    .getRouter();

module.exports = router;
