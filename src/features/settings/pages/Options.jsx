import { useEffect, useState } from "react";
import { getSettingsOptions, saveSettingsOptions } from "../api/optionsApi";
import "./Options.scss";

const Options = () => {
  const [loading, setLoading] = useState(true);

  const [clientId, setClientId] = useState("");

  const [orderRateEditable, setOrderRateEditable] = useState(false);
  const [readPriceCategory, setReadPriceCategory] = useState(false);

  const [priceCodes, setPriceCodes] = useState([]);
  const [defaultPriceCode, setDefaultPriceCode] = useState("");

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [protectedPrices, setProtectedPrices] = useState({});

  // 5️⃣ Remote Punch-In Permission
  const [remotePunchInUsers, setRemotePunchInUsers] = useState([]);

  // 6️⃣ Barcode Based List
  const [barcodeBasedList, setBarcodeBasedList] = useState(false);

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
        setRemotePunchInUsers(data.remote_punchin_users || []);

        // 6️⃣ load barcode option
        setBarcodeBasedList(Boolean(data.barcode_based_list));
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

  const toggleRemotePunchIn = (userId) => {
    setRemotePunchInUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    await saveSettingsOptions({
      order_rate_editable: orderRateEditable,
      read_price_category: readPriceCategory,
      default_price_code: defaultPriceCode,
      protected_price_users: protectedPrices,
      remote_punchin_users: remotePunchInUsers,

      // 6️⃣ send barcode flag
      barcode_based_list: barcodeBasedList,
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
          <h3>2. Read Price Categories From Master</h3>
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

        {/* 5️⃣ Remote Punch-In */}
        <div className="option-card">
          <h3>5. Allow Remote Punch-In</h3>
          <div className="checkbox-list">
            {users.map((u) => (
              <label key={u.id}>
                <input
                  type="checkbox"
                  checked={remotePunchInUsers.includes(u.id)}
                  onChange={() => toggleRemotePunchIn(u.id)}
                />
                {u.username} {u.role ? `(${u.role})` : ""}
              </label>
            ))}
          </div>
        </div>

        {/* 6️⃣ Barcode Based List */}
        <div className="option-card">
          <h3>6. Barcode Based List</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                checked={barcodeBasedList}
                onChange={() => setBarcodeBasedList(true)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                checked={!barcodeBasedList}
                onChange={() => setBarcodeBasedList(false)}
              />
              No
            </label>
          </div>
        </div>

        <button className="save-btn" onClick={handleSave}>
          Save Options
        </button>
      </div>
    </div>
  );
};

export default Options;
