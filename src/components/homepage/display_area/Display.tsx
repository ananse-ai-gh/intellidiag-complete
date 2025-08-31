import React from "react";
import Topsection from "./topsection/Topsection";
import Middlesection from "./middlesection/middlesection";
import Bottomsection from "./bottomsection/bottomsection";

function Display() {
  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "90%",
        height: "95%",
        marginTop: "20px",
        gap: "40px", // increased from 20px to add more space between sections
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        // backgroundColor: "blue",
      }}
    >
      <Topsection />
      <Middlesection />
      <Bottomsection />
    </div>
  );
}

export default Display;
