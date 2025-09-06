import recicon from "@/assets/recicon.png"; // or relative path

export default function FloatingRocket() {
  const openRecommendation = () => {
    window.open("http://localhost:8080/", "_blank"); // new tab
    // or: window.location.href = "http://localhost:8080/"; // same tab
  };

  return (
    <div
      onClick={openRecommendation}
      title="Go to AI Mentor Recommendation"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        cursor: "pointer",
        zIndex: 1000,
        animation: "float 6s infinite ease-in-out",
      }}
    >
      <img
        src={recicon}
        alt="Recommendation Icon"
        style={{
          width: "70px",     // 🔹 make it smaller here
          height: "70px",    // 🔹 adjust size as needed
          objectFit: "contain",
          borderRadius: "50%",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
          transition: "transform 0.3s ease",
        }}
      />
    </div>
  );
}

// 🔹 Global keyframes for floating animation
const style = document.createElement("style");
style.innerHTML = `
@keyframes float {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}
`;
document.head.appendChild(style);
