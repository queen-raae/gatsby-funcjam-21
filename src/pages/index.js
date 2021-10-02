import React from "react";

const IndexPage = () => {
  return (
    <main>
      <form action="/api/auth">
        <p>
          The solution to all your problems is here! Buy access to my{" "}
          <strong>life-changing</strong> private Github repository.
        </p>

        <small>
          <ul>
            <li>Authenticate with GitHub</li>
            <li>Pay with Stripe</li>
            <li>Receive invite</li>
          </ul>
        </small>

        <p>
          <button>Yes, please!</button>
        </p>
      </form>
    </main>
  );
};

export default IndexPage;
