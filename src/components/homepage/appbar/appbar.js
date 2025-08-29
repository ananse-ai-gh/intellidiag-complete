'use client'

import React from "react";
import { FaBell } from "react-icons/fa";
import Link from 'next/link';

function Appbar() {
  return (
    <div
      style={{
        backgroundColor: "#0D0D0D",
        padding: "15px 27px",
        width: "100%",
        // height: "92px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        borderRadius: "15px",
      }}
    >
      <div
        style={{
          height: "42px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Link href="/">
          <img
            style={{
              //   padding: "48px 0px",
            }}
            src="/intellidiag.png"
            alt="IntelliDiag Logo"
            height="22px"
          />
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          <FaBell
            style={{
              color: "#A0A0A0",
              fontSize: "18px",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "8px",
              height: "8px",
              backgroundColor: "#0694FB",
              borderRadius: "50%",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: "8px",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "#0694FB",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            A
          </div>
          <span
            style={{
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Admin User
          </span>
        </div>
      </div>
    </div>
  );
}

export default Appbar;
