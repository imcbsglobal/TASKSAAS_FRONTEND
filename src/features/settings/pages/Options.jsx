import { useEffect, useState } from "react";
import { getSettingsOptions, saveSettingsOptions } from "../api/optionsApi";
import "./Options.scss";

const Options = () => {
  const [loading, setLoading] = useState(true);

  const [clientId, setClientId] = useState("");

  const [orderRateEditable, setOrderRateEditable] = useState(false);
  const [readPriceCategory, setReadPriceCategory] = useState(false); // ✅ FIX

  const [priceCodes, setPriceCodes] = useState([]);
  const [defaultPriceCode, setDefaultPriceCode] = useState("");

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [protectedPrices, setProtectedPrices] = useState({});

  useEffect(() => {
    getSettingsOptions()
      .then((data) => {
        setClientId(data.client_id);
        setOrderRateEditable(Boolean(data.order_rate_editable));
        setReadPriceCategory(Boolean(data.read_price_category));

        setPriceCodes(data.price_codes || []);
        setUsers(data.users || []);

        setDefaultPriceCode(data.default_price_code || "");
        setProtectedPrices(data.protected_price_users || {});
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleProtectedPrice = (userId, code) => {
    setProtectedPrices((prev) => {
      const current = prev[userId] || [];
      return {
        ...prev,
        [userId]: current.includes(code)
          ? current.filter((c) => c !== code)
          : [...current, code],
      };
    });
  };

  const handleSave = async () => {
    await saveSettingsOptions({
      order_rate_editable: orderRateEditable,
      read_price_category: readPriceCategory,
      default_price_code: defaultPriceCode,
      protected_price_users: protectedPrices,
    });

    alert("Settings saved successfully");
  };

  if (loading) return <div className="loading">Loading</div>;

  return (
    <div className="all-body">
      <div className="options-page">
        <h2>Settings Options</h2>
        <p>
          Client ID <b>{clientId}</b>
        </p>

        {/* 1️⃣ Order Rate Editable */}
        <div className="option-card">
          <h3>1. Order Rate Editable</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                checked={orderRateEditable}
                onChange={() => setOrderRateEditable(true)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                checked={!orderRateEditable}
                onChange={() => setOrderRateEditable(false)}
              />
              No
            </label>
          </div>
        </div>

        {/* 2️⃣ Read Price Category */}
        <div className="option-card">
          <h3>2. Read Price Category</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                checked={readPriceCategory}
                onChange={() => setReadPriceCategory(true)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                checked={!readPriceCategory}
                onChange={() => setReadPriceCategory(false)}
              />
              No
            </label>
          </div>
        </div>

        {/* 3️⃣ Default Price Category */}
        <div className="option-card">
          <h3>3. Default Price Category</h3>

          <div className="checkbox-list">
            {priceCodes.map((p) => (
              <label key={p.code}>
                <input
                  type="radio"
                  name="defaultPrice"
                  checked={defaultPriceCode === p.code}
                  onChange={() => setDefaultPriceCode(p.code)}
                />
                {p.name} ({p.code})
              </label>
            ))}
          </div>
        </div>

        {/* 4️⃣ Hide Cost For Users */}
        <div className="option-card">
          <h3>4. Hide Cost For Users</h3>

          <div className="role-select">
            <label>Select Users</label>
            <select
              multiple
              value={selectedUsers}
              onChange={(e) =>
                setSelectedUsers(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} {u.role ? `(${u.role})` : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedUsers.length === 0 && (
            <div className="empty-text">Select users to configure price access</div>
          )}

          {selectedUsers.map((userId) => (
            <div key={userId} className="user-price-box">
              <h4>User: {userId}</h4>

              <div className="checkbox-list">
                {priceCodes.map((p) => (
                  <label key={p.code}>
                    <input
                      type="checkbox"
                      checked={(protectedPrices[userId] || []).includes(p.code)}
                      onChange={() => toggleProtectedPrice(userId, p.code)}
                    />
                    {p.name} ({p.code})
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="save-btn" onClick={handleSave}>
          Save Options
        </button>
      </div>
    </div>
  );
};

export default Options;
