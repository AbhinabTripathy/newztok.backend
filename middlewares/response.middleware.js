const { response, errorResponse } = require("../utils/helper");

const sendResponse = (req, res, next) => {
  res.success = (
    statusCode,
    success,
    message,
    data = "",
    additionalFieldName = "",
    additionalFieldValue = ""
  ) => {
    res
      .status(statusCode)
      .json(
        response(
          statusCode,
          success,
          message,
          data,
          additionalFieldName,
          additionalFieldValue
        )
      );
  };

  res.error = (statusCode, success, message, errors) => {
    res
      .status(statusCode)
      .json(errorResponse(statusCode, success, message, errors));
  };

  next();
};

module.exports = sendResponse;
