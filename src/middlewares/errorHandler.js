import { ErrorResponse } from "../utils/responses.js";

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    // const message = 'Duplicate field value entered';
    const message = err;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation eoor
  if (err.name === "validationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
        success: false,
        message: 'Invalid Token'
    });
}

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

