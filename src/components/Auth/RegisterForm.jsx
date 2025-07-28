import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [error, setError] = useState(null);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const success = await register(name, email, password);
    if (success === true) {
      navigate("/login");
    } else {
      setError(success || "Registration failed. Please try again.");
    }
  };

  const renderInput = (type, value, setValue, label, name) => (
    <div className="relative w-full font-nunito">
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocusedInput(name)}
        onBlur={() => setFocusedInput(null)}
        required
        className="peer w-full px-4 pt-5 pb-2 text-gray-800 bg-white border-2 border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/30 transition font-nunito"
        placeholder={label}
      />
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none font-nunito ${
          value || focusedInput === name
            ? "top-2 text-xs text-[#FFB800]"
            : "top-1/2 -translate-y-1/2 text-base text-gray-500"
        }`}
      >
        {label}
      </label>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] text-gray-800 font-nunito px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl px-8 py-10 shadow-xl animate-fadeInUp">
        <h2 className="text-center text-2xl font-extrabold text-[#1E90FF] mb-8 tracking-wide font-nunito">
          🔋 Create Your Battery Bot Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-nunito">
          {renderInput("text", name, setName, "Full Name", "name")}
          {renderInput("email", email, setEmail, "Email", "email")}
          {renderInput("password", password, setPassword, "Password", "password")}

          {error && (
            <div className="bg-red-100 border border-red-500 text-red-600 px-4 py-2 rounded-md text-sm text-center shadow-sm animate-errorPop font-nunito">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#00E0B8] text-white font-semibold hover:bg-[#00cbb0] transition-all duration-200 shadow-md font-nunito"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6 whitespace-nowrap font-nunito">
          Already have an account?{" "}
          <Link to="/login" className="text-[#FFB800] font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
