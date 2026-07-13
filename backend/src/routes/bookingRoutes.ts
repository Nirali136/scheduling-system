import API from "../utils/apiBuilder";
import * as BookingController from "../controllers/users/BookingController";
import auth from "../middleware/auth";

const router = API.configRoute("/bookings")
    .addPath("/")
    .asPOST(BookingController.createBooking)
    .build()

    .addPath("/")
    .asGET(BookingController.getBookings)
    .userMiddlewares(auth)
    .build()

    .getRouter();

export default router;
