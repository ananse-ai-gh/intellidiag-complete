'use client'

import Navbar from "@/components/navbar/Navbar";
import Reach from "@/components/reach_us";
import Footer from "@/components/navbar/footer";

export default function ContactPage() {
  return (
    <div style={{ backgroundColor: "black", width: "100%" }}>
      {/* Navbar at the top */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}>
        <Navbar />
      </div>

      {/* Content with top margin to account for fixed navbar */}
      <div style={{ marginTop: "80px" }}>
        <Reach />
        <Footer />
      </div>
    </div>
  );
}
