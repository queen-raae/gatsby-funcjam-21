import createError from "http-errors";
import Joi from "joi";

import Stripe from "./../api-services/stripe";
import Github from "./../api-services/github";

const stripe = Stripe();
const github = Github();

export const config = {
  bodyParser: {
    raw: {
      type: `*/*`,
    },
  },
};

/**
 * Stripe webhook handler (POST).
 *
 * Stripe docs: https://stripe.com/docs/webhooks
 */

export default async function handler(req, res) {
  console.log(`${req.baseUrl} - ${req.method}`);

  try {
    await stripeWebhook(req, res);
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
 */

const stripeWebhook = async (req, res) => {
  // 1. Verify the event
  const event = stripe.verifyEvent({
    body: req.body,
    signature: req.headers["stripe-signature"],
    signingSecret: process.env.STRIPE_SIGNING_SECRET,
  });

  // 2. Validate the data
  const schema = Joi.object({
    type: Joi.valid("checkout.session.completed").required(),
    data: Joi.object({
      object: Joi.object({
        // Make sure the session is paid for
        payment_status: Joi.valid("paid").required(),
        // Make sure there is a GitHub username attached
        metadata: Joi.object({
          github: Joi.string().required(),
        }),
      }).required(),
    }).required(),
  }).required();

  const { value, error } = schema.validate(event, { allowUnknown: true });
  if (error) {
    throw createError(422, error);
  }

  // 3. Do the thing: add github user to repo
  await github.addRepoAccess({
    username: value.data.object.metadata.github,
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO,
  });

  // 3. Respond
  res.send("OK");
};
