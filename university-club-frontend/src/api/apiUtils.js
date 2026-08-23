
export const unwrap = (res, fallback = "Something went wrong") => {
  const body = res?.data;

  if (body === null || body === undefined) {
    throw new Error(fallback);
  }

  if (typeof body === "object" && !Array.isArray(body) && body.success === false) {
    throw new Error(body.message || fallback);
  }

  return body;
};
 
export default unwrap;
