import React, { useEffect, useLayoutEffect, useState } from "react";
import { navigate } from "gatsby";
import axios from "axios";

import Layout from "../components/layout";

const CheckoutPage = ({ location }) => {
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");

  useLayoutEffect(() => {
    if (!location.state?.accessToken) {
      navigate("/");
    }
  }, [location]);

  useEffect(() => {
    const checkout = async () => {
      try {
        setMessage("");
        setStatus("pending");

        const {
          data: { url, message },
        } = await axios.post("/api/checkout", {
          accessToken: location.state.accessToken,
          cancelUrl: `${location.origin}/`,
          successUrl: `${location.origin}/success/?sessionId={CHECKOUT_SESSION_ID}`,
        });

        if (url) {
          window.location = url;
        } else {
          setStatus("failed");
          setMessage(message);
        }
      } catch (error) {
        setMessage(error.response?.data?.message || error.message);
        setStatus("failed");
      }
    };

    if (location.state?.accessToken && location.origin) {
      checkout();
    }
  }, [location]);

  return (
    <Layout>
      <p>
        {status === "pending" && <>Calling Stripe...</>}
        {status === "failed" && <>Hold up!</>}
        {message && (
          <>
            <br />
            <small>{message}</small>
          </>
        )}
      </p>
    </Layout>
  );
};

export default CheckoutPage;
