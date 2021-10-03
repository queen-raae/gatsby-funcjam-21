import createError from "http-errors";
import Joi from "joi";

import Stripe from "./../api-services/stripe";
import Github from "./../api-services/github";

const stripe = Stripe();
const github = Github();

/**
 * Stripe webhook handler (POST).
 *
 * Stripe docs: https://stripe.com/docs/webhooks
 */

export default async function handler(req, res) {
  console.log(`${req.baseUrl} - ${req.method}`);

  try {
    // Only handle POST requests for webhooks
    if (req.method === "POST") {
      await stripeWebhook(req, res);
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

/**
 * Add the Github user from the Stripe Checkout session metadata to the private Github repo.
 * Uses env variables GITHUB_REPO_OWNER and GITHUB_REPO.
 *
 * @param  {string} req.body.type Stripe event type
 * @param  {string} req.body.data.object.id The Stripe checkout session id
 */

const stripeWebhook = async (req, res) => {
  // Log the Stripe event type
  console.log(req.body.type);

  // 1. Validate the data coming in
  const schema = Joi.object({
    type: Joi.valid("checkout.session.completed"),
    data: Joi.object({
      object: Joi.object({
        id: Joi.string().required(),
      }).required(),
    }).required(),
  }).required();

  const { value, error } = schema.validate(req.body, { allowUnknown: true });
  if (error) {
    throw createError(422, error);
  }

  // Retrieve Stripe session
  const sessionId = value.data.object.id;
  const sessionFromStripe = await stripe.retrieveSession({ id: sessionId });

  // Make sure we have the GitHub username needed
  const username = sessionFromStripe.metadata?.github;
  if (!username) {
    throw createError(422, "GitHub username not found");
  }

  // Make sure the session is paid for
  if (sessionFromStripe.payment_status !== "paid") {
    throw createError(402, "Payment still required");
  }

  // 2. Do the thing: add github user to repo
  await github.addRepoAccess({
    username: username,
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO,
  });

  // 3. Respond
  res.send("OK");
};
