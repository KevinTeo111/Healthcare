"use client";
import React from "react";

interface SignUpFormProps {
  onSwitchToSignIn?: () => void;
}

export default function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const [message, setMessage] = React.useState<string | null>(null);

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      backgroundImage: "url('/ChatGPT%20Image%20May%2018,%202025,%2011_44_41%20PM.png')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center top",
      backgroundAttachment: "fixed",
      backgroundSize: "cover",
      imageRendering: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Montserrat, Arial, sans-serif",
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    }}>
      <div className="login-container" style={{
        background: "rgba(30, 32, 38, 0.85)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        borderRadius: 24,
        padding: "48px 40px 32px 40px",
        width: 400,
        maxWidth: "90vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div className="logo" style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 12}}>
          <div className="logo-icon" style={{width: 32, height: 32, background: "#6c63ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <span style={{color: "#fff", fontSize: 22, fontWeight: "bold", fontFamily: "Arial, sans-serif"}}>✦</span>
          </div>
          <span className="logo-text" style={{color: "#6c63ff", fontSize: 22, fontWeight: 700, letterSpacing: 1}}>MediCare</span>
        </div>
        <div className="login-title" style={{color: "#fff", fontSize: "2rem", fontWeight: 700, marginBottom: 24, textAlign: "center"}}>Sign Up to MediCare</div>
        <form style={{width: "100%"}} onSubmit={async (e) => {
          e.preventDefault();
          setMessage(null);
          const form = e.currentTarget;
          const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value;
          const email = (form.elements.namedItem('email') as HTMLInputElement).value;
          const password = (form.elements.namedItem('password') as HTMLInputElement).value;
          try {
            const res = await fetch('/api/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fullName, email, password })
            });
            const data = await res.json();
            if (res.ok) {
              // Auto-login: set localStorage and redirect to dashboard
              localStorage.setItem('userName', fullName);
              window.location.href = '/doctor';
            } else {
              setMessage(data.error || 'Registration failed.');
            }
          } catch (err) {
            setMessage('Something went wrong.');
          }
        }}>
          <label className="login-label" htmlFor="fullName" style={{color: "#d1d1d1", fontSize: "0.98rem", marginBottom: 8, marginTop: 18, fontWeight: 500, display: "block"}}>Enter your Name</label>
          <div className="input-group" style={{width: "100%", marginBottom: 8}}>
            <div className="input-wrapper" style={{display: "flex", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: 24, border: "1px solid #444", padding: "0 16px", height: 44}}>
              <span className="input-icon" style={{color: "#bdbdbd", marginRight: 10, fontSize: "1.1rem"}}>👤</span>
              <input type="text" id="fullName" name="fullName" placeholder="Your Name" required style={{background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "1rem", width: "100%", padding: "10px 0"}} />
            </div>
          </div>
          <label className="login-label" htmlFor="email" style={{color: "#d1d1d1", fontSize: "0.98rem", marginBottom: 8, marginTop: 18, fontWeight: 500, display: "block"}}>Enter your E-mail</label>
          <div className="input-group" style={{width: "100%", marginBottom: 8}}>
            <div className="input-wrapper" style={{display: "flex", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: 24, border: "1px solid #444", padding: "0 16px", height: 44}}>
              <span className="input-icon" style={{color: "#bdbdbd", marginRight: 10, fontSize: "1.1rem"}}>@</span>
              <input type="email" id="email" name="email" placeholder="your@email.com" required style={{background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "1rem", width: "100%", padding: "10px 0"}} />
            </div>
          </div>
          <label className="login-label" htmlFor="password" style={{color: "#d1d1d1", fontSize: "0.98rem", marginBottom: 8, marginTop: 18, fontWeight: 500, display: "block"}}>Set your Password</label>
          <div className="input-group" style={{width: "100%", marginBottom: 8}}>
            <div className="input-wrapper" style={{display: "flex", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: 24, border: "1px solid #444", padding: "0 16px", height: 44}}>
              <input type="password" id="password" name="password" placeholder="Password" required style={{background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "1rem", width: "100%", padding: "10px 0"}} />
            </div>
          </div>
          <button className="login-btn" type="submit" style={{width: "100%", background: "#6c63ff", color: "#fff", border: "none", borderRadius: 24, padding: "12px 0", fontSize: "1.1rem", fontWeight: 600, marginTop: 18, marginBottom: 10, cursor: "pointer", transition: "background 0.2s"}}>Sign Up</button>
          {message && (
            <div style={{ color: message.includes('successful') ? '#10b981' : '#f87171', textAlign: 'center', marginTop: 8, fontSize: '1rem', fontWeight: 500 }}>
              {message}
            </div>
          )}
        </form>
        <div className="signup-link" style={{color: "#bdbdbd", fontSize: "0.98rem", textAlign: "center", marginTop: 8}}>
          Already have an Account?
          {onSwitchToSignIn ? (
            <button type="button" onClick={onSwitchToSignIn} style={{color: "#fff", fontSize: "16px", textDecoration: "none", marginLeft: 4, background: "none", border: "none", cursor: "pointer", padding: 0}}>Login</button>
          ) : (
            <a href="/login" style={{color: "#fff", textDecoration: "underline", marginLeft: 4}}>Login</a>
          )}
        </div>
      </div>
    </div>
  );
}
