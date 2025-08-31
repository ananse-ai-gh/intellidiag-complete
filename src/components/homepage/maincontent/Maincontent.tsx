import React from "react";
import Sidebar from "../sidebar/Sidebar";
import PageContent from "../display_area/PageContent";

function Maincontent() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        gap: "30px",
        boxSizing: "border-box",
        marginTop: "15px", // reduced from 30px
      }}
    >
      <Sidebar />
      <PageContent />
    </div>
  );
}

export default Maincontent;
