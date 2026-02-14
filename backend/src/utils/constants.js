const ResponseStatus = (function () {
    function ResponseStatus() { }
    ResponseStatus.Failed = 0;
    ResponseStatus.Success = 200;
    ResponseStatus.BadRequest = 400;
    ResponseStatus.Unauthorized = 401;
    ResponseStatus.NotFound = 404;
    ResponseStatus.InternalServerError = 500;
    ResponseStatus.ServiceUnavailable = 503;

    return ResponseStatus;
})();

const TableNames = (function () {
    function TableNames() { }
    TableNames.User = "users";
    TableNames.Availability = "availabilities";
    TableNames.Booking = "bookings";

    return TableNames;
})();

const TableFields = (function () {
    function TableFields() { }
    TableFields.ID = "_id";
    TableFields.name_ = "name";
    TableFields.username = "username";
    TableFields.email = "email";
    TableFields.password = "password";
    TableFields.tokens = "tokens";
    TableFields.token = "token";
    TableFields._createdAt = "_createdAt";
    TableFields._updatedAt = "_updatedAt";

    // Availability
    TableFields.userId = "userId";
    TableFields.date = "date";
    TableFields.startTime = "startTime";
    TableFields.endTime = "endTime";
    TableFields.slots = "slots";

    // Booking
    TableFields.bookingId = "bookingId";
    TableFields.guestName = "guestName";
    TableFields.guestEmail = "guestEmail";
    TableFields.status = "status";


    return TableFields;
})();

const ValidationMsgs = (function () {
    function ValidationMsgs() { }
    ValidationMsgs.EmailEmpty = "Email is required!";
    ValidationMsgs.EmailInvalid = "Provided email address is invalid.";
    ValidationMsgs.PasswordEmpty = "Password cannot be blank.";
    ValidationMsgs.PasswordInvalid = "Password is invalid.";
    ValidationMsgs.DuplicateEmail = "This email address is already in use.";
    ValidationMsgs.UserNotFound = "User not found.";
    ValidationMsgs.UnableToLogin = "Incorrect email and/or password.";
    ValidationMsgs.NameEmpty = "Name is required!";
    ValidationMsgs.ParametersError = "Invalid parameters.";

    return ValidationMsgs;
})();

module.exports = {
    ResponseStatus,
    TableNames,
    TableFields,
    ValidationMsgs
};
