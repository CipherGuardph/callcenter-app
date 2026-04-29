import { useEffect, useState } from "react";
import { getAllMembershipProfiles } from "../services/membership.js";
import { formatDateTime, formatDays } from "../utils/format.js";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getAllMembershipProfiles()
      .then((items) => {
        if (alive) {
          setUsers(items.sort((a, b) => (b.lastSeenAtMs || 0) - (a.lastSeenAtMs || 0)));
        }
      })
      .catch((fetchError) => {
        if (alive) setError(fetchError.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="stack">
      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">Admin</span>
          <h1>Admin dashboard</h1>
          <p>Visible only to `cjquintoph@gmail.com`.</p>
        </div>
        <div className="summary-grid">
          <div className="metric">
            <span>Total users</span>
            <strong>{users.length}</strong>
          </div>
          <div className="metric">
            <span>Subscribed</span>
            <strong>{users.filter((user) => user.membershipStatus === "subscription_active").length}</strong>
          </div>
          <div className="metric">
            <span>Trial active</span>
            <strong>{users.filter((user) => user.membershipStatus === "trial_active").length}</strong>
          </div>
        </div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      <section className="content-section">
        {loading ? (
          <div className="state-card">Loading users...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Logged in</th>
                  <th>Subscribed</th>
                  <th>Trial left</th>
                  <th>Subscription left</th>
                  <th>Delete in</th>
                  <th>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email || user.id}>
                    <td>{user.email || user.id}</td>
                    <td>{user.membershipStatus}</td>
                    <td>{user.isOnline ? "Yes" : "No"}</td>
                    <td>{user.isSubscribed ? "Yes" : "No"}</td>
                    <td>{formatDays(Math.max(0, user.trialDaysLeft || 0))}</td>
                    <td>{formatDays(Math.max(0, user.subscriptionDaysLeft || 0))}</td>
                    <td>{formatDays(Math.max(0, user.deleteDaysLeft || 0))}</td>
                    <td>{formatDateTime(user.lastSeenAtMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
