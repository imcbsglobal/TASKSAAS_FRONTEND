import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Styles (inlined for portability) ────────────────────────────────────────
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

:root {
  --primary:        #4361EE;
  --primary-lt:     #EEF1FE;
  --yellow:         #F7C948;
  --yellow-lt:      #FFFBEB;
  --green:          #2EC4B6;
  --red:            #FF6B6B;
  --purple:         #9B5DE5;
  --bg:             #F4F6FF;
  --card-bg:        #FFFFFF;
  --border:         #E8ECFA;
  --topbar-bg:      #1B1F2E;
  --nav-bg:         #1B1F2E;
  --nav-hover:      rgba(255,255,255,0.07);
  --nav-active:     rgba(67,97,238,0.18);
  --topbar-text:    #FFFFFF;
  --text-1:         #1C2033;
  --text-2:         #5A6480;
  --text-3:         #9CA3AF;
  --shadow:         0 2px 16px rgba(67,97,238,0.08);
  --shadow-md:      0 4px 24px rgba(67,97,238,0.12);
  --r-card:         16px;
  --r-sm:           10px;
  --r-xs:           6px;
  --font:           'Plus Jakarta Sans', system-ui, sans-serif;
  --nav-width:      216px;
  --topbar-height:  46px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text-1);
  -webkit-font-smoothing: antialiased;
  font-size: 13px;
}

button { cursor: pointer; border: none; background: none; font-family: inherit; }
input, select { font-family: inherit; }
a { text-decoration: none; }

.app-shell { display: flex; flex-direction: column; min-height: 100vh; }
.app-body  { display: flex; flex: 1; min-height: 0; }

/* ── Topbar ── */
.db-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: var(--topbar-height);
  padding: 0 16px;
  background: var(--topbar-bg);
  color: var(--topbar-text);
  position: sticky;
  top: 0;
  z-index: 300;
  box-shadow: 0 1px 0 rgba(255,255,255,0.06);
}
.db-topbar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: calc(var(--nav-width) - 16px);
  cursor: pointer;
}
.db-topbar__search {
  flex: 1;
  max-width: 320px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.09);
  border-radius: var(--r-sm);
  padding: 5px 12px;
  border: 1px solid rgba(255,255,255,0.08);
  margin-left: 190px;
}
.db-topbar__search svg { opacity: 0.55; flex-shrink: 0; }
.db-topbar__search input {
  background: none; border: none; outline: none;
  color: #fff; font-size: 13px; width: 100%;
}
.db-topbar__search input::placeholder { color: rgba(255,255,255,0.38); }
.db-topbar__right { margin-left: auto; display: flex; align-items: center; gap: 10px; }

.brand-logo {
  width: 32px; height: 32px; border-radius: 9px;
  background: linear-gradient(135deg, #4361EE, #7c3aed);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px; color: #fff; flex-shrink: 0;
}
.brand-texts { display: flex; flex-direction: column; line-height: 1.2; }
.brand-name  { font-size: 12px; font-weight: 700; color: #fff; }
.brand-sub   { font-size: 9.5px; font-weight: 500; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.8px; }

.sync-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }

.tb-icon-btn {
  position: relative; color: var(--topbar-text);
  padding: 6px; border-radius: var(--r-xs);
  display: flex; align-items: center; transition: background 0.15s;
}
.tb-icon-btn:hover { background: rgba(255,255,255,0.1); }
.tb-badge {
  position: absolute; top: 1px; right: 1px;
  width: 14px; height: 14px; border-radius: 50%;
  background: #ef4444; color: #fff;
  font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.tb-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--purple));
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
}

/* ── Left Nav ── */
.db-nav {
  width: var(--nav-width); flex-shrink: 0;
  background: var(--nav-bg); color: #fff;
  display: flex; flex-direction: column;
  overflow-y: auto; overflow-x: hidden;
  position: sticky; top: var(--topbar-height);
  height: calc(100vh - var(--topbar-height));
  border-right: 1px solid rgba(255,255,255,0.05);
}
@media (max-width: 900px) { .db-nav { display: none; } }

.nav-items-wrap { padding: 8px 6px 4px; }
.nav-section {
  padding: 12px 10px 4px; font-size: 9.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.3);
}
.nav-item {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 12px; border-radius: var(--r-xs);
  margin: 1px 0; cursor: pointer;
  font-size: 12.5px; font-weight: 500;
  color: rgba(255,255,255,0.65);
  transition: background 0.15s, color 0.15s;
  user-select: none;
}
.nav-item:hover { background: var(--nav-hover); color: rgba(255,255,255,0.9); }
.nav-item.active { background: var(--nav-active); color: #fff; font-weight: 600; }
.nav-item.active .nav-item__icon { color: var(--primary); }
.nav-item__icon { width: 18px; height: 18px; flex-shrink: 0; color: rgba(255,255,255,0.45); }
.nav-item__label { flex: 1; }
.nav-item__chevron { margin-left: auto; width: 13px; height: 13px; color: rgba(255,255,255,0.3); }

.nav-spacer { flex: 1; }
.nav-footer { padding: 12px 10px; border-top: 1px solid rgba(255,255,255,0.07); }
.nav-user {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: var(--r-sm);
  cursor: pointer; transition: background 0.15s;
}
.nav-user:hover { background: var(--nav-hover); }
.nav-user__avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--purple));
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0;
}
.nav-user__info  { flex: 1; min-width: 0; }
.nav-user__name  { font-size: 12px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nav-user__role  { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
.nav-user__exit  { color: rgba(255,255,255,0.35); flex-shrink: 0; }

/* ── Content ── */
.db-content { flex: 1; min-width: 0; display: flex; overflow: hidden; border-left: 1.5px solid var(--border); }

.db-main {
  flex: 1; min-width: 0;
  padding: 28px 32px 40px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 20px;
}
@media (max-width: 768px) { .db-main { padding: 16px 16px 32px; } }

/* ── Page Header ── */
.db-page-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1.5px solid var(--border);
  margin-bottom: 4px;
}
.db-greeting { font-size: 22px; font-weight: 800; color: var(--text-1); letter-spacing: -0.5px; }
.db-subtext  { font-size: 13px; color: var(--text-3); margin-top: 3px; }

/* ── KPI Row ── */
.kpi-row {
  display: grid; grid-template-columns: repeat(4,1fr); gap: 16px;
}
@media (max-width: 900px) { .kpi-row { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 480px) { .kpi-row { grid-template-columns: 1fr; } }

.kpi-card {
  background: var(--yellow-lt);
  border: 1.5px solid #F0E6A0;
  border-radius: var(--r-card);
  padding: 18px 20px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  transition: box-shadow 0.2s, transform 0.2s; cursor: default;
}
.kpi-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.kpi-card--blue {
  background: linear-gradient(135deg, #4361EE 0%, #3a0ca3 100%);
  border-color: transparent;
}
.kpi-card--blue .kpi-card__value { color: #fff; }
.kpi-card--blue .kpi-card__label { color: rgba(255,255,255,0.8); }
.kpi-card--blue .kpi-card__sub   { color: rgba(255,255,255,0.6); }
.kpi-card--blue .kpi-card__icon-wrap { background: rgba(255,255,255,0.2); color: #fff; border-color: rgba(255,255,255,0.2); }

.kpi-card__left  { flex: 1; min-width: 0; }
.kpi-card__value { font-size: 26px; font-weight: 800; color: var(--text-1); letter-spacing: -1px; line-height: 1.1; white-space: nowrap; }
.kpi-card__label { font-size: 12px; font-weight: 600; color: var(--text-2); margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.kpi-card__sub   { font-size: 11px; color: var(--text-3); margin-top: 2px; }
.kpi-card__icon-wrap {
  width: 38px; height: 38px; flex-shrink: 0; border-radius: 50%;
  border: 2px solid #E8D97A;
  display: flex; align-items: center; justify-content: center; color: var(--text-2);
}

/* ── Charts Row ── */
.db-charts-row { display: grid; grid-template-columns: 3fr 2fr; gap: 16px; }
@media (max-width: 800px) { .db-charts-row { grid-template-columns: 1fr; } }

.chart-card {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: var(--r-card);
  padding: 18px 20px 14px;
  box-shadow: var(--shadow);
}
.chart-card__head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px; gap: 8px;
}
.chart-card__title { font-size: 13.5px; font-weight: 700; color: var(--text-1); letter-spacing: -0.2px; }
.chart-card__actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.chart-badge       { background: var(--primary-lt); color: var(--primary); font-size: 10.5px; font-weight: 600; padding: 3px 10px; border-radius: 50px; white-space: nowrap; }
.chart-total-badge { background: #F3F4F6; color: var(--text-2); font-size: 10.5px; font-weight: 600; padding: 3px 10px; border-radius: 50px; }
.axis-label        { text-align: center; font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-3); margin-top: 6px; }

/* ── Donut ── */
.donut-wrap        { display: flex; flex-direction: column; gap: 12px; }
.donut-chart-area  { position: relative; }
.donut-center      { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; pointer-events: none; }
.donut-total       { display: block; font-size: 22px; font-weight: 800; color: var(--text-1); line-height: 1; }
.donut-label       { font-size: 10px; color: var(--text-3); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.donut-legend      { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dl-item           { display: flex; align-items: center; gap: 6px; font-size: 11.5px; }
.dl-dot            { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dl-name           { color: var(--text-2); flex: 1; font-weight: 500; }
.dl-val            { font-weight: 700; color: var(--text-1); }

/* ── Tooltip ── */
.chart-tooltip       { background: var(--topbar-bg); color: #fff; border-radius: 8px; padding: 8px 12px; font-size: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
.chart-tooltip__label{ font-size: 11px; font-weight: 600; opacity: 0.65; margin-bottom: 4px; }

/* ── Table ── */
.table-card { background: var(--card-bg); border: 1.5px solid var(--border); border-radius: var(--r-card); box-shadow: var(--shadow); overflow: hidden; }
.table-card__head  { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 12px; border-bottom: 1px solid var(--border); }
.table-card__title { font-size: 13.5px; font-weight: 700; color: var(--text-1); }
.tbl-wrap          { overflow-x: auto; -webkit-overflow-scrolling: touch; }

.data-tbl          { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.data-tbl thead th { background: #F8F9FF; padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-3); white-space: nowrap; border-bottom: 1px solid var(--border); }
.data-tbl tbody tr { border-bottom: 1px solid #F5F6FA; transition: background 0.12s; }
.data-tbl tbody tr:hover { background: var(--primary-lt); }
.data-tbl tbody tr:last-child { border-bottom: none; }
.data-tbl tbody td { padding: 11px 16px; color: var(--text-2); vertical-align: middle; }

.td-idx    { color: var(--text-3); font-weight: 600; width: 40px; }
.td-id     { font-weight: 700; color: var(--primary); font-size: 12px; font-family: monospace; }
.td-name   { font-weight: 600; color: var(--text-1); }
.td-date   { white-space: nowrap; }
.td-amount { font-weight: 700; color: var(--text-1); white-space: nowrap; }
.td-empty  { text-align: center; color: var(--text-3); padding: 32px 0; font-size: 13px; }

.area-chip { background: var(--primary-lt); color: var(--primary); font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 50px; white-space: nowrap; }

.status-badge { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 50px; white-space: nowrap; }
.badge--completed { background: #ECFDF5; color: #059669; }
.badge--pending   { background: #FFFBEB; color: #B45309; }
.badge--uploaded  { background: var(--primary-lt); color: var(--primary); }
.badge--other     { background: #F3F4F6; color: var(--text-2); }

.link-all { font-size: 12px; font-weight: 600; color: var(--primary); }
.link-all:hover { text-decoration: underline; }
.link-sm  { font-size: 11.5px; font-weight: 600; color: var(--primary); }
.link-sm:hover { text-decoration: underline; }

/* ── Skeleton ── */
.skel-wrap { padding: 16px; }
.skel-row  { height: 38px; background: linear-gradient(90deg,#EEF0F8 25%,#F8F9FF 50%,#EEF0F8 75%); background-size: 200% 100%; border-radius: var(--r-xs); margin-bottom: 10px; animation: shimmer 1.4s infinite; }
.skel-row--sm { height: 28px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Right Sidebar ── */
.db-sidebar {
  width: 300px; flex-shrink: 0;
  border-left: 1.5px solid var(--border);
  background: var(--card-bg);
  overflow-y: auto;
  display: flex; flex-direction: column;
}
@media (max-width: 1100px) { .db-sidebar { display: none; } }

.sb-card { padding: 20px; border-bottom: 1.5px solid var(--border); }
.sb-card__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.sb-card__head h4 { font-size: 13px; font-weight: 700; color: var(--text-1); }

/* ── Mini Calendar ── */
.mini-cal__header    { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.mini-cal__month     { font-size: 13px; font-weight: 700; color: var(--text-1); }
.mini-cal__nav       { display: flex; gap: 4px; }
.mini-cal__nav button {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--bg); color: var(--text-2);
  font-size: 15px; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.mini-cal__nav button:hover { background: var(--primary); color: #fff; }
.mini-cal__grid    { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
.mini-cal__dayname { text-align: center; font-size: 10px; font-weight: 700; color: var(--text-3); text-transform: uppercase; padding: 4px 0 6px; }
.mini-cal__day {
  text-align: center; font-size: 12px; font-weight: 500; color: var(--text-2);
  padding: 5px 2px; border-radius: 50%; cursor: pointer;
  transition: background 0.12s, color 0.12s;
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
}
.mini-cal__day:not(.empty):hover { background: var(--primary-lt); color: var(--primary); }
.mini-cal__day.today { background: var(--primary); color: #fff; font-weight: 800; box-shadow: 0 2px 8px rgba(67,97,238,0.4); }
.mini-cal__day.empty { cursor: default; }

/* ── Events ── */
.event-list  { display: flex; flex-direction: column; gap: 10px; }
.event-item  { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background: var(--bg); border-radius: var(--r-sm); border-left: 3px solid var(--primary); }
.event-dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.event-body  { flex: 1; min-width: 0; }
.event-title { font-size: 12px; font-weight: 600; color: var(--text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.event-sub   { font-size: 10.5px; color: var(--text-3); margin-top: 2px; }

/* ── Debtors ── */
.debtor-list  { display: flex; flex-direction: column; gap: 10px; }
.debtor-item  { display: flex; align-items: center; gap: 10px; }
.debtor-avatar{ width: 32px; height: 32px; border-radius: 50%; color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.debtor-info  { flex: 1; min-width: 0; }
.debtor-name  { font-size: 12.5px; font-weight: 600; color: var(--text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.debtor-area  { font-size: 10.5px; color: var(--text-3); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.debtor-bal   { font-size: 12px; font-weight: 700; color: var(--red); white-space: nowrap; }
.debtor-total { margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border); font-size: 11.5px; color: var(--text-2); text-align: right; }
.debtor-total strong { color: var(--text-1); }

.empty-sm { text-align: center; font-size: 12px; color: var(--text-3); padding: 12px 0; }

.recharts-legend-item-text { font-size: 10px !important; color: var(--text-2) !important; }
.recharts-tooltip-wrapper  { outline: none !important; }
.recharts-cartesian-axis-tick-value { font-family: var(--font) !important; }
`;

// ─── Static chart data ────────────────────────────────────────────────────────
const revenueByMonth = [
  { month: "Jun'20", value: 950000 },
  { month: "Jul'20", value: 850000 },
  { month: "Aug'20", value: 720000 },
  { month: "Sep'20", value: 600000 },
  { month: "Oct'20", value: 480000 },
  { month: "Nov'20", value: 450000 },
  { month: "Dec'20", value: 500000 },
  { month: "Jan'21", value: 590000 },
  { month: "Feb'21", value: 681500 },
  { month: "Mar'21", value: 680000 },
  { month: "Apr'21", value: 750000 },
  { month: "May'21", value: 820000 },
];

const PIE_COLORS    = ["#4361EE", "#F7C948", "#2EC4B6", "#FF6B6B"];
const DEBTOR_COLORS = ["#4361EE", "#F7C948", "#2EC4B6", "#FF6B6B", "#9B5DE5", "#06D6A0"];

const NAV_ITEMS = [
  { label: "Dashboard",        icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "Order Reports",    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" },
  { label: "Sales Details",    icon: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" },
  { label: "Sales Return",     icon: "M19 12H5M12 19l-7-7 7-7" },
  { label: "Collections",      icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { label: "Statements",       icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  { label: "Punch In",         icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6v-4m0 0V8m0 4h4m-4 0H8", hasChevron: true },
  { label: "Master",           icon: "M4 6h16M4 12h16M4 18h16", hasChevron: true },
  { label: "User Settings",    icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", hasChevron: true },
  { label: "Firm Information", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", hasChevron: true },
  { label: "Settings",         icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4m0 4h.01", hasChevron: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) =>
  v == null ? "—"
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";

const statusClass = (s = "") => {
  const l = s.toLowerCase();
  if (l.includes("completed")) return "badge--completed";
  if (l.includes("pending"))   return "badge--pending";
  if (l.includes("uploaded"))  return "badge--uploaded";
  return "badge--other";
};

const getInitials = (name = "") =>
  name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() || "").slice(0, 2).join("");

const getDebtorArea = (d) =>
  d.area || d.city || d.place || d.district || d.location || d.town || "—";

// ─── Mini Calendar ────────────────────────────────────────────────────────────
const MiniCalendar = () => {
  const today = new Date();
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const startDay    = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
  const monthLabel  = view.toLocaleString("default", { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d === today.getDate() &&
    view.getMonth() === today.getMonth() &&
    view.getFullYear() === today.getFullYear();

  return (
    <div className="mini-cal">
      <div className="mini-cal__header">
        <span className="mini-cal__month">{monthLabel}</span>
        <div className="mini-cal__nav">
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>‹</button>
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>›</button>
        </div>
      </div>
      <div className="mini-cal__grid">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} className="mini-cal__dayname">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className={["mini-cal__day", !d ? "empty" : "", isToday(d) ? "today" : ""].join(" ")}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, blue }) => (
  <div className={`kpi-card${blue ? " kpi-card--blue" : ""}`}>
    <div className="kpi-card__left">
      <div className="kpi-card__value">{value}</div>
      <div className="kpi-card__label">{label}</div>
      {sub && <div className="kpi-card__sub">{sub}</div>}
    </div>
    <div className="kpi-card__icon-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
        <polyline points="7 17 17 7" /><polyline points="7 7 17 7 17 17" />
      </svg>
    </div>
  </div>
);

// ─── Chart Card ───────────────────────────────────────────────────────────────
const ChartCard = ({ title, badge, extra, children }) => (
  <div className="chart-card">
    <div className="chart-card__head">
      <h3 className="chart-card__title">{title}</h3>
      <div className="chart-card__actions">
        {badge && <span className="chart-badge">{badge}</span>}
        {extra}
      </div>
    </div>
    {children}
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

const SkeletonRows = ({ count = 5, sm = false }) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} className={`skel-row${sm ? " skel-row--sm" : ""}`} />
  ));

// ─── Left Nav ─────────────────────────────────────────────────────────────────
const LeftNav = ({ user }) => {
  const [active, setActive] = useState("Dashboard");
  return (
    <nav className="db-nav">
      <div className="nav-items-wrap">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className={`nav-item${active === item.label ? " active" : ""}`}
            onClick={() => setActive(item.label)}
          >
            <svg className="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="nav-item__label">{item.label}</span>
            {item.hasChevron && (
              <svg className="nav-item__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <div className="nav-spacer" />
      <div className="nav-footer">
        <div className="nav-user">
          <div className="nav-user__avatar">{getInitials(user?.name) || "?"}</div>
          <div className="nav-user__info">
            <div className="nav-user__name">{user?.name || "..."}</div>
            <div className="nav-user__role">{user?.role || "Admin"}</div>
          </div>
          <svg className="nav-user__exit" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </nav>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [orders,  setOrders]  = useState([]);
  const [debtors, setDebtors] = useState([]);
  const [loadO,   setLoadO]   = useState(true);
  const [loadD,   setLoadD]   = useState(true);
  const [user,    setUser]    = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user") || localStorage.getItem("userData");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser({
          name: parsed.full_name || parsed.name || `${parsed.first_name || ""} ${parsed.last_name || ""}`.trim() || parsed.username || "User",
          role: parsed.role || parsed.user_type || parsed.group || "Admin",
        });
        return;
      }
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          name: payload.full_name || payload.name || `${payload.first_name || ""} ${payload.last_name || ""}`.trim() || payload.username || payload.user || "User",
          role: payload.role || payload.user_type || payload.group || "Admin",
        });
      }
    } catch (e) {
      setUser({ name: "User", role: "Admin" });
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const res = await fetch("https://tasksas.com/api/item-orders/list-all", {
          headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        });
        const d = await res.json();
        if (d.success) setOrders(d.orders || []);
      } catch (e) {
        console.error("Orders fetch error:", e);
      } finally {
        setLoadO(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const res = await fetch("https://tasksas.com/api/debtors/get-debtors/", {
          headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        });
        const d = await res.json();
        if (d.success && Array.isArray(d.data)) {
          setDebtors(d.data.filter((x) => x.super_code === "DEBTO"));
        }
      } catch (e) {
        console.error("Debtors fetch error:", e);
      } finally {
        setLoadD(false);
      }
    })();
  }, []);

  const totalOrders  = orders.length;
  const recentOrders = useMemo(() => orders.slice(0, 7), [orders]);
  const topDebtors   = useMemo(
    () => [...debtors].sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 6),
    [debtors]
  );

  const statusCounts = useMemo(() => {
    const c = { completed: 0, pending: 0, uploaded: 0, other: 0 };
    orders.forEach((o) => {
      const s = (o.status || "").toLowerCase();
      if (s.includes("completed"))     c.completed++;
      else if (s.includes("pending"))  c.pending++;
      else if (s.includes("uploaded")) c.uploaded++;
      else                             c.other++;
    });
    return c;
  }, [orders]);

  const pieData = [
    { name: "Completed", value: statusCounts.completed || 12 },
    { name: "Pending",   value: statusCounts.pending   || 8  },
    { name: "Uploaded",  value: statusCounts.uploaded  || 5  },
    { name: "Other",     value: statusCounts.other     || 3  },
  ];
  const totalPie = pieData.reduce((s, x) => s + x.value, 0);

  const totalDebtorBalance = useMemo(
    () => debtors.reduce((s, d) => s + (d.balance || 0), 0),
    [debtors]
  );

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">

        {/* ══ TOPBAR ══ */}
        <header className="db-topbar">
          <div className="db-topbar__brand">
            <div className="brand-logo">T</div>
            <div className="brand-texts">
              <span className="brand-name">Task SAS</span>
              <span className="brand-sub">Management Portal</span>
            </div>
          </div>

          <div className="db-topbar__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Search..." />
          </div>

          <div className="db-topbar__right">
            <div className="sync-dot" />
            <button className="tb-icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="tb-badge">3</span>
            </button>
            <div className="tb-avatar">{getInitials(user?.name) || "?"}</div>
          </div>
        </header>

        {/* ══ BODY ══ */}
        <div className="app-body">
          <LeftNav user={user} />

          <div className="db-content">

            {/* ── MAIN ── */}
            <main className="db-main">

              <div className="db-page-header">
                <div>
                  <h1 className="db-greeting">Welcome, {user?.name || "..."} 👋</h1>
                  <p className="db-subtext">Here's your business overview for today.</p>
                </div>
              </div>

              {/* KPI row */}
              <div className="kpi-row">
                <KpiCard label="Revenue"    value={`₹${(revenueByMonth[revenueByMonth.length - 1].value / 1000).toFixed(0)}K`} sub="May '21" />
                <KpiCard label="Gross Profit" value="202.44%" sub="Jun '21" />
                <KpiCard label="Net Profit"   value="₹203K"   sub="Jun '21" />
                <KpiCard label="Net Profit %" value="5,983%"  sub="Jun '21" blue />
              </div>

              {/* Charts row */}
              <div className="db-charts-row">
                <ChartCard title="Revenue by Month" badge="Last 12 Months">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={revenueByMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#4361EE" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#4361EE" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#EEF0F6" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={(v) => v >= 1000000 ? `₹${(v/1000000).toFixed(0)}m` : v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`}
                        tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip prefix="₹" />} />
                      <Area type="monotone" dataKey="value" name="Revenue" stroke="#4361EE" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#4361EE", strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="axis-label">MONTH</p>
                </ChartCard>

                <ChartCard title="Order Status" extra={<span className="chart-total-badge">{totalOrders || 33} Orders</span>}>
                  <div className="donut-wrap">
                    <div className="donut-chart-area">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                          </Pie>
                          <Tooltip formatter={(v, n) => [v, n]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="donut-center">
                        <span className="donut-total">{totalPie}</span>
                        <span className="donut-label">Total</span>
                      </div>
                    </div>
                    <div className="donut-legend">
                      {pieData.map((entry, i) => (
                        <div key={i} className="dl-item">
                          <span className="dl-dot" style={{ background: PIE_COLORS[i] }} />
                          <span className="dl-name">{entry.name}</span>
                          <span className="dl-val">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ChartCard>
              </div>

              {/* Recent Orders table */}
              <div className="table-card">
                <div className="table-card__head">
                  <h3 className="table-card__title">Recent Orders</h3>
                  <a className="link-all" href="#">View All →</a>
                </div>
                {loadO ? (
                  <div className="skel-wrap"><SkeletonRows count={5} /></div>
                ) : (
                  <div className="tbl-wrap">
                    <table className="data-tbl">
                      <thead>
                        <tr>
                          <th>#</th><th>Order ID</th><th>Customer</th>
                          <th>Date</th><th>Area</th><th>Amount</th><th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.length > 0 ? (
                          recentOrders.map((o, i) => (
                            <tr key={o.order_id || i}>
                              <td className="td-idx">{i + 1}</td>
                              <td className="td-id">{o.order_id}</td>
                              <td className="td-name">{o.customer_name}</td>
                              <td className="td-date">{fmtDate(o.created_date)}</td>
                              <td>{o.area ? <span className="area-chip">{o.area}</span> : "—"}</td>
                              <td className="td-amount">{fmt(o.items?.reduce((s, it) => s + (it.amount || 0), 0))}</td>
                              <td><span className={`status-badge ${statusClass(o.status)}`}>{o.status || "—"}</span></td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={7} className="td-empty">No orders found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </main>

            {/* ── RIGHT SIDEBAR (no profile card) ── */}
            <aside className="db-sidebar">

              {/* Calendar */}
              <div className="sb-card">
                <MiniCalendar />
              </div>

              {/* Upcoming orders */}
              <div className="sb-card">
                <div className="sb-card__head">
                  <h4>Upcoming Orders</h4>
                  <a className="link-sm" href="#">see all</a>
                </div>
                {loadO ? (
                  <SkeletonRows count={3} sm />
                ) : (
                  <div className="event-list">
                    {recentOrders.slice(0, 3).map((o, i) => (
                      <div key={i} className="event-item">
                        <div className="event-dot" style={{ background: PIE_COLORS[i % 4] }} />
                        <div className="event-body">
                          <div className="event-title">{o.customer_name}</div>
                          <div className="event-sub">{fmtDate(o.created_date)} · {o.area || "—"}</div>
                        </div>
                        <span className={`status-badge ${statusClass(o.status)}`}>{o.status || "—"}</span>
                      </div>
                    ))}
                    {recentOrders.length === 0 && <div className="empty-sm">No orders</div>}
                  </div>
                )}
              </div>

              {/* Top debtors */}
              <div className="sb-card">
                <div className="sb-card__head">
                  <h4>Top Debtors</h4>
                  <a className="link-sm" href="#">see all</a>
                </div>
                {loadD ? (
                  <SkeletonRows count={4} sm />
                ) : (
                  <>
                    <div className="debtor-list">
                      {topDebtors.map((d, i) => (
                        <div key={d.code || i} className="debtor-item">
                          <div className="debtor-avatar" style={{ background: DEBTOR_COLORS[i % DEBTOR_COLORS.length] }}>
                            {(d.name || "?")[0].toUpperCase()}
                          </div>
                          <div className="debtor-info">
                            <div className="debtor-name">{d.name}</div>
                            <div className="debtor-area">{getDebtorArea(d)}</div>
                          </div>
                          <div className="debtor-bal">
                            {d.balance != null
                              ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(d.balance)
                              : "—"}
                          </div>
                        </div>
                      ))}
                      {topDebtors.length === 0 && <div className="empty-sm">No debtor data</div>}
                    </div>
                    {totalDebtorBalance > 0 && (
                      <div className="debtor-total">
                        Total Outstanding: <strong>{fmt(totalDebtorBalance)}</strong>
                      </div>
                    )}
                  </>
                )}
              </div>

            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;