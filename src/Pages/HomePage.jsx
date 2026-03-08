import { useState } from "react";

const API_BASE = "http://localhost:3001";

const CONDITIONS = [
  "Sore throat", "Chest pain", "Headache", "Rash", "Fever", "Back pain",
  "Stomach ache", "Earache", "Dizziness", "Shortness of breath",
  "Nausea", "Vomiting", "Diarrhoea", "Cough", "Anxiety", "UTI",
  "Eye infection", "Toothache", "Sprain", "Insect bite",
];

const QUICK_LINKS = [
  "Sore Throat", "Chest Pain", "Rash", "Headache", "Fever", "Back Pain",
];

const HOW_IT_WORKS = [
  { step: "1", title: "Describe your symptoms",   desc: "Tell us what you are experiencing in plain language." },
  { step: "2", title: "Answer a few questions",    desc: "Our chatbot guides you through relevant follow-up questions." },
  { step: "3", title: "Get a recommendation",      desc: "Receive clear, safe guidance on the right care for you." },
  { step: "4", title: "Take action",               desc: "Self-care tips, pharmacy advice, or GP and A&E referral." },
];

function getStatusColor(status) {
  switch (status) {
    case "quiet":     return { bg: "#e8f5e9", text: "#2e7d32", dot: "#43a047" };
    case "moderate":  return { bg: "#fff8e1", text: "#f57f17", dot: "#fbc02d" };
    case "busy":      return { bg: "#fff3e0", text: "#e65100", dot: "#ef6c00" };
    case "very busy": return { bg: "#fce4ec", text: "#b71c1c", dot: "#e53935" };
    default:          return { bg: "#f5f5f5", text: "#555",    dot: "#999"    };
  }
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const [aeData, setAeData] = useState([]);
  const [aeLoading, setAeLoading] = useState(false);
  const [isMockData, setIsMockData] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationAsked, setLocationAsked] = useState(false);
  const [userTown, setUserTown] = useState(null);

  const handleSearch = (val) => {
    setQuery(val);
    setSuggestions(
      val.length > 1
        ? CONDITIONS.filter((c) => c.toLowerCase().includes(val.toLowerCase())).slice(0, 6)
        : []
    );
  };

  const handleSuggestionClick = (s) => {
    setQuery(s);
    setSuggestions([]);
    alert(`Navigate to condition: ${s}`);
  };

  const fetchNearbyAE = () => {
    setAeLoading(true);
    setLocationAsked(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setAeLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `${API_BASE}/api/ae/nearby?lat=${latitude}&lng=${longitude}&radius=40`
          );
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          setAeData(data.hospitals || []);
          setIsMockData(data.isMockData || false);
          if (data.hospitals?.length > 0) setUserTown(data.hospitals[0].town);
        } catch {
          setLocationError("Could not fetch A&E data. Please try again.");
        } finally {
          setAeLoading(false);
        }
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Location access denied. Please enable location in your browser settings."
            : "Could not get your location. Please try again."
        );
        setAeLoading(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div style={{ fontFamily: "'Frutiger', 'Gill Sans', 'Trebuchet MS', sans-serif", background: "#f0f4f5", minHeight: "100vh", color: "#1a1a1a" }}>

      {/* NAV */}
      <nav style={{ background: "#005eb8", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "#fff", color: "#005eb8", fontWeight: "800", fontSize: "1.1rem", padding: "0.25rem 0.6rem", letterSpacing: "-0.5px", borderRadius: "3px" }}>
            NHS
          </div>
          <span style={{ color: "#fff", fontSize: "1rem", fontWeight: "600" }}>Symptom Checker</span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Conditions", "Medicines", "About"].map((item) => (
            <a key={item} href="#" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "0.9rem", fontWeight: "500" }}>
              {item}
            </a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #005eb8 0%, #003d7a 100%)", padding: "4rem 2rem 5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.78rem", fontWeight: "600", padding: "0.3rem 0.9rem", borderRadius: "20px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
            NHS Digital Triage Tool
          </div>

          <h1 style={{ color: "#fff", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "700", lineHeight: 1.2, margin: "0 0 1rem", letterSpacing: "-0.5px" }}>
            Check your symptoms.<br />Get the right care.
          </h1>

          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.05rem", marginBottom: "2.5rem", lineHeight: 1.6 }}>
            Answer a few questions about how you are feeling. We will guide you to the most appropriate care — from self-treatment to A&amp;E.
          </p>

          {/* SEARCH BAR */}
          <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto 2rem" }}>
            <div style={{ display: "flex", background: "#fff", borderRadius: "6px", overflow: "visible", boxShadow: "0 4px 24px rgba(0,0,0,0.2)", border: searchFocused ? "3px solid #ffeb3b" : "3px solid transparent", transition: "border 0.15s", position: "relative" }}>
              <input
                type="text"
                placeholder="Search a symptom or condition..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => { setSearchFocused(false); setTimeout(() => setSuggestions([]), 150); }}
                style={{ flex: 1, border: "none", outline: "none", fontSize: "1rem", padding: "1rem 1rem", fontFamily: "inherit", color: "#1a1a1a", background: "transparent" }}
              />
              <button style={{ background: "#005eb8", color: "#fff", border: "none", padding: "0 1.5rem", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer", fontFamily: "inherit", borderRadius: "0 4px 4px 0" }}>
                Search
              </button>
            </div>

            {suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", borderRadius: "6px", zIndex: 100, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", overflow: "hidden" }}>
                {suggestions.map((s) => (
                  <div
                    key={s}
                    onMouseDown={() => handleSuggestionClick(s)}
                    style={{ padding: "0.75rem 1.25rem", cursor: "pointer", borderBottom: "1px solid #f0f0f0", fontSize: "0.95rem" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f4f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={() => alert("Navigate to /triage")}
            style={{ background: "#ffeb3b", color: "#003d7a", border: "none", padding: "1rem 2.5rem", fontSize: "1.1rem", fontWeight: "700", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", letterSpacing: "0.01em", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)"; }}
          >
            Start Symptom Check
          </button>

          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", marginTop: "1rem" }}>
            Not a diagnostic tool. For emergencies call <strong style={{ color: "#ffeb3b" }}>999</strong>
          </p>
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ background: "#003d7a", height: "6px" }} />
      <div style={{ background: "#005eb8", height: "3px" }} />
      <div style={{ background: "#41b6e6", height: "3px" }} />

      {/* QUICK CONDITION LINKS */}
      <div style={{ background: "#fff", padding: "2.5rem 2rem", borderBottom: "1px solid #d8dde0" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#212b32", marginBottom: "1.25rem" }}>Common conditions</h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {QUICK_LINKS.map((label) => (
              <button
                key={label}
                onClick={() => alert(`Navigate to /conditions/${label.toLowerCase().replace(/ /g, "-")}`)}
                style={{ background: "#f0f4f5", border: "2px solid #d8dde0", borderRadius: "6px", padding: "0.6rem 1.1rem", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: "600", color: "#005eb8", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#005eb8"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#005eb8"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f0f4f5"; e.currentTarget.style.color = "#005eb8"; e.currentTarget.style.borderColor = "#d8dde0"; }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => alert("Navigate to /conditions")}
              style={{ background: "transparent", border: "2px solid #005eb8", borderRadius: "6px", padding: "0.6rem 1.1rem", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: "600", color: "#005eb8", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#005eb8"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#005eb8"; }}
            >
              View all conditions
            </button>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: "3rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: "700", color: "#212b32", marginBottom: "2rem" }}>How it works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} style={{ background: "#fff", borderRadius: "8px", padding: "1.5rem", borderTop: "4px solid #005eb8", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ background: "#005eb8", color: "#fff", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                {step}
              </div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#212b32", margin: "0 0 0.4rem" }}>{title}</h3>
              <p style={{ fontSize: "0.85rem", color: "#4c6272", margin: 0, lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* A&E WAIT TIMES */}
      <div style={{ background: "#212b32", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                <div style={{ width: "10px", height: "10px", background: "#43a047", borderRadius: "50%", animation: "pulse 2s infinite" }} />
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live</span>
              </div>
              <h2 style={{ color: "#fff", fontSize: "1.35rem", fontWeight: "700", margin: 0 }}>
                A&amp;E Waiting Times
                {userTown && <span style={{ fontWeight: "400", fontSize: "1rem", color: "rgba(255,255,255,0.5)", marginLeft: "0.5rem" }}>near {userTown}</span>}
              </h2>
            </div>

            {!locationAsked ? (
              <button
                onClick={fetchNearbyAE}
                style={{ background: "#41b6e6", color: "#fff", border: "none", padding: "0.6rem 1.25rem", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", fontSize: "0.9rem", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#009ac7"}
                onMouseLeave={e => e.currentTarget.style.background = "#41b6e6"}
              >
                Show hospitals near me
              </button>
            ) : !aeLoading ? (
              <button
                onClick={fetchNearbyAE}
                style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.2)", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem" }}
              >
                Refresh
              </button>
            ) : null}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "1.25rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            {[
              { label: "Quiet",     color: "#43a047" },
              { label: "Moderate",  color: "#fbc02d" },
              { label: "Busy",      color: "#ef6c00" },
              { label: "Very Busy", color: "#e53935" },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Loading */}
          {aeLoading && (
            <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>
              Finding hospitals near you...
            </div>
          )}

          {/* Error */}
          {locationError && (
            <div style={{ background: "rgba(229,57,53,0.15)", border: "1px solid rgba(229,57,53,0.3)", borderRadius: "8px", padding: "1rem 1.25rem", marginBottom: "1rem", color: "#ff8a80", fontSize: "0.9rem" }}>
              {locationError}
            </div>
          )}

          {/* Initial prompt */}
          {!locationAsked && !aeLoading && (
            <div style={{ border: "2px dashed rgba(255,255,255,0.15)", borderRadius: "8px", padding: "2.5rem", textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.5)", margin: "0 0 1.25rem", fontSize: "0.95rem" }}>
                Allow location access to see A&amp;E wait times for hospitals near you.
              </p>
              <button
                onClick={fetchNearbyAE}
                style={{ background: "#41b6e6", color: "#fff", border: "none", padding: "0.75rem 1.5rem", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", fontSize: "0.95rem" }}
              >
                Show hospitals near me
              </button>
            </div>
          )}

          {/* Hospital cards */}
          {aeData.length > 0 && !aeLoading && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {aeData.map((hospital) => {
                  const colors = getStatusColor(hospital.status);
                  return (
                    <div
                      key={hospital.id}
                      style={{ background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "1.25rem 1.5rem", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    >
                      <div>
                        <div style={{ color: "#fff", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.25rem", lineHeight: 1.3 }}>
                          {hospital.name}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                          {hospital.distanceKm} km away
                        </div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: colors.bg, color: colors.text, padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: colors.dot, display: "inline-block" }} />
                          {hospital.status}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#fff", fontSize: "1.8rem", fontWeight: "800", lineHeight: 1 }}>
                          {hospital.wait ?? "—"}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem" }}>min wait</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isMockData && (
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginTop: "1rem" }}>
                  Note: Live data currently unavailable. Showing estimated times. For accurate times visit your local trust website.
                </p>
              )}
            </>
          )}

          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", marginTop: "1.25rem" }}>
            If you have a life-threatening emergency, call <strong style={{ color: "#e53935" }}>999</strong> immediately. Do not use this tool.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#003d7a", padding: "2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            {["About", "Privacy policy", "Accessibility", "Contact", "Terms of use"].map(link => (
              <a key={link} href="#" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
              >{link}</a>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", margin: 0 }}>
            2025 NHS Symptom Checker. This tool provides general guidance only and does not constitute medical advice.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}