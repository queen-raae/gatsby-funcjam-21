import React, { useEffect, useLayoutEffect, useState } from "react";
import { navigate } from "gatsby";
import axios from "axios";
import queryString from "query-string";

import Layout from "../components/layout";

const SuccessPage = ({ location }) => {
  const { sessionId } = queryString.parse(location.search);
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");

  useLayoutEffect(() => {
    if (!sessionId) {
      navigate("/");
    }
  }, [sessionId]);

  useEffect(() => {
    const verifyPurchase = async () => {
      // Grab the session
      try {
        const result = await axios.get("/api/checkout", {
          params: { sessionId: sessionId },
        });
        setStatus("fulfilled");
        setMessage(result.data.message);
      } catch (error) {
        setStatus("failed");
        setMessage(error.response?.data?.message || error.message);
      }
    };

    if (sessionId) {
      verifyPurchase();
    }
  }, [sessionId]);

  return (
    <Layout>
      <p>
        {status === "pending" && <>Verifying your payment...</>}
        {status === "failed" && <>Hold up!</>}
        {status === "fulfilled" && <>Success 🎉</>}
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

export default SuccessPage;
