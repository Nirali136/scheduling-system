import API from "../utils/apiBuilder";
import * as AuthController from "../controllers/users/AuthController";
import auth from "../middleware/auth";

const router = API.configRoute("/user")
    .addPath("/register")
    .asPOST(AuthController.register)
    .build()

    .addPath("/login")
    .asPOST(AuthController.login)
    .build()

    .addPath("/logout")
    .asPOST(AuthController.logout)
    .userMiddlewares(auth)
    .build()
    .getRouter();

export default router;
