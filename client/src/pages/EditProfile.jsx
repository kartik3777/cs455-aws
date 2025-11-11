import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./EditProfile.css";

const EditProfile = () => {
  const user = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "Customer",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setOtpSent(false); // reset OTP if email changes
      setEmailVerified(false);
    }
  };

  const handleSendOtp = () => {
    if (!formData.email) {
      alert("Enter an email first");
      return;
    }
    // TODO: Call API to send OTP
    console.log("Sending OTP to", formData.email);
    setOtpSent(true);
    alert("OTP sent to your email (mock)");
  };

  const handleVerifyOtp = () => {
    // TODO: Verify OTP via backend API
    if (otp === "123456") { // mock OTP for testing
      setEmailVerified(true);
      alert("Email verified successfully!");
    } else {
      alert("Invalid OTP");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otpSent && !emailVerified) {
      alert("Please verify your email with OTP before saving!");
      return;
    }
    console.log("Updated Profile:", formData);
    alert("Profile updated successfully!");
    // TODO: Call API to update profile
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            <button type="button" onClick={handleSendOtp} disabled={emailVerified}>
              {emailVerified ? "Verified" : "Send OTP"}
            </button>
          </div>
        </div>

        {otpSent && !emailVerified && (
          <div className="form-group">
            <label>Enter OTP</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
              <button type="button" onClick={handleVerifyOtp}>
                Verify
              </button>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <input type="text" name="role" value={formData.role} disabled />
        </div>

        <button type="submit" className="save-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
