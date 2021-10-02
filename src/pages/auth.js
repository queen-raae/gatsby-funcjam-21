import React, { useEffect, useLayoutEffect, useState } from "react";
import { navigate } from "gatsby";
import axios from "axios";
import queryString from "query-string";

import Layout from "../components/layout";

const AuthPage = ({ location }) => {
  const { code } = queryString.parse(location.search);

  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");

  useLayoutEffect(() => {
    if (!code) {
      navigate("/");
    }
  }, [code]);

  useEffect(() => {
    const authorize = async () => {
      try {
        setStatus("pending");
        setMessage("");
        // Authenticate and get access token
        const {
          data: { accessToken },
        } = await axios.post("/api/auth", {
          code: code,
        });
        navigate("/checkout", { state: { accessToken }, replace: true });
      } catch (error) {
        console.warn(error);
        setStatus("failed");
        setMessage(error.response?.data?.message || error.message);
      }
    };

    if (code) {
      authorize();
    }
  }, [code]);

  return (
    <Layout>
      <p>
        {status === "pending" && <>Calling GitHub...</>}
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

export default AuthPage;
