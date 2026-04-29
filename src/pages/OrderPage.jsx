import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import SubscriptionStatusBanner from "../components/SubscriptionStatusBanner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDays } from "../utils/format.js";

const paymentOptions = [
  { label: "GCash", image: "/img/GCASH.jpg", note: "Scan the GCash QR code." },
  { label: "BPI", image: "/img/BPI.jpg", note: "Use this for bank payment." },
  { label: "GOTYME", image: "/img/GOTYME.jpg", note: "Use this QR if it is easier for you." }
];

export default function OrderPage() {
  const { currentUser, membership, saveReceipt } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("GCash");
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const redirectTo = searchParams.get("redirect") || location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (membership?.membershipStatus === "subscription_active" && currentUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [currentUser, membership?.membershipStatus, navigate, redirectTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      if (!currentUser) {
        navigate(`/login?redirect=${encodeURIComponent("/order")}`);
        return;
      }
      await saveReceipt({ file: receiptFile, paymentMethod });
      setMessage("Receipt uploaded and approved. Your monthly subscription is now active.");
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stack">
      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">Subscription</span>
          <h1>Order page</h1>
          <p>After your 1-day trial, upload your payment receipt here to activate the monthly plan. The upload is auto-approved so you can continue right away.</p>
        </div>
        <SubscriptionStatusBanner />
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Choose a payment QR</h2>
        </div>
        <div className="qr-grid">
          {paymentOptions.map((option) => (
            <button
              key={option.label}
              className={`qr-card ${paymentMethod === option.label ? "selected" : ""}`}
              type="button"
              onClick={() => setPaymentMethod(option.label)}
            >
              <img src={option.image} alt={`${option.label} QR code`} />
              <div>
                <strong>{option.label}</strong>
                <p>{option.note}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Upload receipt</h2>
          <p>{currentUser ? "Upload a screenshot, photo, or PDF receipt." : "Log in first so we can attach the receipt to your account."}</p>
        </div>
        {membership ? (
          <div className="summary-grid">
            <div className="metric">
              <span>Trial left</span>
              <strong>{formatDays(membership.trialDaysLeft)}</strong>
            </div>
            <div className="metric">
              <span>Subscription left</span>
              <strong>{formatDays(membership.subscriptionDaysLeft)}</strong>
            </div>
            <div className="metric">
              <span>Delete in</span>
              <strong>{formatDays(membership.deleteDaysLeft)}</strong>
            </div>
          </div>
        ) : null}
        <form className="receipt-form" onSubmit={handleSubmit}>
          <label>
            Payment method
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              {paymentOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Receipt file
            <input
              accept="image/*,.pdf"
              type="file"
              onChange={(event) => setReceiptFile(event.target.files?.[0] || null)}
              required
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}
          <button className="primary-button full-width" type="submit" disabled={submitting}>
            {submitting ? "Uploading..." : currentUser ? "Upload and activate" : "Log in to upload"}
          </button>
        </form>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>What happens next</h2>
        </div>
        <div className="tips-grid">
          <article>
            <strong>1-day trial</strong>
            <p>You can practice during the free trial after signup.</p>
          </article>
          <article>
            <strong>Monthly plan</strong>
            <p>After payment, the plan stays active for 30 days.</p>
          </article>
          <article>
            <strong>Deletion warning</strong>
            <p>When the month ends, the app shows the deletion countdown.</p>
          </article>
        </div>
      </section>

      <div className="button-row">
        <Link className="secondary-button" to="/dashboard">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
