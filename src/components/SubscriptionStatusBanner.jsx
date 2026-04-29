import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDays } from "../utils/format.js";

export default function SubscriptionStatusBanner() {
  const { currentUser, membership } = useAuth();
  if (!currentUser || !membership || membership.role === "admin") return null;

  if (membership.membershipStatus === "trial_active") {
    return (
      <div className="status-banner status-banner--good">
        <div>
          <strong>Trial active</strong>
          <p>{formatDays(membership.trialDaysLeft)} left in your free trial.</p>
        </div>
        <Link className="secondary-button" to="/order">
          See subscription
        </Link>
      </div>
    );
  }

  if (membership.membershipStatus === "subscription_active") {
    return (
      <div className="status-banner status-banner--good">
        <div>
          <strong>Subscription active</strong>
          <p>{formatDays(membership.subscriptionDaysLeft)} left on your plan.</p>
        </div>
        <Link className="secondary-button" to="/order">
          Renew
        </Link>
      </div>
    );
  }

  if (membership.membershipStatus === "trial_expired") {
    return (
      <div className="status-banner status-banner--warn">
        <div>
          <strong>Trial ended</strong>
          <p>Log in on the order page and upload your payment receipt to continue.</p>
        </div>
        <Link className="secondary-button" to="/order">
          Open order page
        </Link>
      </div>
    );
  }

  if (membership.membershipStatus === "subscription_expired" || membership.membershipStatus === "delete_due") {
    return (
      <div className="status-banner status-banner--danger">
        <div>
          <strong>Deletion warning</strong>
          <p>{formatDays(membership.deleteDaysLeft)} left before this account is removed if no payment is made.</p>
        </div>
        <Link className="secondary-button" to="/order">
          Pay now
        </Link>
      </div>
    );
  }

  return null;
}
