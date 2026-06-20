/**
 * Uniform success envelope for all API responses.
 *   { success, message, data, meta }
 */
class ApiResponse {
  constructor(data = null, message = 'Success', meta = undefined) {
    this.success = true;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }
}

/**
 * Helper to send a response with a status code in one call.
 * @example return ok(res, user, 'Profile loaded');
 */
export const send = (res, statusCode, data, message, meta) =>
  res.status(statusCode).json(new ApiResponse(data, message, meta));

export const ok = (res, data, message = 'Success', meta) =>
  send(res, 200, data, message, meta);

export const created = (res, data, message = 'Created', meta) =>
  send(res, 201, data, message, meta);

export default ApiResponse;
