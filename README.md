# My Gatsby FuncJam '21 entry - selling access to a private Github repo.

This example demonstrates how to sell access to a private Github repo.

- Authenticates the buyer using Github
- Collects payment using Stripe
- Automagically adds buyers to repo when payment goes through

## Flow

- Index page triggers a GET request to `/api/auth` triggers redirect to Github page for authentication
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

    - To get started clone this repo locally and run `npm install` to add all necessary packages.
    - Create .env.development by copying .env.example `cp .env.example .env.development``
    - Fill out with your own keys and you are ready for `npm run develop`

3.  **Deploy**

You can deploy this example on Gatsby Cloud by [connecting your repo Gatsby Cloud](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-gatsby-cloud/#set-up-an-existing-gatsby-site).

Make sure to add all the keys needed as [environment variables](https://support.gatsbyjs.com/hc/en-us/articles/360053096753-Managing-Environment-Variables).

## Helpful Links

Gatsby [functions docs](https://www.gatsbyjs.com/docs/reference/functions/).
Github [Auth docs](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow)
A great article on the [auth dance for beginners](https://medium.com/typeforms-engineering-blog/the-beginners-guide-to-oauth-dancing-4b8f3666de10)
Stripe [Checkout Session API docs](https://stripe.com/docs/api/checkout/sessions)
Github [Users API docs](https://docs.github.com/en/rest/reference/users)
Github [Repos API docs](https://docs.github.com/en/rest/reference/repos)
