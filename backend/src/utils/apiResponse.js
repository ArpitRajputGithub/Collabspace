const sendSuccess = (res, data = null, options = {}) => {
  const { status = 200, message, meta } = options;

  const payload = {
    success: true,
    data
  };

  if (message) payload.message = message;
  if (meta) payload.meta = meta;

  return res.status(status).json(payload);
};

const sendError = (res, status, error, options = {}) => {
  const { code, details } = options;

  const payload = {
    success: false,
    error
  };

  if (code) payload.code = code;
  if (details) payload.details = details;

  return res.status(status).json(payload);
};

module.exports = {
  sendSuccess,
  sendError
};
