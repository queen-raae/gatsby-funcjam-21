import createError from "http-errors";
import axios from "axios";
import Joi from "joi";

/**
 * Auth handler, used to redirect to correct Github auth url (GET)
 * and exchange the one time Github auth code for reusable Github access token (POST).
 *
 * Github docs: https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow
 * More on the auth dance: https://medium.com/typeforms-engineering-blog/the-beginners-guide-to-oauth-dancing-4b8f3666de10
 */

export default async function handler(req, res) {
  console.log(`${req.baseUrl} - ${req.method}`);

  try {
    if (req.method === "POST") {
      await postHandler(req, res);
    } else if (req.method === "GET") {
      await getHandler(req, res);
    } else {
      throw createError(405, `${req.method} not allowed`);
    }
  } catch (error) {
    const status = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;

    // Something went wrong, log it
    console.error(`${status} -`, message);

    // Respond with error code and message
    res.status(status).json({
      message: error.expose ? message : "Faulty User Endpoint",
    });
  }
}

/**
 * Redirect to correct Github auth url.
 * Uses env variable GITHUB_CLIENT_ID.
 */

const getHandler = async (req, res) => {
  const GITHUB_AUTH_URL_BASE = `https://github.com/login/oauth/authorize`;
  const GITHUB_PARAMS = `scope=user:email&client_id=${process.env.GITHUB_CLIENT_ID}`;
  const GITHUB_AUTH_URL = `${GITHUB_AUTH_URL_BASE}?${GITHUB_PARAMS}`;
  res.redirect(GITHUB_AUTH_URL);
};

/**
 * Exchange the one time Github auth code for reusable Github access token.
 * Uses env variables GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.
 *
 * @param  {string} req.body.code Github auth code
 */

const postHandler = async (req, res) => {
  // 1. Validate the data coming in
  const schema = Joi.object({
    code: Joi.string().required(),
  }).required();

  const { value, error: validationError } = schema.validate(req.body);
  if (validationError) {
    throw createError(422, error);
  }

  // 2. Do the thing
  const {
    data: { error: authError, error_description, access_token },
  } = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      code: value.code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
    },
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (authError) {
    throw createError(401, error_description);
  }

  // 3. Respond
  res.json({
    accessToken: access_token,
  });
};
