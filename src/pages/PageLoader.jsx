import React from "react";

const PageLoader= () => {
  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* =========================
             PAGE LOADER WRAPPER
        ========================= */
        .inner-loader {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100vh;
          display: flex;
          z-index: 999999;
          pointer-events: none;
          background: transparent;
        }

        /* LEFT + RIGHT PANELS */
        .inner-loader__left,
        .inner-loader__right {
          width: 50%;
          height: 100%;
          background: #FFFFFF;
          position: relative;
          overflow: hidden;
        }

        .inner-loader__left {
          animation: loaderLeftOpen 1.8s cubic-bezier(0.77, 0, 0.175, 1) forwards;
          animation-delay: 1.6s;
        }

        .inner-loader__right {
          animation: loaderRightOpen 1.8s cubic-bezier(0.77, 0, 0.175, 1) forwards;
          animation-delay: 1.6s;
        }

        /* CENTER LINE */
        .inner-loader__line {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 100%;
          background: rgba(120, 120, 120, 0.35);
          z-index: 3;
          animation: lineFade 0.4s ease forwards;
          animation-delay: 1.8s;
        }

        /* =========================
             CENTER LOGO AREA
        ========================= */
        .inner-loader__brand {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          animation: brandFadeOut 0.5s ease forwards;
          animation-delay: 1.45s;
        }

        /* =========================
             SINGLE LOGO
        ========================= */
        .inner-loader__logo {
          width: clamp(180px, 28vw, 420px);
          max-width: 90%;
          height: auto;
          opacity: 1;
          transform: translateX(50px);
          clip-path: inset(0 100% 0 0);
          animation: logoTextReveal 0.75s ease-out forwards;
          animation-delay: 0.15s;
        }

        /* =========================
             ANIMATIONS
        ========================= */

        @keyframes logoTextReveal {
          0% {
            transform: translateX(50px);
            clip-path: inset(0 100% 0 0);
            opacity: 0.4;
          }

          30% {
            opacity: 1;
          }

          100% {
            transform: translateX(0);
            clip-path: inset(0 0 0 0);
            opacity: 1;
          }
        }

        @keyframes brandFadeOut {
          to {
            opacity: 0;
          }
        }

        @keyframes loaderLeftOpen {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes loaderRightOpen {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes lineFade {
          to {
            opacity: 0;
          }
        }

        /* =========================
             RESPONSIVE
        ========================= */
        @media (max-width: 991px) {
          .inner-loader__logo {
            width: clamp(160px, 45vw, 300px);
          }
        }

        @media (max-width: 767px) {
          .inner-loader__logo {
            width: clamp(140px, 60vw, 240px);
          }

          .inner-loader__line {
            width: 1px;
          }
        }
      `}</style>

      {/* =========================
            GLOBAL INNER PAGE LOADER
      ========================== */}
      <div className="inner-loader">
        <div className="inner-loader__left"></div>
        <div className="inner-loader__right"></div>

        <div className="inner-loader__brand">
          <img
            src="https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/logo.png"
            alt="Main Logo"
            className="inner-loader__logo"
          />
        </div>

        <div className="inner-loader__line"></div>
      </div>
    </>
  );
};

export default PageLoader;