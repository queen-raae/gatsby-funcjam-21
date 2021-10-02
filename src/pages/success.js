import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

import useParams from "../hooks/useParams";
import Layout from "../components/layout";

const SuccessPage = ({ location }) => {
  const params = useParams(location);
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");
  const verifyDone = useRef(false);

  useEffect(() => {
    const verifyPurchase = async () => {
      // Grab the session
      try {
        const result = await axios.get("/api/checkout", {
          params: { sessionId: params.sessionId },
        });
        setStatus("fulfilled");
        setMessage(result.data.message);
      } catch (error) {
        setStatus("failed");
        setMessage(error.response?.data?.message || error.message);
      }
    };

    if (params.sessionId && !verifyDone.current) {
      verifyPurchase();
      verifyDone.current = true;
    }
  }, [params.sessionId]);

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
