import "./App.css";
import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Navbar from "./components/navbar/Navbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./components/home";
import About from "./components/about";
import Partners from "./components/partners";
import Reach from "./components/reach_us";
import Footer from "./components/navbar/footer";
import Features from "./components/features";
import CustomCursor from "./components/cursor";
import Others from "./components/others";
import Partners2 from "./components/partners2";
import Dashboard from "./components/homepage/Dashboard";
{
  /* <link
  rel="preload"
  href="/fonts/Poppins-Regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
/>; */
}
gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 298;

function App() {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Preload all images with proper error handling
  useEffect(() => {
    let isMounted = true;
    const frameImages = [];
    const loadPromises = [];

    for (let i = 220; i <= 500; i++) {
      const img = new Image();
      img.src = `/frames/intellidiag${String(i).padStart(4, "0")}.jpg`;
      img.loading = "eager"; // Force immediate loading
      frameImages.push(img);

      loadPromises.push(
        new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if some fail
        })
      );
    }

    Promise.all(loadPromises).then(() => {
      if (isMounted) {
        setImages(frameImages);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      // Cleanup image event listeners
      frameImages.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  // 2. Canvas setup and animation
  useEffect(() => {
    if (isLoading || !canvasRef.current) return;

    // if (isLoading) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const baseWidth = 1280;
    const baseHeight = 720;

    // Set initial black background
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    context.fillStyle = "#000000";
    context.fillRect(0, 0, baseWidth, baseHeight);

    const frameState = { frame: 0 };

    const render = () => {
      const img = images[frameState.frame];

      // Maintain black background if image not ready
      if (!img?.complete) {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, baseWidth, baseHeight);
        return;
      }

      // Calculate and draw the image
      const scale = Math.max(
        window.innerWidth / baseWidth,
        window.innerHeight / baseHeight
      );
      const displayWidth = baseWidth * scale;
      const displayHeight = baseHeight * scale;

      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      canvas.style.left = `${(window.innerWidth - displayWidth) / 2}px`;
      canvas.style.top = `${(window.innerHeight - displayHeight) / 2}px`;

      context.clearRect(0, 0, baseWidth, baseHeight);
      context.drawImage(img, 0, 0, baseWidth, baseHeight);
    };

    // 3. Force immediate render on mount and after refresh
    const forceRender = () => {
      requestAnimationFrame(() => {
        render();
        // Double-check render after a short delay
        setTimeout(render, 100);
      });
    };

    // Set up GSAP animation
    const animation = gsap.to(frameState, {
      frame: TOTAL_FRAMES - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        start: "top top",
        end: "7000px",
        scrub: true,
      },
      onUpdate: render,
    });

    // 4. Handle page refresh and visibility changes
    const handleLoad = () => {
      forceRender();
      // Extra safety check after all resources load
      setTimeout(forceRender, 300);
    };

    window.addEventListener("load", handleLoad);
    window.addEventListener("resize", render);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        forceRender();
      }
    });

    // Initial render
    forceRender();

    return () => {
      animation.kill();
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("resize", render);
      document.removeEventListener("visibilitychange", forceRender);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [images, isLoading]);

  return (
    <div
      style={{
        backgroundColor: "black",
        width: "100%",
      }}
    >
      <CustomCursor />
      <Router>
        <Routes>
          {/* Main site with all the background effects */}
          <Route
            path="/"
            element={
              <div style={{ position: "relative" }}>
                {/* Canvas with black background */}
                <canvas
                  width="100vw"
                  height="100vh"
                  ref={canvasRef}
                  style={{
                    position: "fixed",
                    backgroundColor: "#000000",
                    zIndex: 1,
                    visibility: isLoading ? "hidden" : "visible",
                  }}
                />

                {/* Overlay div */}
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "6000px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.79)",
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                />

                {/* Content */}
                <div style={{ zIndex: 3 }}>
                  <Homepage />
                  <About />
                  <Others />
                  <Partners2 />
                  <Reach />
                  <Footer />
                </div>

                <Navbar />
              </div>
            }
          />

          {/* Dashboard route without any background effects */}
          <Route
            path="/dashboard"
            element={
              <>
                <Dashboard />
              </>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
