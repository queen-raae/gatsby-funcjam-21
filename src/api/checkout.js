import createError from "http-errors";
import Joi from "joi";

import Stripe from "./../api-services/stripe";
import Github from "../api-services/github";

const stripe = Stripe();
const github = Github();

/**
 * Checkout handler, used to retreive Stripe checkout sessions (GET)
 * and create Stripe checkout sessions (POST).
 *
 */

export default async function handler(req, res) {
  console.log(`${req.baseUrl} - ${req.method}`);

  try {
    if (req.method === "POST") {
      await createStripeSession(req, res);
    } else if (req.method === "GET") {
      await fetchStripeSession(req, res);
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
 * Create a Stripe checkout session with Github username added as metadata.
 * Uses env variables GITHUB_REPO_OWNER, GITHUB_REPO and STRIPE_PRICE_ID.
 *
 * @param  {string} req.body.accessToken Github access token
 * @param  {string} req.body.successUrl Passed to Stripe checkout session
 * @param  {string} req.body.cancelUrl Passed to Stripe checkout session
 */

const createStripeSession = async (req, res) => {
  // 1. Validate the data coming in
  const schema = Joi.object({
    accessToken: Joi.string().required(),
    successUrl: Joi.string().required(),
    cancelUrl: Joi.string().required(),
  }).required();

  const { value, error } = schema.validate(req.body);
  if (error) {
    throw createError(422, error);
  }

  // Get auhenticated Github user using the access token
  const user = await github.getUser({ accessToken: value.accessToken });
  // Check if the user already has access to the repo
  const access = await github.getRepoAccess({
    username: user.username,
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO,
  });

  if (access) {
    // User already has access, no new checkout sesion will be made
    throw createError(422, `${user.username} already has access to the repo`);
  }

  // 2. Create a Stripe Checkout Session with the Github username as metadata
  const session = await stripe.createSession({
    username: user.username,
    priceId: process.env.STRIPE_PRICE_ID,
    successUrl: value.successUrl,
    cancelUrl: value.cancelUrl,
  });

  // 3. Response with url to session url
  // Tried using res.redirect, but that gave me cors errors.
  res.json({ url: session.url });
};

/**
 * Retreive a Stripe checkout session.
 *
 * @param  {string} req.query.sessionId Stripe checkout id
 */

const fetchStripeSession = async (req, res) => {
  // 1. Validate the data coming in
  const schema = Joi.object({
    sessionId: Joi.string().required(),
  }).required();

  const { value, error } = schema.validate(req.query);
  if (error) {
    throw createError(422, error);
  }

  // Retrieve the Stripe Session
  const sessionFromStripe = await stripe.retrieveSession({
    id: value.sessionId,
  });

  // Make sure we have the GitHub username needed
  const username = sessionFromStripe.metadata?.github;
  if (!username) {
    throw createError(402, "GitHub username not found");
  }

  // Make sure the session is paid for
  if (sessionFromStripe.payment_status !== "paid") {
    throw createError(402, "Payment still required");
  }

  // 2. Do the thing
  const message = `${username} shall get access to the repo shortly`;

  // 3. Respond
  res.status(200).json({
    message: message,
  });
};
