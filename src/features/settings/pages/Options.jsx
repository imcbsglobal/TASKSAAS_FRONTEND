import { useEffect, useState } from "react";
import { getSettingsOptions, saveSettingsOptions } from "../api/optionsApi";
import "./Options.scss";

const Options = () => {
  const [loading, setLoading] = useState(true);

  const [clientId, setClientId] = useState("");
  const [orderRateEditable, setOrderRateEditable] = useState(false);

  const [priceCodes, setPriceCodes] = useState([]);
  const [defaultPriceCodes, setDefaultPriceCodes] = useState([]);

  const [roles, setRoles] = useState([]);
  const [protectedPrices, setProtectedPrices] = useState({});
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    getSettingsOptions()
      .then((data) => {
        console.log("OPTIONS API:", data);

        setClientId(data.client_id);
        setOrderRateEditable(Boolean(data.order_rate_editable));
        setDefaultPriceCodes(data.default_price_codes || []);
        setProtectedPrices(data.protected_price_categories || {});
        setPriceCodes(data.price_codes || []);
        setRoles(data.roles || []);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load settings");
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleDefaultPrice = (code) => {
    setDefaultPriceCodes((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  };

  const toggleProtectedPrice = (code) => {
    if (!selectedRole) return;

    setProtectedPrices((prev) => {
      const current = prev[selectedRole] || [];
      return {
        ...prev,
        [selectedRole]: current.includes(code)
          ? current.filter((c) => c !== code)
          : [...current, code],
      };
    });
  };

  const handleSave = async () => {
    try {
      await saveSettingsOptions({
        order_rate_editable: orderRateEditable,
        default_price_codes: defaultPriceCodes,
        protected_price_categories: protectedPrices,
      });
      alert("Saved successfully");
    } catch {
      alert("Save failed");
    }
  };

  if (loading) return <div className="all-body">Loading...</div>;

  return (
    <div className="all-body">
      <div className="options-page">
        <h2>Settings Options</h2>
        <p>Client ID: <b>{clientId}</b></p>

        <div className="option-card">
          <h3>1. Order Rate Editable</h3>
          <label>
            <input type="radio" checked={orderRateEditable} onChange={() => setOrderRateEditable(true)} /> Yes
          </label>
          <label>
            <input type="radio" checked={!orderRateEditable} onChange={() => setOrderRateEditable(false)} /> No
          </label>
        </div>

        <div className="option-card">
          <h3>2. Default Price Categories</h3>
          {priceCodes.map((p) => (
            <label key={p.code}>
              <input
                type="checkbox"
                checked={defaultPriceCodes.includes(p.code)}
                onChange={() => toggleDefaultPrice(p.code)}
              />
              {p.name} ({p.code})
            </label>
          ))}
        </div>

        <div className="option-card">
          <h3>3. Protected Price Categories</h3>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="">-- Select Role --</option>
            {roles.map((r) => <option key={r}>{r}</option>)}
          </select>

          {selectedRole &&
            priceCodes.map((p) => (
              <label key={p.code}>
                <input
                  type="checkbox"
                  checked={(protectedPrices[selectedRole] || []).includes(p.code)}
                  onChange={() => toggleProtectedPrice(p.code)}
                />
                {p.name} ({p.code})
              </label>
            ))}
        </div>

        <button onClick={handleSave}>Save Options</button>
      </div>
    </div>
  );
};

export default Options;
