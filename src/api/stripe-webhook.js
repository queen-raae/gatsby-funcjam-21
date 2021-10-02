import createError from "http-errors";
import Joi from "joi";

import Stripe from "./../api-services/stripe";
import Github from "./../api-services/github";

const stripe = Stripe();
const github = Github();

export default async function handler(req, res) {
  console.log(`${req.baseUrl} - ${req.method}`);

  try {
    // Only handle POST requests for webhooks
    if (req.method === "POST") {
      await postHandler(req, res);
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
      message: error.expose ? message : `Faulty ${req.baseUrl}`,
    });
  }
}

const postHandler = async (req, res) => {
  console.log(req.body.type);

  // 1. Validate that data coming in
  const schema = Joi.object({
    type: Joi.valid("checkout.session.completed"),
    data: Joi.object({
      object: Joi.object({
        id: Joi.string().required(),
      }).required(),
    }).required(),
  }).required();

  const {
    value: { data },
    error,
  } = schema.validate(req.body, { allowUnknown: true });
  if (error) {
    throw createError(422, error);
  }

  const sessionFromStripe = await stripe.getSession({ id: data.object.id });
  const username = sessionFromStripe.metadata?.github;

  // Make sure we have the GitHub username needed
  if (!username) {
    throw createError(422, "GitHub username not found");
  }

  // Make sure the session is paid for
  if (sessionFromStripe.payment_status !== "paid") {
    throw createError(402, "Payment still required");
  }

  // 2. Do the thing
  await github.addRepoAccess({
    username: username,
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO,
  });

  // 3. Respond
  res.send("OK");
};
