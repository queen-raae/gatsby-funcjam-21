# Sell access to a private Github repo

A demo showing how to sell sell access to a private Github repo.

- Authenticates the buyer using Github
- Collects payment using Stripe
- Automagically adds buyers to repo when payment goes through

Also a Gatsby FuncJam ‘21 Winner 🥳

&nbsp;

## A message or two or three from Queen Raae 👑

### 1-on-1 Emergency Gatsby Call

Are you stuck on a reef in the sharky waters around the Gatsby islands? Check out [1-on-1 Emergency Gatsby Call](https://queen.raae.codes/gatsby-emergency/?utm_source=readme&utm_campaign=funcjam-21) with Queen Raae to get friendly advice you can put into action immediately from a seasoned Gatsby developer.

### Stay updated and get the most out of Gatsby

Learn how to get the most out of Gatsby and **stay updated** on the demo by [subscribing](https://queen.raae.codes/emails/?utm_source=readme&utm_campaign=funcjam-21) to daily emails from Queen Raae and Cap'n Ola.

### Video Walkthrough

Watch us do a walkthrough of the code on this [unauthorized and rum-fueled treasure hunt](https://youtu.be/fzlIzQbMtwM) in the sharky waters around the Gatsby islands on YouTube with Queen Raae, Pirate Paul and Cap'n Ola.

&nbsp;

## How does it work?

To make it easier to follow there is a page for each major step in the process:

- Index page triggers a GET request to `/api/auth` that triggers a redirect to Github page for authentication
  - On success Github redirects back to `/auth/?code=<github auth code>`
- Auth page triggers a POST request to `/api/auth` to exchange the github auth code for an access token
  - On success navigates to `/checkout` with access token as state param
- Checkout page triggers a POST request to `/api/checkout` creating a Stripe Checkout Session
  - On success navigates to the Checkout Sesssion URL returned from the function when on completing redirects back to `/success/?sessionId=<Stripe Checkout Session ID>`
- Success Page triggers a POST request to `/api/checkout` retreivng the Stripe Checkout Session
  - On sucess displays message returned from the function.

## Make it your own

1.  **Prerequisite**

    - A Stripe Secret Key (get one by creating a Stripe account)
    - A Stripe Price Id (get one by making a product, then a product price)
    - A GitHub OAuth App (create one in [your Github settings](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app))
    - A private Github repo to sell (create one on GitHub)
    - A Github Personal Access Token for the owner of above repo (create one in [your Github settings](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token))

2.  **Develop**

    - To get started clone this repo locally and run `yarn install` to add all necessary packages.
    - Create your own `.env.development` by copying `.env.example`: `cp .env.example .env.development`
    - Login with Stripe CLI: `stripe login` and follow the directions
    - Forward Stripe event to the Stripe Webook: `stripe listen --forward-to http://localhost:8000/api/stripe-webhook`
    - Fill out `.env.development` with your own data and you are ready for `yarn develop`

3.  **Deploy**

You can deploy this example on Gatsby Cloud by [connecting your repo Gatsby Cloud](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-gatsby-cloud/#set-up-an-existing-gatsby-site).

Make sure to add all the keys needed as [environment variables](https://support.gatsbyjs.com/hc/en-us/articles/360053096753-Managing-Environment-Variables).

## Helpful Links

- Gatsby [functions docs](https://www.gatsbyjs.com/docs/reference/functions/).
- Github [Auth docs](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow)
- A great article on the [auth dance for beginners](https://medium.com/typeforms-engineering-blog/the-beginners-guide-to-oauth-dancing-4b8f3666de10)
- Stripe [Checkout Session API docs](https://stripe.com/docs/api/checkout/sessions)
- Github [Users API docs](https://docs.github.com/en/rest/reference/users)
- Github [Repos API docs](https://docs.github.com/en/rest/reference/repos)
