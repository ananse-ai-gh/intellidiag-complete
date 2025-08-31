import React from "react";
import PreviousScan from "./PreviousScan";
import Patientoverview from "./PatientOvervew";

function Middlesection() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: "40px", // reduced from 60px
        height: "550px", // increased from 320px to give more space
      }}
    >
      <PreviousScan />
      <Patientoverview />
    </div>
  );
}

export default Middlesection;
