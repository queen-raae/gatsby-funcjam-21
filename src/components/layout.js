import React from "react";
import "./root.css";

const Layout = ({ children }) => {
  return (
    <main>
      {children}{" "}
      <footer>
        A demo by{" "}
        <a href="https://queen.raae.codes/?utm_source=demo&utm_campaign=funcjam-21">
          Queen Raae
        </a>
        <span role="img" aria-label="crown">
          👑
        </span>
      </footer>
    </main>
  );
};

export default Layout;
