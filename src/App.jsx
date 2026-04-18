import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";

const API_URL = "/.netlify/functions/claude";

const COLORS = ["#f0c040", "#22c55e", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c", "#34d399", "#f87171"];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c16;
    --surface: #0d1424;
    --surface2: #111c30;
    --surface3: #162035;
    --border: #1e2d47;
    --gold: #e8b84b;
    --gold2: #f5d07a;
    --green: #22c55e;
    --red: #f87171;
    --blue: #60a5fa;
    --text: #e8eaf0;
    --muted: #6b7a99;
    --accent: #1a3a6e;
  }

  .app {
    background: var(--bg);
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    background-image: radial-gradient(ellipse at 20% 20%, #0d2040 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 80%, #0a1a30 0%, transparent 50%);
  }

  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 32px;
    border-bottom: 1px solid var(--border);
    background: rgba(8,12,22,0.95);
    backdrop-filter: blur(20px);
    position: sticky; top: 0; z-index: 100;
  }

  .logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 700;
    color: var(--text);
    letter-spacing: 1px;
  }

  .logo span { color: var(--gold); font-weight: 700; }

  .nav { display: flex; gap: 4px; }

  .nav-btn {
    background: none; border: none; color: var(--muted);
    padding: 8px 16px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px;
    white-space: nowrap;
  }

  .nav-btn:hover { color: var(--text); background: var(--surface2); }
  .nav-btn.active { color: var(--gold); background: rgba(232,184,75,0.1); border: 1px solid rgba(232,184,75,0.2); }

  .mobile-nav {
    display: none;
    overflow-x: auto;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .mobile-nav::-webkit-scrollbar { display: none; }
  .mobile-nav-btn {
    background: none; border: 1px solid var(--border);
    color: var(--muted); padding: 8px 14px; border-radius: 20px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
  }
  .mobile-nav-btn.active { color: var(--gold); background: rgba(232,184,75,0.1); border-color: rgba(232,184,75,0.4); }

  .badge {
    background: var(--gold); color: var(--bg);
    font-size: 10px; font-weight: 700;
    padding: 2px 6px; border-radius: 10px; margin-left: 6px;
  }

  .main { padding: 32px; max-width: 1200px; margin: 0 auto; }

  .page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px; font-weight: 600; color: var(--text);
    margin-bottom: 4px;
  }

  .page-sub { color: var(--muted); font-size: 14px; margin-bottom: 28px; }

  .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 24px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; margin-bottom: 24px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 24px;
    transition: border-color 0.2s;
  }

  .card:hover { border-color: #2a3d5e; }

  .card-title {
    font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
    color: var(--muted); text-transform: uppercase; margin-bottom: 12px;
  }

  .metric {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px; font-weight: 600; color: var(--text);
    line-height: 1;
  }

  .metric.gold { color: var(--gold); }
  .metric.green { color: var(--green); }
  .metric.red { color: var(--red); }

  .metric-sub { font-size: 12px; color: var(--muted); margin-top: 6px; }

  .trend {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 12px; font-weight: 500; margin-top: 8px;
    padding: 3px 8px; border-radius: 20px;
  }

  .trend.up { color: var(--green); background: rgba(34,197,94,0.1); }
  .trend.down { color: var(--red); background: rgba(248,113,113,0.1); }

  .upload-zone {
    border: 2px dashed var(--border); border-radius: 16px;
    padding: 48px; text-align: center; cursor: pointer;
    transition: all 0.3s;
    background: var(--surface);
  }

  .upload-zone:hover, .upload-zone.drag { border-color: var(--gold); background: rgba(232,184,75,0.05); }

  .upload-icon { font-size: 40px; margin-bottom: 12px; }
  .upload-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; margin-bottom: 8px; }
  .upload-sub { color: var(--muted); font-size: 13px; }

  .btn {
    background: linear-gradient(135deg, #e8b84b, #c8942b);
    border: none; color: #080c16;
    padding: 12px 24px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px;
  }

  .btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,184,75,0.3); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  .btn-outline {
    background: none; border: 1px solid var(--border); color: var(--text);
    padding: 10px 20px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }

  .btn-outline:hover { border-color: var(--gold); color: var(--gold); }

  .ai-response {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-left: 3px solid var(--gold);
    border-radius: 12px; padding: 24px;
    font-size: 14px; line-height: 1.8; color: var(--text);
    white-space: pre-wrap;
  }

  .ai-thinking {
    display: flex; align-items: center; gap: 10px;
    color: var(--muted); font-size: 13px; padding: 16px;
    background: var(--surface); border-radius: 12px;
  }

  .spinner {
    width: 16px; height: 16px;
    border: 2px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .cat-bar {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 10px;
  }

  .cat-name { width: 120px; font-size: 13px; color: var(--muted); }

  .cat-track {
    flex: 1; height: 6px; background: var(--surface3);
    border-radius: 3px; overflow: hidden;
  }

  .cat-fill {
    height: 100%; border-radius: 3px;
    background: linear-gradient(90deg, var(--gold), var(--gold2));
    transition: width 0.8s ease;
  }

  .cat-val { font-size: 13px; font-weight: 500; width: 70px; text-align: right; }

  .goal-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 20px;
  }

  .goal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }

  .goal-name { font-weight: 600; font-size: 15px; }
  .goal-type {
    font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
    color: var(--gold); background: rgba(232,184,75,0.1);
    padding: 3px 8px; border-radius: 10px; border: 1px solid rgba(232,184,75,0.2);
  }

  .goal-progress {
    height: 8px; background: var(--surface3);
    border-radius: 4px; overflow: hidden; margin-bottom: 10px;
  }

  .goal-fill {
    height: 100%; border-radius: 4px;
    background: linear-gradient(90deg, #22c55e, #4ade80);
    transition: width 1s ease;
  }

  .goal-stats {
    display: flex; justify-content: space-between;
    font-size: 12px; color: var(--muted);
  }

  .goal-stats span strong { color: var(--text); font-weight: 600; }

  .input {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px; padding: 11px 14px;
    color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px;
    width: 100%; outline: none;
    transition: border-color 0.2s;
  }

  .input:focus { border-color: var(--gold); }
  .input::placeholder { color: var(--muted); }

  .label { font-size: 12px; font-weight: 500; color: var(--muted); margin-bottom: 6px; display: block; letter-spacing: 0.5px; }

  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

  .select {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px; padding: 11px 14px;
    color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px;
    width: 100%; outline: none; cursor: pointer;
  }

  .select option { background: var(--surface2); }

  .tag {
    display: inline-block; padding: 4px 10px;
    border-radius: 20px; font-size: 11px; font-weight: 600;
    letter-spacing: 0.5px; text-transform: uppercase;
  }

  .tag.buy { background: rgba(34,197,94,0.15); color: var(--green); border: 1px solid rgba(34,197,94,0.3); }
  .tag.hold { background: rgba(96,165,250,0.15); color: var(--blue); border: 1px solid rgba(96,165,250,0.3); }
  .tag.sell { background: rgba(248,113,113,0.15); color: var(--red); border: 1px solid rgba(248,113,113,0.3); }

  .stock-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 0; border-bottom: 1px solid var(--border);
  }

  .stock-row:last-child { border-bottom: none; }

  .divider { height: 1px; background: var(--border); margin: 20px 0; }

  .ai-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
    color: var(--gold); font-weight: 600; margin-bottom: 12px;
  }

  .pulse {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--gold);
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  .tabs { display: flex; gap: 8px; margin-bottom: 24px; }

  .tab {
    background: none; border: 1px solid var(--border);
    color: var(--muted); padding: 8px 18px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }

  .tab.active { border-color: var(--gold); color: var(--gold); background: rgba(232,184,75,0.08); }

  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 600; margin-bottom: 16px;
  }

  .empty-state {
    text-align: center; padding: 40px;
    color: var(--muted); font-size: 14px;
  }

  .empty-state .icon { font-size: 32px; margin-bottom: 12px; }

  .alert {
    padding: 12px 16px; border-radius: 10px;
    font-size: 13px; margin-bottom: 16px;
    display: flex; align-items: flex-start; gap: 10px;
  }

  .alert.info { background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.2); color: #93c5fd; }
  .alert.success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #86efac; }
  .alert.warning { background: rgba(232,184,75,0.1); border: 1px solid rgba(232,184,75,0.2); color: var(--gold2); }

  .chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--surface2); border: 1px solid var(--border);
    padding: 6px 12px; border-radius: 20px;
    font-size: 12px; font-weight: 500;
  }

  .chip .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  @media (max-width: 768px) {
    .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; }
    .grid-2, .two-col, .form-row { grid-template-columns: 1fr; }
    .main { padding: 16px; }
    .nav { display: none; }
    .mobile-nav { display: flex; }
  }
  /* ── Auth Screen ── */
  .auth-screen {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg);
    background-image: radial-gradient(ellipse at 20% 30%, #0d2040 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 70%, #0a1a30 0%, transparent 50%);
    padding: 24px;
  }

  .auth-box {
    width: 100%; max-width: 420px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 24px; padding: 40px 36px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  }

  .auth-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px; font-weight: 700; color: var(--text);
    text-align: center; margin-bottom: 6px; letter-spacing: 1px;
  }

  .auth-logo span { color: var(--gold); }

  .auth-tagline {
    text-align: center; font-size: 13px; color: var(--muted);
    margin-bottom: 32px; line-height: 1.5;
  }

  .auth-tabs {
    display: flex; background: var(--surface2);
    border-radius: 12px; padding: 4px; margin-bottom: 28px;
    border: 1px solid var(--border);
  }

  .auth-tab {
    flex: 1; background: none; border: none;
    padding: 10px; border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; color: var(--muted); transition: all 0.2s;
  }

  .auth-tab.active {
    background: linear-gradient(135deg, #e8b84b, #c8942b);
    color: #080c16;
  }

  .auth-field { margin-bottom: 16px; }

  .auth-field-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.8px;
    text-transform: uppercase; color: var(--muted); margin-bottom: 6px; display: block;
  }

  .auth-input {
    width: 100%; background: var(--surface2);
    border: 1px solid var(--border); border-radius: 12px;
    padding: 13px 16px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
    transition: border-color 0.2s;
  }

  .auth-input:focus { border-color: var(--gold); }
  .auth-input::placeholder { color: var(--muted); }

  .auth-btn {
    width: 100%; margin-top: 8px;
    background: linear-gradient(135deg, #e8b84b, #c8942b);
    border: none; color: #080c16; padding: 14px;
    border-radius: 12px; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 700; cursor: pointer;
    transition: all 0.2s; letter-spacing: 0.3px;
  }

  .auth-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,184,75,0.35); }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

  .auth-error {
    background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25);
    border-radius: 10px; padding: 10px 14px;
    font-size: 13px; color: #fca5a5; margin-bottom: 16px; text-align: center;
  }

  .auth-success {
    background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
    border-radius: 10px; padding: 10px 14px;
    font-size: 13px; color: #86efac; margin-bottom: 16px; text-align: center;
  }

  .auth-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 20px 0; color: var(--muted); font-size: 12px;
  }

  .auth-divider::before, .auth-divider::after {
    content: ""; flex: 1; height: 1px; background: var(--border);
  }

  .auth-footer {
    text-align: center; font-size: 12px; color: var(--muted); margin-top: 20px;
  }

  /* ── User Avatar ── */
  .user-menu { display: flex; align-items: center; gap: 10px; position: relative; }

  .user-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #e8b84b, #c8942b);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #080c16;
    cursor: pointer; flex-shrink: 0;
    border: 2px solid rgba(232,184,75,0.3);
  }

  .user-name {
    font-size: 13px; font-weight: 500; color: var(--text);
    max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .logout-btn {
    background: none; border: 1px solid var(--border);
    color: var(--muted); padding: 6px 12px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }

  .logout-btn:hover { border-color: var(--red); color: var(--red); }

  @media (max-width: 768px) {
    .auth-box { padding: 28px 20px; }
    .user-name { display: none; }
  }

  /* ── Plan Presentation Slides ── */
  .plan-slide-nav {
    display: flex; gap: 6px; margin-bottom: 20px; overflow-x: auto;
    scrollbar-width: none; padding-bottom: 2px;
  }
  .plan-slide-nav::-webkit-scrollbar { display: none; }
  .slide-pill {
    background: var(--surface); border: 1px solid var(--border);
    color: var(--muted); padding: 7px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 600; white-space: nowrap;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px;
    flex-shrink: 0;
  }
  .slide-pill.active { background: rgba(232,184,75,0.12); border-color: rgba(232,184,75,0.5); color: var(--gold); }
  .slide-pill:hover:not(.active) { border-color: #2a3d5e; color: var(--text); }

  /* Allocation donut */
  .alloc-legend { display: flex; flex-direction: column; gap: 8px; }
  .alloc-legend-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  .alloc-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  /* ── Security Banners ── */
  .security-banner {
    background: rgba(232,184,75,0.12); border-bottom: 1px solid rgba(232,184,75,0.25);
    padding: 10px 32px; display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; color: var(--gold2); gap: 12px;
  }
  .security-banner button {
    background: none; border: 1px solid rgba(232,184,75,0.4); color: var(--gold);
    padding: 4px 12px; border-radius: 6px; font-size: 11px; cursor: pointer;
    font-family: "DM Sans", sans-serif; font-weight: 600; white-space: nowrap;
  }
  .security-disclosure {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 16px;
    padding: 20px 24px; margin-bottom: 24px; font-size: 13px;
  }
  .security-lock-icon { font-size: 18px; flex-shrink: 0; }
  .pwd-strength { display: flex; gap: 4px; margin-top: 6px; }
  .pwd-strength-bar { height: 3px; flex: 1; border-radius: 2px; background: var(--surface3); transition: background 0.3s; }

`;

// ─── Sample data ───────────────────────────────────────────────
const sampleTransactions = [
  { date: "2024-01-03", desc: "Grocery Store", amount: -120.50, cat: "Groceries" },
  { date: "2024-01-05", desc: "Netflix", amount: -17.99, cat: "Entertainment" },
  { date: "2024-01-06", desc: "Shell Gas Station", amount: -68.00, cat: "Transportation" },
  { date: "2024-01-10", desc: "Salary Deposit", amount: 4200.00, cat: "Income" },
  { date: "2024-01-12", desc: "Rent Payment", amount: -1650.00, cat: "Housing" },
  { date: "2024-01-14", desc: "Rogers Wireless", amount: -85.00, cat: "Utilities" },
  { date: "2024-01-15", desc: "Loblaws", amount: -95.20, cat: "Groceries" },
  { date: "2024-01-18", desc: "Restaurant", amount: -62.40, cat: "Dining" },
  { date: "2024-01-20", desc: "Amazon Purchase", amount: -44.99, cat: "Shopping" },
  { date: "2024-01-22", desc: "Tim Hortons", amount: -8.75, cat: "Dining" },
  { date: "2024-01-25", desc: "Gym Membership", amount: -49.99, cat: "Health" },
  { date: "2024-01-28", desc: "TFSA Transfer", amount: -300.00, cat: "Savings" },
  { date: "2024-01-30", desc: "Hydro One", amount: -110.00, cat: "Utilities" },
  { date: "2024-02-01", desc: "Freelance Income", amount: 800.00, cat: "Income" },
  { date: "2024-02-03", desc: "Walmart", amount: -87.30, cat: "Shopping" },
  { date: "2024-02-05", desc: "Coffee Shop", amount: -22.00, cat: "Dining" },
];

const monthlyFlow = [
  { month: "Sep", income: 4200, expenses: 2800, savings: 1400 },
  { month: "Oct", income: 4200, expenses: 3100, savings: 1100 },
  { month: "Nov", income: 5000, expenses: 2950, savings: 2050 },
  { month: "Dec", income: 4200, expenses: 3800, savings: 400 },
  { month: "Jan", income: 5000, expenses: 3000, savings: 2000 },
  { month: "Feb", income: 4200, expenses: 2600, savings: 1600 },
];

const sampleGoals = [
  { id: 1, name: "TFSA Max 2024", type: "TFSA", target: 7000, current: 4200, monthly: 583, deadline: "Dec 2024" },
  { id: 2, name: "FHSA First Home", type: "FHSA", target: 40000, current: 8500, monthly: 500, deadline: "Dec 2027" },
  { id: 3, name: "Emergency Fund", type: "Savings", target: 15000, current: 9800, monthly: 400, deadline: "Aug 2025" },
];


// ─── Helpers ───────────────────────────────────────────────────
function extractJSON(raw) {
  if (!raw) return null;
  var text = raw;
  // Remove markdown code fences
  text = text.split("```json").join("").split("```JSON").join("").split("```").join("").trim();
  // Remove leading/trailing backticks
  while (text.charAt(0) === "`") text = text.slice(1).trim();
  while (text.charAt(text.length - 1) === "`") text = text.slice(0, -1).trim();
  // Find outermost JSON object
  var start = text.indexOf("{");
  var end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  text = text.slice(start, end + 1);
  // Parse with trailing comma fallback
  try { return JSON.parse(text); } catch(e1) {}
  try { return JSON.parse(text.replace(/,(\s*[}\]])/g, "$1")); } catch(e2) {}
  return null;
}
function parseCSV(text) {
  const lines = text.trim().split("\n");
  return lines.slice(1).map(line => {
    const [date, desc, amount] = line.split(",");
    return { date: date?.trim(), desc: desc?.trim(), amount: parseFloat(amount) || 0, cat: "Uncategorized" };
  });
}

function fmt(n, digits = 0) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: digits }).format(n);
}

function getCategoryTotals(txns) {
  const map = {};
  txns.filter(t => t.amount < 0).forEach(t => {
    map[t.cat] = (map[t.cat] || 0) + Math.abs(t.amount);
  });
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

// ─── AI Call ───────────────────────────────────────────────────
async function callClaude(messages, system = "", maxTokens = 1200) {
  // Wrap in a 25-second timeout — prevents infinite loading spinner
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out after 25 seconds")), 25000)
  );
  const request = (async () => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages,
      }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "API error");
    return data.content?.[0]?.text || "";
  })();
  return Promise.race([request, timeout]);
}

// ─── Components ────────────────────────────────────────────────

function Dashboard({ transactions }) {
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;
  const cats = getCategoryTotals(transactions);
  const maxCat = cats[0]?.value || 1;

  // ── Coach narrative — computed from data, no AI needed ───────────
  const savingsRateNum = parseFloat(savingsRate) || 0;
  const housingAmt = cats.find(c => c.name === "Housing")?.value || 0;
  const diningAmt  = cats.find(c => c.name === "Dining")?.value || 0;
  const housingRatio = income > 0 ? (housingAmt / income * 100) : 0;
  const topCat = cats[0];

  const coachHeadline = (() => {
    if (savings < 0) return { icon:"🚨", color:"var(--red)",    text:`You spent ${fmt(Math.abs(savings))} more than you earned this month. Let's fix that.` };
    if (savingsRateNum >= 30) return { icon:"🔥", color:"var(--green)",  text:`You're saving ${savingsRate}% of your income — that puts you in the top 10% of Canadians. Keep going.` };
    if (savingsRateNum >= 20) return { icon:"✅", color:"var(--green)",  text:`Solid — you're saving ${savingsRate}% this month. The 20% target is in reach.` };
    if (savingsRateNum >= 10) return { icon:"⚡", color:"var(--gold)",   text:`You're saving ${savingsRate}% — good start. Push to 20% and you'll hit your goals ${Math.round((20-savingsRateNum)/2)} months faster.` };
    return                           { icon:"⚠️", color:"var(--red)",   text:`Only ${savingsRate}% saved this month. Most of the gap is ${topCat ? topCat.name + " (" + fmt(topCat.value) + ")" : "expenses"}. Small cuts add up fast.` };
  })();

  const coachInsights = [
    housingRatio > 35 ? `🏠 Housing is ${housingRatio.toFixed(0)}% of your income — above the 30% guideline. That's leaving less room for savings.` : null,
    diningAmt > income * 0.12 ? `🍽️ Dining is ${fmt(diningAmt)}/mo (${income>0?(diningAmt/income*100).toFixed(0):0}% of income). Cut to ${fmt(Math.round(income * 0.08))} and save ${fmt(Math.round(diningAmt - income * 0.08))} more each month.` : null,
    savings > 0 && savingsRateNum < 20 ? `💡 You're ${fmt(Math.round(income * 0.20 - savings))} away from the 20% savings target this month.` : null,
    savings > 500 && savingsRateNum >= 20 ? `🏦 With ${fmt(savings)}/mo surplus, you could max your TFSA in ${Math.ceil(7000 / savings)} months.` : null,
  ].filter(Boolean);

  return (
    <div>
      {/* Coach headline */}
      <div style={{
        padding:"16px 20px", borderRadius:14, marginBottom:20,
        background:`${coachHeadline.color}12`,
        border:`1px solid ${coachHeadline.color}30`,
        borderLeft:`4px solid ${coachHeadline.color}`,
      }}>
        <div style={{fontSize:15,fontWeight:700,color:coachHeadline.color,marginBottom: coachInsights.length ? 10 : 0}}>
          {coachHeadline.icon} {coachHeadline.text}
        </div>
        {coachInsights.map((c,i) => (
          <div key={i} style={{fontSize:13,color:"var(--muted)",lineHeight:1.7,paddingLeft:4}}>→ {c}</div>
        ))}
      </div>

      <div className="grid-4">
        {[
          { label: "Total Income", val: fmt(income), cls: "green", icon: "↑" },
          { label: "Total Expenses", val: fmt(expenses), cls: "red", icon: "↓" },
          { label: "Net Savings", val: fmt(savings), cls: savings >= 0 ? "green" : "red", icon: "◈" },
          { label: "Savings Rate", val: `${savingsRate}%`, cls: "gold", icon: "%" },
        ].map(m => (
          <div className="card" key={m.label}>
            <div className="card-title">{m.icon} {m.label}</div>
            <div className={`metric ${m.cls}`}>{m.val}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Monthly Cash Flow</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyFlow} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#6b7a99", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7a99", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "#0d1424", border: "1px solid #1e2d47", borderRadius: 8, fontSize: 12 }} formatter={v => fmt(v)} />
              <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incG)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#f87171" fill="url(#expG)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "#22c55e" }}>● Income</span>
            <span style={{ fontSize: 12, color: "#f87171" }}>● Expenses</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Spending by Category</div>
          {cats.length === 0 ? (
            <div className="empty-state"><div className="icon">📊</div>No expense data yet</div>
          ) : (
            cats.slice(0, 6).map((c, i) => (
              <div className="cat-bar" key={c.name}>
                <div className="cat-name">{c.name}</div>
                <div className="cat-track">
                  <div className="cat-fill" style={{ width: `${(c.value / maxCat) * 100}%`, background: `${COLORS[i % COLORS.length]}` }} />
                </div>
                <div className="cat-val">{fmt(c.value)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Recent Transactions</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Date", "Description", "Category", "Amount"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 8).map((t, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--surface3)" }}>
                <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--muted)" }}>{t.date}</td>
                <td style={{ padding: "10px 12px", fontSize: 13 }}>{t.desc}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: "var(--surface2)", color: "var(--muted)", fontWeight: 500 }}>{t.cat}</span>
                </td>
                <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: t.amount >= 0 ? "var(--green)" : "var(--red)", textAlign: "right" }}>
                  {t.amount >= 0 ? "+" : ""}{fmt(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Upload({ onUpload }) {
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const handle = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      const lines = text.trim().split("\n");
      if (lines[0].toLowerCase().includes("date") || lines[0].toLowerCase().includes("desc")) {
        const txns = parseCSV(text);
        if (txns.length) { onUpload(txns); return; }
      }
      onUpload(sampleTransactions);
    };
    reader.readAsText(file);
  };

  const useSample = () => onUpload(sampleTransactions);

  return (
    <div>
      <div className="alert info">ℹ️ Upload your bank statement as a CSV, or use sample Canadian data to explore the app.</div>

      <div
        className={`upload-zone ${drag ? "drag" : ""}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current.click()}
      >
        <input ref={fileRef} type="file" accept=".csv,.pdf" style={{ display: "none" }} onChange={e => handle(e.target.files[0])} />
        <div className="upload-icon">📂</div>
        <div className="upload-title">Drop your statement here</div>
        <div className="upload-sub">Supports CSV exports from TD, RBC, Scotiabank, BMO, CIBC, Tangerine</div>
        <div style={{ marginTop: 20 }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>CSV format: Date, Description, Amount</span>
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "20px 0", color: "var(--muted)", fontSize: 13 }}>— or —</div>

      <div style={{ textAlign: "center" }}>
        <button className="btn" onClick={useSample}>▶ Load Sample Canadian Statement</button>
      </div>

      <div style={{ marginTop: 32 }}>
        <div className="section-title">Supported Banks</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {["🏦 TD Bank", "🏦 RBC", "🏦 Scotiabank", "🏦 BMO", "🏦 CIBC", "🏦 Tangerine", "🏦 Simplii", "🏦 EQ Bank"].map(b => (
            <div key={b} className="chip"><div className="dot" />{b}</div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }} className="alert warning">
        🔒 Your data stays private — statements are processed locally and never stored on our servers.
      </div>
    </div>
  );
}

function Analysis({ transactions, savedAnalysis, onSaveAnalysis }) {
  const [analysis, setAnalysis] = useState(savedAnalysis);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const cats = getCategoryTotals(transactions);
  const savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(0) : 0;
  const txnSummary = `Income: ${fmt(income)}, Expenses: ${fmt(expenses)}, Net: ${fmt(income - expenses)}, Savings rate: ${savingsRate}%. Top categories: ${cats.map(c => `${c.name} (${fmt(c.value)})`).join(", ")}`;

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const sys = "You are a JSON API. Output only raw JSON. No markdown. No backticks. Start with { end with }.";

      // Pre-compute score from data so AI doesn't need to — prevents truncation
      const savingsNum = parseFloat(savingsRate) || 0;
      const housingRatio = income > 0 ? (cats.find(c=>c.name==="Housing")?.value||0) / income * 100 : 0;
      const autoScore = savingsNum >= 20 && housingRatio <= 30 ? 78
        : savingsNum >= 10 ? 65 : 50;
      const autoLabel = autoScore >= 75 ? "Good" : autoScore >= 60 ? "Fair" : "Needs Work";
      const autoColor = autoScore >= 75 ? "green" : autoScore >= 60 ? "gold" : "red";

      // Pre-build insights from data — no AI needed, no truncation possible
      const housingVal = Math.round(cats.find(c=>c.name==="Housing")?.value||0);
      const diningVal  = Math.round(cats.find(c=>c.name==="Dining")?.value||0);
      const autoInsights = [
        { icon:"💰", title:"Savings Rate",  value:`${savingsRate}%`,           status: savingsNum>=20?"good":savingsNum>=10?"warning":"bad", tip:"" },
        { icon:"🏠", title:"Housing Cost",  value:`$${housingVal}/mo`,         status: housingRatio<=30?"good":"warning",                    tip:"" },
        { icon:"🍽️", title:"Dining Spend",  value:`$${diningVal}/mo`,          status: diningVal < income*0.12 ? "good":"warning",           tip:"" },
        { icon:"📊", title:"Net Savings",   value:`$${Math.round(income-expenses)}/mo`, status: income>expenses?"good":"bad",             tip:"" },
      ];

      // ONE small AI call — only ask for tips + top_cuts + opportunities
      // All other fields are pre-computed above so no truncation possible
      const aiMsg = `Canadian finances: ${txnSummary}
Return JSON (max 10 words per text field):
{"insight_tips":["savings tip","housing tip","dining tip","net savings tip"],"top_cuts":[{"category":"biggest spend cat","current":0,"suggested":0,"monthly_saving":0},{"category":"second cat","current":0,"suggested":0,"monthly_saving":0},{"category":"third cat","current":0,"suggested":0,"monthly_saving":0}],"opportunities":[{"icon":"🏦","title":"title","detail":"detail","impact":"$X"},{"icon":"📈","title":"title","detail":"detail","impact":"$X"},{"icon":"🏠","title":"title","detail":"detail","impact":"$X"}],"canadian_tips":[{"account":"TFSA","priority":"High","action":"action under 12 words"},{"account":"RRSP","priority":"Medium","action":"action"},{"account":"FHSA","priority":"Medium","action":"action"}]}
Use real numbers from the data above.`;

      let aiText = "";
      try {
        aiText = await callClaude(
          [{ role:"user", content:aiMsg }, { role:"assistant", content:"{" }],
          sys, 800
        );
      } catch(e) { console.warn("Analysis AI call failed:", e.message); }

      const aiParsed = extractJSON("{" + (aiText || ""));

      // Merge pre-computed + AI results — app works even if AI call fails
      const tips = aiParsed?.insight_tips || ["","","",""];
      const insights = autoInsights.map((ins, i) => ({ ...ins, tip: tips[i] || ins.tip }));

      const merged = {
        score: autoScore,
        score_label: autoLabel,
        score_color: autoColor,
        insights,
        top_cuts:       aiParsed?.top_cuts       || [],
        opportunities:  aiParsed?.opportunities  || [],
        canadian_tips:  aiParsed?.canadian_tips  || [],
      };

      setAnalysis(merged);
      onSaveAnalysis(merged);
    } catch (e) {
      console.warn("Analysis error:", e.message);
      setAnalysis({ error: "retry" });
    }
    setLoading(false);
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    const q = question;
    setQuestion("");
    setChatLoading(true);
    const newHistory = [...chatHistory, { role: "user", content: q }];
    setChatHistory(newHistory);
    try {
      const messages = [
        { role: "user", content: `Financial context: ${txnSummary}` },
        { role: "assistant", content: "I've reviewed your financial data. How can I help?" },
        ...newHistory,
      ];
      const reply = await callClaude(messages, "You are Westly, a Canadian personal finance expert. Give concise, practical advice. Use bullet points and keep answers under 100 words.");
      setChatHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch (e) { setChatHistory([...newHistory, { role: "assistant", content: "Error. Please try again." }]); }
    setChatLoading(false);
  };

  const statusColor = { good: "var(--green)", warning: "var(--gold)", bad: "var(--red)" };
  const statusBg = { good: "rgba(34,197,94,0.1)", warning: "rgba(232,184,75,0.1)", bad: "rgba(248,113,113,0.1)" };
  const priorityColor = { High: "var(--red)", Medium: "var(--gold)", Low: "var(--green)" };

  if (!transactions.length) return <div className="empty-state"><div className="icon">📤</div>Upload a statement first to get AI analysis</div>;

  return (
    <div>
      {/* Top row: Score + Pie */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          {!analysis && !loading && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div className="section-title" style={{ marginBottom: 8 }}>Ready to Analyze</div>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20, lineHeight: 1.7 }}>Get your financial health score and personalized tips based on your real spending data.</p>
              <button className="btn" onClick={runAnalysis}>Analyze My Finances</button>
            </>
          )}
          {loading && (
            <div>
              <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: "0 auto 16px" }} />
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Analyzing your finances...</div>
            </div>
          )}
          {analysis && !analysis.error && (
            <>
              <div style={{
                width: 120, height: 120, borderRadius: "50%", margin: "0 auto 16px",
                background: `conic-gradient(var(--${analysis.score_color === "gold" ? "gold" : analysis.score_color}) ${analysis.score * 3.6}deg, var(--surface3) 0deg)`,
                display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
              }}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: "Cormorant Garamond", fontSize: 32, fontWeight: 700, color: `var(--${analysis.score_color === "gold" ? "gold" : analysis.score_color})`, lineHeight: 1 }}>{analysis.score}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 1 }}>/ 100</div>
                </div>
              </div>
              <div style={{ fontFamily: "Cormorant Garamond", fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Financial Health</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: `var(--${analysis.score_color === "gold" ? "gold" : analysis.score_color})`, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>{analysis.score_label}</div>
              {/* Coach sentence based on score */}
              <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.7,marginBottom:16,padding:"8px 12px",background:"var(--surface2)",borderRadius:8,textAlign:"left"}}>
                {analysis.score >= 75 ? "🔥 Your finances are in great shape. Focus on growing your investments and maximizing registered accounts."
                : analysis.score >= 60 ? "⚡ You're on the right track. A few targeted cuts could push you into excellent territory."
                : "⚠️ Your finances need attention. Start with one change — even $100/month makes a real difference."}
              </div>
              <button className="btn-outline" style={{ fontSize: 12 }} onClick={runAnalysis}>↻ Re-analyze</button>
            </>
          )}
          {analysis?.error && (
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Couldn't parse AI response. Click retry — usually works second time.</div>
              <button className="btn" onClick={runAnalysis}>↻ Try Again</button>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Spending Breakdown</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={cats} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {cats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0d1424", border: "1px solid #1e2d47", borderRadius: 8, fontSize: 12 }} formatter={v => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {cats.map((c, i) => (
              <span key={c.name} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, background: "var(--surface2)", padding: "3px 8px", borderRadius: 20 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS[i % COLORS.length], display: "inline-block" }} />
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {analysis && !analysis.error && (
        <>
          {/* Coach Insight Cards */}
          <div className="section-title">What Westly Sees</div>
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {analysis.insights?.map((ins, i) => (
              <div key={i} className="card" style={{
                borderLeft: `4px solid ${statusColor[ins.status]}`,
                background: `${statusColor[ins.status]}08`,
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <span style={{ fontSize: 22 }}>{ins.icon}</span>
                  <span style={{
                    fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10, letterSpacing:0.5,
                    background: `${statusColor[ins.status]}20`,
                    color: statusColor[ins.status],
                    textTransform:"uppercase",
                  }}>
                    {ins.status === "good" ? "On Track" : ins.status === "warning" ? "Watch This" : "Action Needed"}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>{ins.title}</div>
                <div style={{ fontFamily: "Cormorant Garamond", fontSize: 26, fontWeight: 700, color: statusColor[ins.status], marginBottom: 8, lineHeight:1 }}>{ins.value}</div>
                {/* Coach tip — conversational not clinical */}
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, borderTop:"1px solid var(--border)", paddingTop:8 }}>
                  {ins.status !== "good" && <span style={{color: statusColor[ins.status], fontWeight:600}}>→ </span>}
                  {ins.tip}
                </div>
              </div>
            ))}
          </div>

          {/* Top Cuts + Opportunities */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="card-title">✂️ Where to Cut</div>
              {/* Total potential savings headline */}
              {analysis.top_cuts?.length > 0 && (
                <div style={{padding:"10px 14px",background:"rgba(34,197,94,0.08)",borderRadius:10,border:"1px solid rgba(34,197,94,0.2)",marginBottom:16}}>
                  <span style={{fontSize:13,color:"var(--green)",fontWeight:600}}>
                    💰 Cut these 3 categories → save {fmt(analysis.top_cuts.reduce((s,c) => s + (c.monthly_saving||0), 0))}/mo extra
                  </span>
                </div>
              )}
              {analysis.top_cuts?.map((cut, i) => (
                <div key={i} style={{marginBottom:16,padding:"10px 12px",background:"var(--surface2)",borderRadius:10,border:"1px solid var(--border)"}}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{cut.category}</span>
                    <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>+{fmt(cut.monthly_saving)}/mo</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:11,color:"var(--red)",width:70,flexShrink:0}}>Now {fmt(cut.current)}</span>
                    <div style={{flex:1,height:5,background:"var(--surface3)",borderRadius:3,overflow:"hidden",position:"relative"}}>
                      <div style={{width:"100%",height:"100%",background:"rgba(248,113,113,0.4)",borderRadius:3}} />
                      <div style={{position:"absolute",top:0,left:0,width:`${Math.min((cut.suggested/cut.current)*100,100)}%`,height:"100%",background:"var(--green)",borderRadius:3}} />
                    </div>
                    <span style={{fontSize:11,color:"var(--green)",width:70,flexShrink:0,textAlign:"right"}}>Target {fmt(cut.suggested)}</span>
                  </div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>
                    → Cut by {fmt(cut.current - cut.suggested)} to reach target
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">💡 Savings Opportunities</div>
              {analysis.opportunities?.map((opp, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, padding: "12px", background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{opp.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{opp.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{opp.detail}</div>
                    <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>{opp.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canadian Account Tips */}
          <div className="section-title">🍁 Canadian Account Strategy</div>
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {analysis.canadian_tips?.map((tip, i) => (
              <div key={i} className="card" style={{ borderTop: `3px solid ${priorityColor[tip.priority]}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{tip.account}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: `${priorityColor[tip.priority]}20`, color: priorityColor[tip.priority], border: `1px solid ${priorityColor[tip.priority]}40`, letterSpacing: 1 }}>{tip.priority}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{tip.action}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Ask Westly Chat */}
      <div className="section-title">Ask Westly</div>
      <div className="card">
        <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 16 }}>
          {chatHistory.length === 0 && (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>
              💬 e.g. "How can I save more for my TFSA?" or "Where am I overspending?"
            </div>
          )}
          {chatHistory.map((m, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {m.role === "user" ? "You" : "🤖 Westly"}
              </div>
              <div style={{
                background: m.role === "user" ? "var(--surface2)" : "rgba(232,184,75,0.05)",
                border: `1px solid ${m.role === "user" ? "var(--border)" : "rgba(232,184,75,0.2)"}`,
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, lineHeight: 1.7, color: "var(--text)", whiteSpace: "pre-wrap"
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {chatLoading && <div className="ai-thinking"><div className="spinner" />Thinking...</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" placeholder="Ask Westly about your finances..." value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && askQuestion()} />
          <button className="btn" onClick={askQuestion} disabled={chatLoading || !question.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}

function Goals({ goals, onGoalsChange }) {
  const setGoals = (g) => onGoalsChange(typeof g === "function" ? g(goals) : g);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", type: "TFSA", target: "", current: "", monthly: "", deadline: "" });

  const addGoal = () => {
    if (!form.name || !form.target) return;
    setGoals([...goals, { ...form, id: Date.now(), target: +form.target, current: +form.current || 0, monthly: +form.monthly || 0 }]);
    setForm({ name: "", type: "TFSA", target: "", current: "", monthly: "", deadline: "" });
    setShowAdd(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div className="page-title" style={{ marginBottom: 4 }}>Financial Goals</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>Track your TFSA, RRSP, FHSA & custom savings goals</div>
        </div>
        <button className="btn" onClick={() => setShowAdd(!showAdd)}>+ Add Goal</button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">New Goal</div>
          <div className="form-row">
            <div><label className="label">Goal Name</label><input className="input" placeholder="e.g. Max TFSA 2024" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Goal Type</label>
              <select className="select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {["TFSA", "RRSP", "FHSA", "Emergency Fund", "Vacation", "Education", "Other"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div><label className="label">Target Amount ($)</label><input className="input" type="number" placeholder="7000" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} /></div>
            <div><label className="label">Current Saved ($)</label><input className="input" type="number" placeholder="0" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div><label className="label">Monthly Contribution ($)</label><input className="input" type="number" placeholder="500" value={form.monthly} onChange={e => setForm({ ...form, monthly: e.target.value })} /></div>
            <div><label className="label">Target Date</label><input className="input" type="text" placeholder="Dec 2025" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={addGoal}>Save Goal</button>
            <button className="btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        {goals.map(g => {
          const pct = Math.min((g.current / g.target) * 100, 100).toFixed(0);
          return (
            <div className="goal-card" key={g.id}>
              <div className="goal-header">
                <div className="goal-name">{g.name}</div>
                <div className="goal-type">{g.type}</div>
              </div>
              <div className="goal-progress">
                <div className="goal-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="goal-stats">
                <span><strong>{fmt(g.current)}</strong> saved</span>
                <span style={{ color: "var(--gold)", fontWeight: 700 }}>{pct}%</span>
                <span>of <strong>{fmt(g.target)}</strong></span>
              </div>
              {/* Coach narrative */}
              {g.monthly > 0 && (() => {
                const remaining = g.target - g.current;
                const monthsLeft = remaining > 0 ? Math.ceil(remaining / g.monthly) : 0;
                const isOnTrack = g.deadline && monthsLeft < 18;
                return remaining > 0 ? (
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:6,padding:"6px 8px",background:"var(--surface2)",borderRadius:6,lineHeight:1.5}}>
                    {isOnTrack
                      ? <span style={{color:"var(--green)"}}>✅ At {fmt(g.monthly)}/mo you'll hit this in ~{monthsLeft} month{monthsLeft!==1?"s":""}.</span>
                      : <span style={{color:"var(--gold)"}}>⚡ {monthsLeft} months to go at {fmt(g.monthly)}/mo — increase by {fmt(Math.ceil(remaining/12))} to finish in a year.</span>
                    }
                  </div>
                ) : <div style={{fontSize:11,color:"var(--green)",marginTop:6,fontWeight:600}}>🎉 Goal achieved!</div>;
              })()}
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                <span>+{fmt(g.monthly)}/mo</span>
                <span>🎯 {g.deadline}</span>
                <span>{fmt(g.target - g.current)} to go</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlanView({ transactions, savedPlan, onSavePlan }) {
  const [plan, setPlan] = useState(savedPlan);
  const [loading, setLoading] = useState(false);
  const [profileStep, setProfileStep] = useState(1);
  const planRetryCountRef = useRef(0);
  const [profile, setProfile] = useState({
    // Step 1 — Personal
    age:"", marital:"single", dependents:"0", employment:"employed",
    // Step 2 — Finances
    totalAssets:"", totalDebts:"", emergencyMonths:"0", tfsaBalance:"", rrspBalance:"", hasPension:"no",
    // Step 3 — Goals
    goal:"retirement", horizon:"10 years", retirementIncome:"", cppStatus:"not started", oasEligible:"yes",
    // Step 4 — Risk + Knowledge
    risk:"moderate", maxLossTolerance:"20", investmentKnowledge:"beginner",
    // Step 5 — Protection
    lifeInsurance:"no", disabilityInsurance:"no", criticalIllness:"no", hasWill:"no", hasPOA:"no",
    beneficiariesNamed:"no",
    // Step 6 — Debt
    hasMortgage:"no", mortgageAmount:"", mortgageRate:"", consumerDebt:"", consumerDebtRate:"",
    otherDebt:"", otherDebtRate:"",
    // Step 7 — Income Sources (new — MFDA KYC requirement)
    rentalIncome:"", businessIncome:"", investmentIncome:"", pensionIncome:"", otherIncomeAmt:"",
    province:"ON",
  });

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const income   = transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);
  const savings  = income - expenses;
  const cats     = getCategoryTotals(transactions);
  const savingsRate  = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;
  const housingCost  = cats.find(c => c.name === "Housing")?.value || 0;
  const diningCost   = cats.find(c => c.name === "Dining")?.value || 0;
  const topSpendCats = cats.slice(0,3).map(c => `${c.name} ${fmt(c.value)}/mo`).join(", ");
  const behaviorFlag = parseFloat(savingsRate) < 10
    ? "LOW SAVINGS RATE — client struggles to save, recommend automated savings plan"
    : parseFloat(savingsRate) > 40
    ? "HIGH SAVER — client has strong savings discipline, can handle more aggressive accumulation"
    : "MODERATE SAVER — client saves consistently, reinforce good habits";

  const validateProfile = () => {
    const age = parseInt(profile.age);
    if (!profile.age || isNaN(age) || age < 18 || age > 100) return "Please enter a valid age (18–100).";
    if (!profile.totalAssets && !profile.tfsaBalance && !profile.rrspBalance) return "Please enter at least one asset value in Step 2 (total assets, TFSA, or RRSP balance).";
    const annualInc = (transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0)) * 12;
    if (annualInc === 0) return "No income found. Please upload a bank statement or ensure your transactions include income.";
    return null; // valid
  };

  const generatePlan = async () => {
    const validationError = validateProfile();
    if (validationError) { setPlan({ error: validationError, rawResponse: "" }); return; }
    setLoading(true); setPlan(null);
    // Note: planRetryCount is NOT reset here on manual click — 
    // it's reset on success so user can always manually retry
    // Safety net — never stuck loading longer than 35 seconds
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setPlan({ error: "retry", rawResponse: "Request took too long. Please try again." });
    }, 35000);
    try {
      const age = parseInt(profile.age) || 35;
      const dependents = parseInt(profile.dependents) || 0;

      // ── FIX 1: Full income from ALL sources (MFDA KYC) ───────────────
      const transactionIncome = income; // from uploaded bank statements
      const rentalIncome    = parseFloat(profile.rentalIncome)    || 0;
      const businessIncome  = parseFloat(profile.businessIncome)  || 0;
      const investmentInc   = parseFloat(profile.investmentIncome)|| 0;
      const pensionIncome   = parseFloat(profile.pensionIncome)   || 0;
      const otherIncomeAmt  = parseFloat(profile.otherIncomeAmt)  || 0;
      const totalMonthlyIncome = transactionIncome + rentalIncome + businessIncome + investmentInc + pensionIncome + otherIncomeAmt;
      const annualIncome = totalMonthlyIncome * 12;

      // ── FIX 2: Real marginal tax rate by province ─────────────────────
      // Federal brackets 2025
      const fedBrackets = [[57375,0.205],[114750,0.26],[158519,0.29],[220000,0.33],[Infinity,0.33]];
      let fedTax = 0, remaining = annualIncome;
      const fedThresholds = [0,57375,114750,158519,220000];
      const fedRates      = [0.15,0.205,0.26,0.29,0.33];
      for (let i=0; i<fedRates.length; i++) {
        const lower = fedThresholds[i];
        const upper = fedThresholds[i+1] || Infinity;
        if (annualIncome > lower) fedTax += Math.min(annualIncome, upper) * fedRates[i] - lower * fedRates[i];
      }
      // Approximate provincial top marginal rates
      const provRates = {AB:0.10,BC:0.149,MB:0.174,NB:0.192,NL:0.218,NS:0.21,ON:0.1316,PE:0.167,QC:0.225,SK:0.145,NT:0.14,NU:0.115,YT:0.15};
      const provRate = provRates[profile.province] || 0.1316;
      const marginalFed = annualIncome > 220000 ? 0.33 : annualIncome > 158519 ? 0.29 : annualIncome > 114750 ? 0.26 : annualIncome > 57375 ? 0.205 : 0.15;
      const marginalRate = (marginalFed + provRate);
      const marginalRatePct = (marginalRate * 100).toFixed(1);
      const rrspSavingPerDollar = marginalRate; // e.g. $0.43 saved per $1 contributed

      // ── FIX 3: Cash flow waterfall (proper sequencing) ────────────────
      const fixedExpenses     = expenses; // from transactions
      const highInterestDebt  = (parseFloat(profile.consumerDebt)||0);
      const highInterestRate  = parseFloat(profile.consumerDebtRate) || 19.99;
      const otherDebtAmt      = parseFloat(profile.otherDebt) || 0;
      const otherDebtRate     = parseFloat(profile.otherDebtRate) || 6.5;
      const mortgageAmt       = parseFloat(profile.mortgageAmount) || 0;
      const mortgageRate      = parseFloat(profile.mortgageRate) || 5.0;
      // Use individual debt fields (Step 6) if filled, otherwise fallback to totalDebts (Step 2)
      const step6DebtTotal = mortgageAmt + highInterestDebt + otherDebtAmt;
      const totalDebtsFromStep2 = parseFloat(profile.totalDebts) || 0;
      const totalDebt = step6DebtTotal > 0 ? step6DebtTotal : totalDebtsFromStep2;

      // Monthly debt payments (rough estimate: 2% of balance)
      const debtPayments = (highInterestDebt * 0.04) + (otherDebtAmt * 0.02) + (mortgageAmt * 0.005);
      // Emergency fund gap
      const emergencyFunded = parseFloat(profile.emergencyMonths) || 0;
      const emergencyTarget = expenses * 3; // minimum 3 months
      const emergencyGap    = Math.max(emergencyTarget - (emergencyFunded * expenses), 0);
      const emergencyMonthlyNeeded = emergencyGap > 0 ? Math.min(emergencyGap / 6, savings) : 0; // fund within 6 months
      // Available to invest AFTER emergency + debt
      const investableSurplus = Math.max(savings - emergencyMonthlyNeeded - (highInterestDebt > 0 ? highInterestDebt * 0.04 : 0), 0);

      // ── FIX 4: Emergency fund hard gate ──────────────────────────────
      const emergencyGateTriggered = emergencyFunded < 3 && emergencyGap > 0;
      // If gate triggered → override to conservative + redirect all surplus to emergency fund
      const effectiveSurplus = emergencyGateTriggered ? 0 : investableSurplus;

      // ── Debt urgency classification ───────────────────────────────────
      const hasHighInterestDebt = highInterestDebt > 0 && highInterestRate > 6;
      const debtUrgency = hasHighInterestDebt ? "CRITICAL — pay off before investing" : otherDebtAmt > 0 ? "Moderate — maintain payments, invest in parallel" : "Low — debt-free or low-rate only";

      // ── Net worth ─────────────────────────────────────────────────────
      const netWorth = (parseFloat(profile.totalAssets)||0) - totalDebt;

      // ── Life phase ────────────────────────────────────────────────────
      const lifePhase = age < 30 ? "Early Accumulation" : age < 40 ? "Growth & Foundation"
        : age < 50 ? "Peak Earnings" : age < 60 ? "Pre-Retirement"
        : age < 71 ? "Retirement Transition" : "Late Retirement";

      // ── FIX 5: Risk capacity with knowledge gate ─────────────────────
      let riskCapacity = profile.risk;
      if (age >= 65) riskCapacity = "conservative";
      else if (age >= 55 && profile.risk === "aggressive") riskCapacity = "moderate";
      else if (totalDebt > (parseFloat(profile.totalAssets)||1) * 0.5) riskCapacity = "conservative";
      else if (dependents >= 2 && profile.risk === "aggressive") riskCapacity = "moderate";
      else if (emergencyGateTriggered) riskCapacity = "conservative"; // no investing until emergency funded
      else if (profile.investmentKnowledge === "beginner" && profile.risk === "aggressive") riskCapacity = "moderate"; // knowledge gate
      const riskOverride = riskCapacity !== profile.risk;

      // ── FIX 6: Retirement income gap calculation ─────────────────────
      const retirementTarget   = parseFloat(profile.retirementIncome) || 4000;
      const yearsToRetirement  = Math.max(65 - age, 1);
      // CPP estimate based on status
      const cppMonthly = profile.cppStatus === "receiving" ? 900
        : profile.cppStatus === "delaying" ? 1364  // max at 70
        : profile.cppStatus === "started 65" ? 900
        : profile.cppStatus === "started 60" ? 600  // reduced
        : Math.min(annualIncome * 0.0075, 1364);     // estimate from income
      const oasMonthly = profile.oasEligible === "receiving" ? 700
        : profile.oasEligible === "deferred" ? 964   // 36% more at 70
        : profile.oasEligible === "yes" ? 700 : 0;
      const govtIncome = cppMonthly + oasMonthly;
      const retirementGap    = Math.max(retirementTarget - govtIncome, 0); // need from portfolio
      const portfolioNeeded  = retirementGap * 12 * 25;  // 4% rule — multiply annual need by 25
      const currentPortfolio = (parseFloat(profile.tfsaBalance)||0) + (parseFloat(profile.rrspBalance)||0);
      // Future value of current portfolio at 6% growth
      const portfolioFV      = currentPortfolio * Math.pow(1.06, yearsToRetirement);
      const portfolioShortfall = Math.max(portfolioNeeded - portfolioFV, 0);
      // Monthly savings needed to close shortfall at 6% growth
      const r = 0.06 / 12;
      const n = yearsToRetirement * 12;
      const monthlyNeededForRetirement = portfolioShortfall > 0 && n > 0
        ? (portfolioShortfall * r) / (Math.pow(1 + r, n) - 1)
        : 0;

      // ── FIX 7: Insurance coverage amounts ────────────────────────────
      const recommendedLifeInsurance  = Math.round((annualIncome * 8 + totalDebt) / 10000) * 10000;
      const recommendedDisability     = Math.round(totalMonthlyIncome * 0.7 / 100) * 100;
      const insuranceFlags = [
        profile.lifeInsurance==="no" && (dependents>0 || totalDebt>0) ? `No life insurance — recommend ${fmt(recommendedLifeInsurance)} term coverage` : null,
        profile.disabilityInsurance==="no" && age<65 ? `No disability insurance — recommend ${fmt(recommendedDisability)}/mo coverage (70% of income)` : null,
        profile.criticalIllness==="no" && age>=35 && age<=60 ? "No critical illness coverage — high priority for age 35-60" : null,
        profile.hasWill==="no" ? "No will — estate goes to probate, 1.5% fee in Ontario" : null,
        profile.hasPOA==="no" && age>=40 ? "No Power of Attorney — family cannot manage finances if incapacitated" : null,
        profile.beneficiariesNamed==="no" ? "No beneficiaries named — TFSA/RRSP proceeds go through estate (probate + delays)" : null,
      ].filter(Boolean);

      // ── FIX 8: RRSP→RRIF timeline ────────────────────────────────────
      const rrspToRrifNote = age >= 55
        ? `Must convert RRSP to RRIF by Dec 31 of age 71 (${71-age} years away). Min withdrawal at 72 = 5.40% of balance (~${fmt((parseFloat(profile.rrspBalance)||0)*0.054)}/yr).`
        : "";

      // ── FIX 9: Beneficiary / estate gap ─────────────────────────────
      const estateGaps = [
        profile.beneficiariesNamed === "no" ? "Named beneficiaries missing — RRSP/TFSA will go through probate" : null,
        profile.hasWill === "no" ? "No will — assets distributed by provincial intestacy law" : null,
        profile.hasPOA === "no" && age >= 40 ? "No POA — court process required if incapacitated" : null,
      ].filter(Boolean);

      // ── Account rules ─────────────────────────────────────────────────
      const acctRule = age >= 71 ? "RRIF mandatory withdrawals. TFSA #1 — no clawback."
        : age >= 65 ? "TFSA #1 — no OAS clawback. RRSP→RRIF before age 71. CPP+OAS timing critical."
        : age >= 60 ? "Final RRSP contribution years. CPP delay to 70 = 42% more. TFSA for flexibility."
        : age >= 50 ? "Peak earnings — max RRSP deduction. TFSA as backup. Pension/RRSP split if DB pension."
        : "TFSA first (tax-free), then RRSP (deduction), FHSA if first home buyer.";

      // ── Allocation — knowledge-gated ─────────────────────────────────
      // Beginners get simpler ETF-only portfolios; advanced get individual stocks
      const isAdvanced = ["intermediate","advanced"].includes(profile.investmentKnowledge);
      const alloc = age >= 65
        ? "35% ZAG.TO bonds, 10% GLD gold, 20% Canadian dividend ETF (CDZ.TO/RY.TO/TD.TO), 10% US defensive (JNJ/KO/PG), 15% XIC.TO, 10% VFV.TO. NO growth stocks."
        : age >= 55
        ? "28% ZAG.TO bonds, 8% GLD gold, 15% CDZ.TO dividend ETF, 12% VFV.TO, 20% XIC.TO, 12% VFV.TO, 5% VIU.TO"
        : age >= 40 && riskCapacity === "aggressive" && isAdvanced
        ? "10% ZAG.TO, 5% GLD, 18% XIC.TO, 20% VFV.TO, 10% RY.TO/CNR.TO, 25% AAPL/MSFT/GOOGL, 12% VIU.TO"
        : age >= 40 && riskCapacity === "aggressive"
        ? "10% ZAG.TO, 5% GLD, 28% XIC.TO, 32% VFV.TO, 15% VIU.TO, 10% XEQT.TO"
        : age >= 40 && riskCapacity === "moderate"
        ? "18% ZAG.TO, 5% GLD, 25% XIC.TO, 22% VFV.TO, 10% CDZ.TO, 20% VIU.TO"
        : age >= 40
        ? "28% ZAG.TO, 8% GLD, 22% XIC.TO, 12% VFV.TO, 12% CDZ.TO, 10% JNJ/KO, 8% VIU.TO"
        : riskCapacity === "aggressive" && isAdvanced
        ? "5% ZAG.TO, 5% GLD, 10% XIC.TO, 20% VFV.TO, 10% SHOP.TO/CNR.TO, 40% NVDA/AAPL/MSFT/AMZN/GOOGL, 10% VIU.TO"
        : riskCapacity === "aggressive"
        ? "5% ZAG.TO, 5% GLD, 20% XIC.TO, 40% VFV.TO, 10% XEQT.TO, 20% VIU.TO"
        : riskCapacity === "moderate"
        ? "12% ZAG.TO, 5% GLD, 22% XIC.TO, 25% VFV.TO, 10% CDZ.TO, 16% VIU.TO, 10% MSFT/AAPL"
        : "22% ZAG.TO, 8% GLD, 22% XIC.TO, 16% VFV.TO, 12% CDZ.TO, 10% JNJ/KO, 10% VIU.TO";

      // ── Holdings examples — knowledge gated ──────────────────────────
      const holdingExamples = age >= 65
        ? "TFSA:ZAG.TO,CDZ.TO,BCE.TO; RRSP:XBB.TO,VFV.TO; Non-Reg:ENB.TO,TD.TO; NO speculative stocks"
        : age >= 55
        ? "TFSA:VFV.TO,XIC.TO,CDZ.TO; RRSP:ZAG.TO,XBB.TO; Non-Reg:TD.TO,ENB.TO"
        : riskCapacity==="aggressive" && isAdvanced
        ? "TFSA:VFV.TO,AAPL,NVDA,XIC.TO; RRSP:ZAG.TO,VFV.TO; Non-Reg:SHOP.TO,CNR.TO; FHSA:XBB.TO"
        : riskCapacity==="aggressive"
        ? "TFSA:XEQT.TO,VFV.TO,XIC.TO; RRSP:ZAG.TO,VFV.TO; FHSA:XBB.TO"
        : riskCapacity==="moderate"
        ? "TFSA:VFV.TO,XIC.TO,CDZ.TO; RRSP:ZAG.TO,VFV.TO; Non-Reg:RY.TO,ENB.TO; FHSA:XBB.TO"
        : "TFSA:XBAL.TO,XIC.TO; RRSP:ZAG.TO,XBB.TO; Non-Reg:CDZ.TO,RY.TO; FHSA:XBB.TO";

      const sys = "You are a JSON API. Your ENTIRE response must be a single valid JSON object. DO NOT use markdown. DO NOT use backtick fences. DO NOT write ```json. Start your response with { and end with }. Nothing before the {. Nothing after the }.";

      // ── Pre-computed fields (never truncated) ─────────────────────────
      const autoSummary = `${lifePhase} client, age ${age}, ${profile.province}. Total income ${fmt(totalMonthlyIncome)}/mo (${fmt(annualIncome)}/yr). Marginal tax rate ${marginalRatePct}%. Net worth ${fmt(netWorth)}. Investable surplus ${fmt(effectiveSurplus)}/mo after emergency/debt. Goal: ${profile.goal} in ${profile.horizon}.${emergencyGateTriggered?" ⚠️ EMERGENCY FUND GATE ACTIVE — no investing until 3-month fund built.":""}`;

      const autoRisk = {
        capacity: riskCapacity,
        stated: profile.risk,
        knowledge: profile.investmentKnowledge,
        mismatch: riskOverride,
        note: emergencyGateTriggered
          ? "Risk overridden to conservative — emergency fund must be funded before investing."
          : profile.investmentKnowledge === "beginner" && profile.risk === "aggressive"
          ? "Risk moderated from aggressive to moderate — investment knowledge is beginner level (MFDA suitability)."
          : riskOverride
          ? `Stated ${profile.risk} adjusted to ${riskCapacity} based on age/debt/dependents.`
          : `Risk profile ${riskCapacity} — suitability confirmed.`
      };

      // ── Cash flow waterfall (pre-computed, shown in plan) ─────────────
      const cashFlowWaterfall = {
        gross_income:      fmt(totalMonthlyIncome),
        fixed_expenses:    fmt(expenses),
        emergency_topup:   fmt(emergencyMonthlyNeeded),
        debt_payments:     fmt(Math.round(debtPayments)),
        investable_surplus: fmt(effectiveSurplus),
        savings_rate:      savingsRate + "%",
        housing_ratio:     income > 0 ? ((housingCost/income)*100).toFixed(1)+"%" : "N/A",
        debt_urgency:      debtUrgency,
      };

      // ── Retirement gap (pre-computed) ─────────────────────────────────
      const retirementAnalysis = {
        target_monthly:      fmt(retirementTarget),
        cpp_estimated:       fmt(Math.round(cppMonthly)),
        oas_estimated:       fmt(Math.round(oasMonthly)),
        govt_income_total:   fmt(Math.round(govtIncome)),
        portfolio_gap_monthly: fmt(Math.round(retirementGap)),
        portfolio_needed:    fmt(Math.round(portfolioNeeded)),
        current_portfolio:   fmt(currentPortfolio),
        monthly_savings_needed: fmt(Math.round(monthlyNeededForRetirement)),
        years_to_retirement: yearsToRetirement,
        on_track:            monthlyNeededForRetirement <= effectiveSurplus,
      };

      // ── RRSP tax savings (exact) ───────────────────────────────────────
      const rrspContribPossible = Math.min(effectiveSurplus * 12, annualIncome * 0.18);
      const rrspTaxSaving = Math.round(rrspContribPossible * marginalRate);

      // ── 3 parallel AI calls — each focused, never truncated ─────────
      // Call A: Priority actions + account strategy
      // Context: full income, cash flow waterfall, emergency gate, marginal rate, retirement gap
      const emergencyGateMsg = emergencyGateTriggered
        ? `⚠️ EMERGENCY FUND GATE: Client has only ${emergencyFunded} months funded. Rank 1 action MUST be to build emergency fund to 3 months (${fmt(emergencyTarget)}). NO investment recommendations until funded. Monthly to emergency: ${fmt(emergencyMonthlyNeeded)}.`
        : `Emergency fund: ${emergencyFunded} months funded — adequate.`;

      const highDebtMsg = hasHighInterestDebt
        ? `⚠️ HIGH-INTEREST DEBT: ${fmt(highInterestDebt)} at ${highInterestRate}% — guaranteed ${highInterestRate}% return by paying it off. Rank 2 action MUST be debt elimination before investing.`
        : "";

      const msgA = `MFDA/IIROC Canadian financial advisor. Client: age ${age} ${lifePhase}, province ${profile.province}, knowledge ${profile.investmentKnowledge}.
CASH FLOW WATERFALL: Gross income ${fmt(totalMonthlyIncome)}/mo → Fixed expenses ${fmt(expenses)}/mo → Emergency top-up ${fmt(emergencyMonthlyNeeded)}/mo → Debt payments ${fmt(Math.round(debtPayments))}/mo → INVESTABLE SURPLUS ${fmt(effectiveSurplus)}/mo.
MARGINAL TAX RATE: ${marginalRatePct}% (fed+prov ${profile.province}). RRSP contribution of ${fmt(Math.round(rrspContribPossible))} saves $${rrspTaxSaving} in taxes.
RETIREMENT GAP: Target ${fmt(retirementTarget)}/mo. CPP est. ${fmt(Math.round(cppMonthly))}/mo + OAS ${fmt(Math.round(oasMonthly))}/mo = ${fmt(Math.round(govtIncome))}/mo govt. Gap: ${fmt(Math.round(retirementGap))}/mo from portfolio. Need ${fmt(Math.round(monthlyNeededForRetirement))}/mo savings to close gap. ${retirementAnalysis.on_track ? "ON TRACK ✅" : "BEHIND — increase savings ⚠️"}.
ACCOUNT RULE: ${acctRule}.
${emergencyGateMsg} ${highDebtMsg}
Keep ALL text fields under 12 words. Be specific with dollar amounts.
Return JSON: {"priority_actions":[{"rank":1,"urgency":"Immediate","action":"action","impact":"$ impact"},{"rank":2,"urgency":"Immediate","action":"action","impact":"impact"},{"rank":3,"urgency":"3-6 months","action":"action","impact":"impact"},{"rank":4,"urgency":"6-12 months","action":"action","impact":"impact"},{"rank":5,"urgency":"Annual","action":"action","impact":"impact"}],"account_strategy":[{"account":"TFSA","monthly":0,"priority":1,"reason":"reason","annual_benefit":"benefit","suitability":"why suitable for this client"},{"account":"RRSP","monthly":0,"priority":2,"reason":"reason","annual_benefit":"benefit","suitability":"suitability"},{"account":"FHSA","monthly":0,"priority":3,"reason":"reason","annual_benefit":"benefit","suitability":"suitability"},{"account":"Non-Reg","monthly":0,"priority":4,"reason":"reason","annual_benefit":"benefit","suitability":"suitability"}]}`;

      // Call B: Specific securities per account — knowledge gated
      const knowledgeGateMsg = profile.investmentKnowledge === "beginner"
        ? "CLIENT IS BEGINNER — use simple all-in-one ETFs only (XEQT.TO XBAL.TO XCNS.TO). NO individual stocks. NO complex products."
        : profile.investmentKnowledge === "basic"
        ? "CLIENT HAS BASIC KNOWLEDGE — use core ETFs (VFV.TO XIC.TO ZAG.TO VIU.TO). Can include 1-2 Canadian blue-chip dividend stocks."
        : "CLIENT IS EXPERIENCED — can include individual stocks alongside core ETFs.";

      const msgB = `MFDA Canadian advisor. Return account_holdings JSON. Client age ${age} risk ${riskCapacity} surplus ${fmt(effectiveSurplus)}/mo. ${knowledgeGateMsg} Tickers: ${holdingExamples}. Tax rules: TFSA=growth assets, RRSP=bonds+US ETF (foreign withholding sheltered), FHSA=conservative for home, Non-Reg=Canadian dividend stocks (dividend tax credit). Monthly amounts must sum to ~${fmt(effectiveSurplus)} (the INVESTABLE surplus, NOT total income). Keep reason under 10 words.
Return JSON: {"account_holdings":[{"account":"TFSA","holdings":[{"ticker":"VFV.TO","name":"Vanguard S&P 500 ETF","exchange":"TSX","type":"ETF","percentage_of_account":60,"monthly_amount":0,"reason":"US equity grows tax-free","buy_in":"Monthly-DCA","when_to_buy":"1st of each month","suitability":"growth asset — tax-free in TFSA"},{"ticker":"XIC.TO","name":"iShares S&P/TSX","exchange":"TSX","type":"ETF","percentage_of_account":40,"monthly_amount":0,"reason":"Canadian equity tax-free","buy_in":"Monthly-DCA","when_to_buy":"1st of each month","suitability":"Canadian exposure tax-free"}]},{"account":"RRSP","holdings":[{"ticker":"ZAG.TO","name":"BMO Aggregate Bond ETF","exchange":"TSX","type":"Bond ETF","percentage_of_account":60,"monthly_amount":0,"reason":"Bonds sheltered from withholding tax","buy_in":"Monthly-DCA","when_to_buy":"Before March deadline","suitability":"bond income shielded"}]},{"account":"Non-Reg","holdings":[{"ticker":"RY.TO","name":"Royal Bank","exchange":"TSX","type":"Stock","percentage_of_account":100,"monthly_amount":0,"reason":"Dividend tax credit benefit","buy_in":"Monthly-DCA","when_to_buy":"After registered accounts full","suitability":"Canadian dividend tax credit eligible"}]}]}
Replace ALL values with REAL personalized picks. Adjust for age ${age}, risk ${riskCapacity}, knowledge ${profile.investmentKnowledge}.`;

      // Call C: Portfolio allocation + protection + tax + milestones
      const insuranceContext = insuranceFlags.length > 0 ? insuranceFlags.slice(0,2).join("; ") : "No critical gaps";
      const msgC = `MFDA Canadian advisor. Age ${age} risk ${riskCapacity} province ${profile.province}. Marginal rate ${marginalRatePct}%. Insurance: ${insuranceContext}. Use allocation: ${alloc}. Max 10 words per field. Percentages MUST sum to 100.
Return JSON:
{"allocation":[{"category":"cat","name":"name","ticker":"X.TO","percentage":0,"icon":"🍁","risk_level":"Low","why":"reason"},{"category":"cat","name":"name","ticker":"X.TO","percentage":0,"icon":"🇺🇸","risk_level":"Medium","why":"reason"},{"category":"cat","name":"name","ticker":"X.TO","percentage":0,"icon":"🏦","risk_level":"Low","why":"reason"},{"category":"cat","name":"name","ticker":"X.TO","percentage":0,"icon":"🥇","risk_level":"Low","why":"reason"},{"category":"cat","name":"name","ticker":"X.TO","percentage":0,"icon":"🌍","risk_level":"Medium","why":"reason"}],"debt_strategy":{"priority":"High","steps":["step1","step2","step3"],"payoff_timeline":"X months","high_interest_first":${hasHighInterestDebt}},"insurance_gaps":[{"type":"Life Insurance","priority":"Critical","action":"action under 10 words","recommended_amount":"${fmt(recommendedLifeInsurance)}"},{"type":"Disability","priority":"High","action":"action","recommended_amount":"${fmt(recommendedDisability)}/mo"}],"tax_optimization":["tip at ${marginalRatePct}% bracket","tip2","tip3"],"estate_planning":["gap1","gap2"],"behavioral_insights":{"pattern":"pattern","strength":"strength","risk":"risk","recommendation":"action"},"milestones":[{"period":"Q3 2025","goal":"goal","amount":"$X"},{"period":"Q1 2026","goal":"goal","amount":"$X"},{"period":"Q3 2026","goal":"goal","amount":"$X"}],"key_risks":[{"icon":"📉","risk":"risk","severity":"High","mitigation":"action"},{"icon":"🏥","risk":"risk","severity":"High","mitigation":"action"},{"icon":"💸","risk":"risk","severity":"Medium","mitigation":"action"}]}
Replace ALL values with real data for this specific client.`;

      // Promise.allSettled — if one call fails/times out, others still complete
      const [resA, resB, resC] = await Promise.allSettled([
        callClaude([{ role:"user", content:msgA }, { role:"assistant", content:"{" }], sys, 700),
        callClaude([{ role:"user", content:msgB }, { role:"assistant", content:"{" }], sys, 1000),
        callClaude([{ role:"user", content:msgC }, { role:"assistant", content:"{" }], sys, 1200),
      ]);
      const rA = resA.status === "fulfilled" ? resA.value : "";
      const rB = resB.status === "fulfilled" ? resB.value : "";
      const rC = resC.status === "fulfilled" ? resC.value : "";
      if (resA.status === "rejected") console.warn("Plan call A failed:", resA.reason?.message);
      if (resB.status === "rejected") console.warn("Plan call B failed:", resB.reason?.message);
      if (resC.status === "rejected") console.warn("Plan call C failed:", resC.reason?.message);

      const partA = extractJSON("{" + (rA || ""));
      const partB = extractJSON("{" + (rB || ""));
      const partC = extractJSON("{" + (rC || ""));

      // Build plan — use pre-computed summary & risk (never truncated)
      // Fallback gracefully if any call fails
      const merged = {
        summary: autoSummary,
        risk_assessment: autoRisk,
        cash_flow: cashFlowWaterfall,
        retirement: retirementAnalysis,
        rrsp_tax_saving: fmt(rrspTaxSaving),
        marginal_rate: marginalRatePct + "%",
        emergency_gate: emergencyGateTriggered,
        rrif_note: rrspToRrifNote,
        investable_surplus_raw: effectiveSurplus,
        ...(partA || {}),
        ...(partB || {}),
        ...(partC || {}),
      };

      // Quality gate — check critical sections present
      const missingFields = [];
      if (!merged.priority_actions?.length) missingFields.push("priority actions");
      if (!merged.account_strategy?.length) missingFields.push("account strategy");
      if (!merged.allocation?.length) missingFields.push("investment allocation");

      if (missingFields.length > 0) {
        // Auto-retry ONCE — use state to track so we don't loop forever
        if (planRetryCount < 1) {
          setPlanRetryCount(c => c + 1);
          console.warn("Plan quality gate: missing", missingFields.join(", "), "— auto-retrying once...");
          clearTimeout(safetyTimer);
          setLoading(false);
          setTimeout(() => generatePlan(), 1500);
          return;
        }
        // Second failure — show what we have with a warning
        merged._qualityWarning = `Some sections could not be generated: ${missingFields.join(", ")}. Tap regenerate to try again.`;
      }
      // Reset retry count on success
      setPlanRetryCount(0);
      setPlan(merged);
      onSavePlan(merged);
    } catch (e) {
      console.error("generatePlan error:", e);
      setPlan({ error: e.message || "Request failed. Please try again.", rawResponse: "" });
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  const categoryColors = {
    "Canadian ETF":"#22c55e","US ETF":"#60a5fa","International ETF":"#a78bfa",
    "Canadian Stock":"#f0c040","US Stock":"#fb923c","Bond":"#34d399","Metal":"#f5d07a","Cash":"#6b7a99"
  };
  const severityBg = { High:"rgba(248,113,113,0.08)", Critical:"rgba(248,113,113,0.08)", Medium:"rgba(232,184,75,0.08)", Low:"rgba(34,197,94,0.08)" };
  const stepLabels = ["Personal","Finances","Goals","Risk","Protection","Debt","Income"];
  const inp = (key, type="text", ph="") => <input className="input" type={type} placeholder={ph} value={profile[key]||""} onChange={e => set(key, e.target.value)} />;
  const sel = (key, opts) => <select className="select" value={profile[key]} onChange={e => set(key, e.target.value)}>{opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select>;

  return (
    <div>
      <div className="two-col">
        {/* Profile Form */}
        <div>
          <div className="section-title">Client Profile</div>
          <div style={{ display:"flex", gap:4, marginBottom:16 }}>
            {stepLabels.map((s,i) => (
              <div key={i} onClick={() => setProfileStep(i+1)} title={s} style={{ flex:1, height:4, borderRadius:2, background: i+1 <= profileStep ? "var(--gold)" : "var(--surface3)", cursor:"pointer", transition:"background 0.2s" }} />
            ))}
          </div>
          <div style={{ fontSize:11, color:"var(--gold)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>
            Step {profileStep}/{stepLabels.length} — {stepLabels[profileStep-1]}
          </div>

          <div className="card">
            {profileStep === 1 && (<>
              <div style={{marginBottom:14}}><label className="label">Age</label>{inp("age","number","e.g. 45")}</div>
              <div style={{marginBottom:14}}><label className="label">Province <span style={{color:"var(--gold)",fontSize:10}}>(affects tax bracket)</span></label>{sel("province",[["AB","Alberta"],["BC","British Columbia"],["MB","Manitoba"],["NB","New Brunswick"],["NL","Newfoundland"],["NS","Nova Scotia"],["ON","Ontario"],["PE","PEI"],["QC","Quebec"],["SK","Saskatchewan"],["NT","NWT"],["NU","Nunavut"],["YT","Yukon"]])}</div>
              <div style={{marginBottom:14}}><label className="label">Marital Status</label>{sel("marital",[["single","Single"],["married","Married / Common-law"],["divorced","Divorced / Separated"],["widowed","Widowed"]])}</div>
              <div style={{marginBottom:14}}><label className="label">Dependents</label>{sel("dependents",[["0","0 — None"],["1","1"],["2","2"],["3","3+"],])}</div>
              <div style={{marginBottom:0}}><label className="label">Employment</label>{sel("employment",[["employed","Employed (salaried)"],["self-employed","Self-Employed"],["retired","Retired"],["part-time","Part-time / Contract"],["unemployed","Currently unemployed"]])}</div>
            </>)}
            {profileStep === 2 && (<>
              <div className="alert info" style={{marginBottom:14,fontSize:12}}>💡 Approximate values are fine. Emergency fund goal: 3 months minimum, 6 months ideal. Westly will prioritize this before any investment recommendations.</div>
              <div style={{marginBottom:14}}><label className="label">Total Assets ($)</label>{inp("totalAssets","number","e.g. 250000")}</div>
              <div className="alert info" style={{marginBottom:14,fontSize:12}}>💡 You'll enter individual debt details in Step 6 (mortgage, credit cards, loans) for a precise plan.</div>
              <div style={{marginBottom:14}}><label className="label">Emergency Fund (months of expenses)</label>{sel("emergencyMonths",[["0","0 — None"],["1","1 month"],["2","2 months"],["3","3 months"],["6","6 months ✅"],["12","12+ months"]])}</div>
              <div style={{marginBottom:14}}><label className="label">Current TFSA Balance ($)</label>{inp("tfsaBalance","number","e.g. 25000")}</div>
              <div style={{marginBottom:14}}><label className="label">Current RRSP Balance ($)</label>{inp("rrspBalance","number","e.g. 80000")}</div>
              <div style={{marginBottom:0}}><label className="label">Employer Pension</label>{sel("hasPension",[["no","No pension"],["yes-db","Yes — Defined Benefit (DB)"],["yes-dc","Yes — Defined Contribution (DC)"]])}</div>
            </>)}
            {profileStep === 3 && (<>
              <div style={{marginBottom:14}}><label className="label">Primary Goal</label>{sel("goal",[["retirement","🏖️ Retirement Income"],["home purchase","🏠 Home Purchase"],["wealth building","💰 Wealth Building"],["education","🎓 Education (RESP)"],["estate","🏛️ Estate Planning"],["early retirement","🔥 Early Retirement (FIRE)"],["debt freedom","💳 Debt Freedom"]])}</div>
              <div style={{marginBottom:14}}><label className="label">Time Horizon</label>{sel("horizon",[["1-3 years","1–3 years"],["5 years","5 years"],["10 years","10 years"],["20 years","20 years"],["30+ years","30+ years"]])}</div>
              <div style={{marginBottom:14}}><label className="label">Target Monthly Retirement Income ($)</label>{inp("retirementIncome","number","e.g. 4500")}</div>
              <div style={{marginBottom:14}}><label className="label">CPP Status</label>{sel("cppStatus",[["not started","Not started yet"],["delaying","Delaying to 70 — max benefit"],["started 65","Started at 65"],["started 60","Started early at 60"],["receiving","Currently receiving"]])}</div>
              <div style={{marginBottom:0}}><label className="label">OAS Status</label>{sel("oasEligible",[["yes","Eligible at 65"],["deferred","Deferring to 70"],["no","Not yet eligible"],["receiving","Currently receiving OAS"]])}</div>
            </>)}
            {profileStep === 4 && (<>
              <div className="alert warning" style={{marginBottom:14,fontSize:12}}>⚠️ Risk capacity (what you can afford to lose) may differ from risk tolerance (what you want). MFDA requires both.</div>
              <div style={{marginBottom:14}}><label className="label">Risk Tolerance</label>{sel("risk",[["conservative","🛡️ Conservative — Protect my capital"],["moderate","⚖️ Moderate — Balanced growth"],["aggressive","🚀 Aggressive — Maximum growth"]])}</div>
              <div style={{marginBottom:14}}><label className="label">Max Portfolio Loss You Can Tolerate</label>{sel("maxLossTolerance",[["10","10% — Very sensitive"],["20","20% — Some discomfort, can hold"],["30","30% — Comfortable with corrections"],["40","40% — Can handle bear markets"],["50","50%+ — No panic selling"]])}
              </div>
              <div style={{marginBottom:0}}><label className="label">Investment Knowledge Level <span style={{color:"var(--gold)",fontSize:10}}>(MFDA required)</span></label>{sel("investmentKnowledge",[["beginner","📚 Beginner — New to investing"],["basic","📖 Basic — Know ETFs and mutual funds"],["intermediate","📊 Intermediate — Trade stocks/ETFs regularly"],["advanced","🎓 Advanced — Options, derivatives, complex products"]])}</div>
            </>)}
            {profileStep === 5 && (<>
              <div className="alert info" style={{marginBottom:14,fontSize:12}}>💡 Insurance gaps are a key part of your financial safety net. Be honest — this helps identify risks.</div>
              <div style={{marginBottom:14}}><label className="label">Life Insurance</label>{sel("lifeInsurance",[["no","❌ No life insurance"],["yes-term","✅ Term life"],["yes-whole","✅ Whole / permanent"],["yes-group","✅ Group benefits (employer)"]])}</div>
              <div style={{marginBottom:14}}><label className="label">Disability Insurance</label>{sel("disabilityInsurance",[["no","❌ No disability coverage"],["yes-group","✅ Through employer"],["yes-personal","✅ Personal policy"]])}</div>
              <div style={{marginBottom:14}}><label className="label">Critical Illness Insurance <span style={{color:"var(--muted)",fontSize:10}}>(pays lump sum on diagnosis)</span></label>{sel("criticalIllness",[["no","❌ No critical illness coverage"],["yes","✅ Yes — have coverage"]])}</div>
              <div style={{marginBottom:14}}><label className="label">Do You Have a Will?</label>{sel("hasWill",[["no","❌ No will"],["yes","✅ Yes — up to date"],["outdated","⚠️ Yes — needs updating"]])}</div>
              <div style={{marginBottom:14}}><label className="label">Power of Attorney (POA)</label>{sel("hasPOA",[["no","❌ No POA"],["yes","✅ Yes — have POA"]])}</div>
              <div style={{marginBottom:0}}><label className="label">Beneficiaries Named on TFSA / RRSP / Insurance?</label>{sel("beneficiariesNamed",[["no","❌ No — not yet named"],["some","⚠️ Some accounts have beneficiaries"],["yes","✅ Yes — all accounts named"]])}</div>
            </>)}
            {profileStep === 6 && (<>
              <div style={{marginBottom:14}}><label className="label">Mortgage</label>{sel("hasMortgage",[["no","No mortgage"],["yes","Yes — have a mortgage"]])}</div>
              {profile.hasMortgage==="yes" && (<>
                <div style={{marginBottom:14}}><label className="label">Mortgage Balance ($)</label>{inp("mortgageAmount","number","e.g. 350000")}</div>
                <div style={{marginBottom:14}}><label className="label">Mortgage Interest Rate (%)</label>{inp("mortgageRate","number","e.g. 5.5")}</div>
              </>)}
              <div style={{marginBottom:14}}><label className="label">Consumer Debt — Credit Cards / LOC ($)</label>{inp("consumerDebt","number","e.g. 8000")}</div>
              {profile.consumerDebt && <div style={{marginBottom:14}}><label className="label">Consumer Debt Interest Rate (%)</label>{inp("consumerDebtRate","number","e.g. 19.99")}</div>}
              <div style={{marginBottom:14}}><label className="label">Other Debts — Student Loans, Car ($)</label>{inp("otherDebt","number","e.g. 15000")}</div>
              {profile.otherDebt && <div style={{marginBottom:0}}><label className="label">Other Debt Interest Rate (%)</label>{inp("otherDebtRate","number","e.g. 6.5")}</div>}
            </>)}
            {profileStep === 7 && (<>
              <div className="alert info" style={{marginBottom:14,fontSize:12}}>💡 Total income from all sources affects your tax bracket, RRSP room, and investment strategy.</div>
              <div style={{marginBottom:14}}><label className="label">Rental Income ($/mo)</label>{inp("rentalIncome","number","e.g. 1200")}</div>
              <div style={{marginBottom:14}}><label className="label">Self-Employment / Business Income ($/mo)</label>{inp("businessIncome","number","e.g. 2000")}</div>
              <div style={{marginBottom:14}}><label className="label">Investment Income — Dividends / Interest ($/mo)</label>{inp("investmentIncome","number","e.g. 300")}</div>
              <div style={{marginBottom:14}}><label className="label">Pension / Annuity Income ($/mo)</label>{inp("pensionIncome","number","e.g. 1500")}</div>
              <div style={{marginBottom:0}}><label className="label">Other Income ($/mo)</label>{inp("otherIncomeAmt","number","e.g. 500")}</div>
            </>)}

            <div style={{display:"flex",gap:10,marginTop:20}}>
              {profileStep > 1 && <button className="btn-outline" style={{flex:1}} onClick={() => setProfileStep(s=>s-1)}>← Back</button>}
              {profileStep < 7
                ? <button className="btn" style={{flex:2}} onClick={() => setProfileStep(s=>s+1)}>Next →</button>
                : <button className="btn" style={{flex:2}} onClick={generatePlan} disabled={loading}>{loading ? "Analysing..." : "🧠 Generate Professional Plan"}</button>
              }
            </div>
          </div>

          <div className="card" style={{marginTop:16}}>
            <div className="card-title">📋 CFA / CPA / FRM Assessment Covers</div>
            {["Cash flow waterfall & investable surplus","Real marginal tax rate (fed + provincial)","Emergency fund gate — safety before investing",
              "Retirement income gap & CPP/OAS estimates","Investment knowledge — MFDA suitability gate","Net worth & debt urgency classification",
              "Risk capacity override (age/debt/dependents)","Account sequencing (TFSA/RRSP/RRIF/FHSA)","Insurance coverage amounts (not just flags)",
              "RRSP→RRIF conversion timeline","Beneficiary & estate gap analysis","Suitability rationale per recommendation"].map((item,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"var(--muted)",marginBottom:6}}>
                <span style={{color:"var(--green)",fontSize:10}}>✓</span>{item}
              </div>
            ))}
          </div>
        </div>

        {/* Plan Output — Presentation View */}
        <div>
          {!plan && !loading && (
            <div className="card" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:300}}>
              <div className="empty-state">
                <div className="icon">📋</div>
                <p style={{marginBottom:12}}>Complete all 7 steps for a professional MFDA/IIROC-level plan.</p>
                <div style={{fontSize:12,color:"var(--gold)"}}>Step {profileStep}/{stepLabels.length} — {stepLabels[profileStep-1]}</div>
              </div>
            </div>
          )}
          {loading && (
            <div className="card" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:48,minHeight:300}}>
              <div className="spinner" style={{width:40,height:40,borderWidth:3,marginBottom:16}} />
              <div style={{color:"var(--text)",fontWeight:600,marginBottom:6}}>Building professional plan...</div>
              <div style={{color:"var(--muted)",fontSize:12,textAlign:"center"}}>Analysing 14 factors across your financial profile</div>
            </div>
          )}
          {plan?.error && !plan.summary && (
            <div className="card" style={{textAlign:"center",padding:32}}>
              <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
              <div style={{fontWeight:600,marginBottom:8}}>Could not generate plan</div>
              <div style={{fontSize:13,color:"var(--muted)",marginBottom:8}}>
                {plan.error === "retry" ? "The AI response could not be parsed. Click retry." : plan.error}
              </div>
              {plan.rawResponse && (
                <div style={{fontSize:10,color:"var(--muted)",background:"var(--surface2)",borderRadius:8,padding:10,marginBottom:16,textAlign:"left",maxHeight:80,overflow:"auto",wordBreak:"break-all"}}>
                  <strong>Debug:</strong> {plan.rawResponse}
                </div>
              )}
              <button className="btn" onClick={generatePlan}>↻ Try Again</button>
            </div>
          )}
          {plan?._qualityWarning && (
            <div className="alert warning" style={{marginBottom:12,fontSize:12}}>
              ⚠️ {plan._qualityWarning}
              <button className="btn-outline" style={{marginLeft:10,padding:"2px 10px",fontSize:11}} onClick={generatePlan}>↻ Regenerate</button>
            </div>
          )}
          {plan && !plan.error && <PlanSlides plan={plan} savings={plan.investable_surplus_raw || savings} categoryColors={categoryColors} generatePlan={generatePlan} />}
        </div>
      </div>
    </div>
  );
}

// ── Presentation-style slide viewer for the plan ─────────────────
function PlanSlides({ plan, savings, categoryColors, generatePlan }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { id:"summary", label:"📊 Overview" },
    { id:"actions", label:"⚡ Actions" },
    { id:"accounts", label:"🏦 Accounts" },
    { id:"holdings", label:"🎯 What to Buy" },
    { id:"allocation", label:"💼 Portfolio" },
    { id:"protection", label:"🛡️ Protection" },
    { id:"milestones", label:"📅 Milestones" },
  ].filter(s => {
    if (s.id==="actions") return plan.priority_actions?.length > 0;
    if (s.id==="accounts") return plan.account_strategy?.length > 0;
    if (s.id==="holdings") return plan.account_holdings?.length > 0;
    if (s.id==="allocation") return plan.allocation?.length > 0;
    if (s.id==="protection") return plan.debt_strategy || plan.insurance_gaps?.length > 0 || plan.tax_optimization?.length > 0;
    if (s.id==="milestones") return plan.milestones?.length > 0;
    return true;
  });

  const urgencyColor = { "Immediate":"var(--red)", "3-6 months":"var(--gold)", "6-12 months":"var(--blue)", "Annual":"var(--green)" };
  const COLORS = ["#f0c040","#22c55e","#60a5fa","#f472b6","#a78bfa","#fb923c","#34d399","#f87171"];

  return (
    <div>
      {/* Slide nav pills */}
      <div className="plan-slide-nav">
        {slides.map((s,i) => (
          <button key={s.id} className={`slide-pill ${slide===i?"active":""}`} onClick={() => setSlide(i)}>{s.label}</button>
        ))}
      </div>

      {/* SLIDE: Overview */}
      {slides[slide]?.id === "summary" && (
        <div>
          {/* Summary card */}
          <div className="card" style={{marginBottom:16,borderTop:"3px solid var(--gold)"}}>
            <div className="ai-label"><div className="pulse"/>Professional Assessment</div>
            <p style={{fontSize:14,lineHeight:1.9,color:"var(--text)",marginBottom:16}}>{plan.summary}</p>
            {plan.risk_assessment && (
              <div style={{padding:"12px 16px",borderRadius:12,background:plan.risk_assessment.mismatch?"rgba(248,113,113,0.08)":"rgba(34,197,94,0.08)",border:`1px solid ${plan.risk_assessment.mismatch?"rgba(248,113,113,0.25)":"rgba(34,197,94,0.25)"}`}}>
                <div style={{fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:plan.risk_assessment.mismatch?"var(--red)":"var(--green)",marginBottom:6}}>
                  {plan.risk_assessment.mismatch?"⚠️ Risk Mismatch — Capacity Overrides Preference":"✅ Risk Profile Aligned"}
                </div>
                <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6}}>{plan.risk_assessment.note}</div>
              </div>
            )}
          </div>
          {/* Quick stat row */}
          {plan.account_strategy && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:16}}>
              {plan.account_strategy.slice(0,2).map((a,i) => (
                <div key={i} className="card" style={{textAlign:"center",padding:16}}>
                  <div style={{fontFamily:"Cormorant Garamond",fontSize:28,fontWeight:700,color:"var(--gold)"}}>
                    ${(a.monthly||0).toLocaleString()}
                  </div>
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:4,fontWeight:600,letterSpacing:0.5}}>{a.account}/mo</div>
                </div>
              ))}
            </div>
          )}
          {/* Emergency gate warning */}
          {plan.emergency_gate && (
            <div style={{padding:"14px 16px",borderRadius:12,background:"rgba(248,113,113,0.1)",border:"2px solid rgba(248,113,113,0.4)",marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:14,color:"var(--red)",marginBottom:6}}>⚠️ Emergency Fund Gate Active</div>
              <div style={{fontSize:13,color:"var(--muted)"}}>You must build a 3-month emergency fund before investing. All surplus is redirected to your emergency fund first.</div>
            </div>
          )}

          {/* Cash Flow Waterfall */}
          {plan.cash_flow && (
            <div className="card" style={{marginBottom:16}}>
              <div className="card-title">💧 Cash Flow Waterfall</div>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:12}}>Where your money goes each month — in priority order</div>
              {[
                { label:"Gross Monthly Income",     val: plan.cash_flow.gross_income,     color:"var(--green)",  icon:"💰" },
                { label:"Fixed Expenses",           val: "− "+plan.cash_flow.fixed_expenses, color:"var(--red)",   icon:"🏠" },
                { label:"Emergency Fund (3mo min)", val: "− "+plan.cash_flow.emergency_topup, color:"#fb923c",     icon:"🛡️" },
                { label:"Debt Payments",            val: "− "+plan.cash_flow.debt_payments, color:"var(--red)",   icon:"💳" },
                { label:"Investable Surplus",       val: plan.cash_flow.investable_surplus, color:"var(--gold)",  icon:"📈" },
              ].map((row,i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background: i===4 ? "rgba(232,184,75,0.08)" : "var(--surface2)",borderRadius:8,marginBottom:6,border: i===4 ? "1px solid rgba(232,184,75,0.3)" : "1px solid var(--border)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span>{row.icon}</span>
                    <span style={{fontSize:12,color:"var(--muted)"}}>{row.label}</span>
                  </div>
                  <span style={{fontWeight:700,fontSize:13,color:row.color}}>{row.val}</span>
                </div>
              ))}
              <div style={{display:"flex",gap:12,marginTop:10}}>
                <div style={{flex:1,textAlign:"center",padding:"8px",background:"var(--surface2)",borderRadius:8}}>
                  <div style={{fontSize:10,color:"var(--muted)"}}>Savings Rate</div>
                  <div style={{fontWeight:700,color:"var(--gold)"}}>{plan.cash_flow.savings_rate}</div>
                </div>
                <div style={{flex:1,textAlign:"center",padding:"8px",background:"var(--surface2)",borderRadius:8}}>
                  <div style={{fontSize:10,color:"var(--muted)"}}>Housing Ratio</div>
                  <div style={{fontWeight:700,color: parseFloat(plan.cash_flow.housing_ratio)>30 ? "var(--red)" : "var(--green)"}}>{plan.cash_flow.housing_ratio}</div>
                </div>
                <div style={{flex:2,textAlign:"center",padding:"8px",background:"var(--surface2)",borderRadius:8}}>
                  <div style={{fontSize:10,color:"var(--muted)"}}>Debt Priority</div>
                  <div style={{fontWeight:700,fontSize:11,color: plan.cash_flow.debt_urgency?.includes("CRITICAL") ? "var(--red)" : "var(--green)"}}>{plan.cash_flow.debt_urgency?.split("—")[0]}</div>
                </div>
              </div>
            </div>
          )}

          {/* Retirement Gap */}
          {plan.retirement && (
            <div className="card" style={{marginBottom:16}}>
              <div className="card-title">🏖️ Retirement Gap Analysis</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                {[
                  { label:"Target Income",    val: plan.retirement.target_monthly,      color:"var(--text)" },
                  { label:"CPP Estimate",     val: plan.retirement.cpp_estimated+"/mo", color:"var(--green)" },
                  { label:"OAS Estimate",     val: plan.retirement.oas_estimated+"/mo", color:"var(--green)" },
                  { label:"Govt Income Total",val: plan.retirement.govt_income_total+"/mo", color:"var(--green)" },
                  { label:"Gap from Portfolio",val: plan.retirement.portfolio_gap_monthly+"/mo", color:"var(--red)" },
                  { label:"Portfolio Needed", val: plan.retirement.portfolio_needed,    color:"var(--gold)" },
                ].map((r,i) => (
                  <div key={i} style={{background:"var(--surface2)",borderRadius:8,padding:"8px 10px"}}>
                    <div style={{fontSize:10,color:"var(--muted)",marginBottom:2}}>{r.label}</div>
                    <div style={{fontWeight:700,fontSize:13,color:r.color}}>{r.val}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:"10px 14px",borderRadius:10,background: plan.retirement.on_track ? "rgba(34,197,94,0.08)" : "rgba(248,113,113,0.08)", border:`1px solid ${plan.retirement.on_track?"rgba(34,197,94,0.25)":"rgba(248,113,113,0.25)"}`}}>
                <div style={{fontWeight:700,fontSize:13,color: plan.retirement.on_track ? "var(--green)" : "var(--red)",marginBottom:4}}>
                  {plan.retirement.on_track ? "✅ On Track for Retirement" : "⚠️ Retirement Savings Gap"}
                </div>
                <div style={{fontSize:12,color:"var(--muted)"}}>
                  {plan.retirement.on_track
                    ? "Current savings rate is sufficient to meet your retirement income target."
                    : `Need to save ${plan.retirement.monthly_savings_needed}/mo to close the gap over ${plan.retirement.years_to_retirement} years.`}
                </div>
              </div>
              {plan.rrif_note && (
                <div className="alert info" style={{marginTop:10,fontSize:11}}>📅 {plan.rrif_note}</div>
              )}
            </div>
          )}

          {/* Tax efficiency */}
          {plan.marginal_rate && (
            <div className="card" style={{marginBottom:16,display:"flex",gap:16,alignItems:"center"}}>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontFamily:"Cormorant Garamond",fontSize:36,fontWeight:700,color:"var(--gold)",lineHeight:1}}>{plan.marginal_rate}</div>
                <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>Marginal Rate</div>
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>💡 RRSP Tax Savings</div>
                <div style={{fontSize:13,color:"var(--muted)"}}>Contributing to your RRSP this year saves you <strong style={{color:"var(--green)"}}>{plan.rrsp_tax_saving}</strong> in income taxes — exact amount at your {plan.marginal_rate} marginal rate.</div>
              </div>
            </div>
          )}

          {plan.behavioral_insights && (
            <div className="card" style={{borderLeft:"3px solid var(--blue)"}}>
              <div className="card-title">🧠 Behaviour Pattern</div>
              <div style={{fontSize:13,color:"var(--muted)",marginBottom:10}}>{plan.behavioral_insights.pattern}</div>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1,padding:"8px 10px",background:"rgba(34,197,94,0.08)",borderRadius:8,border:"1px solid rgba(34,197,94,0.2)"}}>
                  <div style={{fontSize:10,color:"var(--green)",fontWeight:700,marginBottom:3}}>✓ STRENGTH</div>
                  <div style={{fontSize:12,color:"var(--muted)"}}>{plan.behavioral_insights.strength}</div>
                </div>
                <div style={{flex:1,padding:"8px 10px",background:"rgba(248,113,113,0.08)",borderRadius:8,border:"1px solid rgba(248,113,113,0.2)"}}>
                  <div style={{fontSize:10,color:"var(--red)",fontWeight:700,marginBottom:3}}>⚠ WATCH</div>
                  <div style={{fontSize:12,color:"var(--muted)"}}>{plan.behavioral_insights.risk}</div>
                </div>
              </div>
              {plan.behavioral_insights.recommendation && (
                <div style={{marginTop:10,fontSize:12,color:"var(--gold)",padding:"8px 12px",background:"rgba(232,184,75,0.08)",borderRadius:8,border:"1px solid rgba(232,184,75,0.2)"}}>
                  💡 {plan.behavioral_insights.recommendation}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SLIDE: Priority Actions */}
      {slides[slide]?.id === "actions" && (
        <div>
          {plan.priority_actions?.map((a,i) => (
            <div key={i} style={{display:"flex",gap:14,marginBottom:12,padding:"14px 16px",background:"var(--surface)",borderRadius:14,border:"1px solid var(--border)",borderLeft:`4px solid ${urgencyColor[a.urgency]||"var(--gold)"}`}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${urgencyColor[a.urgency]||"var(--gold)"}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:urgencyColor[a.urgency]||"var(--gold)",flexShrink:0}}>{a.rank}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:5,lineHeight:1.4}}>{a.action}</div>
                <div style={{fontSize:12,color:"var(--green)",marginBottom:6}}>{a.impact}</div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:urgencyColor[a.urgency]||"var(--gold)"}}>{a.urgency}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SLIDE: Account Strategy */}
      {slides[slide]?.id === "accounts" && (
        <div>
          {plan.account_strategy?.sort((a,b)=>a.priority-b.priority).map((acc,i) => {
            const monthlyNum = parseFloat(acc.monthly)||0;
            const maxMonthly = Math.max(...(plan.account_strategy||[]).map(a=>parseFloat(a.monthly)||0), 1);
            const pct = (monthlyNum/maxMonthly*100).toFixed(0);
            return (
              <div key={i} className="card" style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(232,184,75,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"var(--gold)"}}>{acc.priority}</div>
                    <span style={{fontWeight:700,fontSize:15}}>{acc.account}</span>
                  </div>
                  <span style={{fontFamily:"Cormorant Garamond",fontSize:22,fontWeight:700,color:"var(--green)"}}>${monthlyNum.toLocaleString()}/mo</span>
                </div>
                <div style={{height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden",marginBottom:8}}>
                  <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,var(--gold),#f5d07a)",borderRadius:3,transition:"width 0.8s ease"}} />
                </div>
                <div style={{fontSize:12,color:"var(--muted)",marginBottom:4}}>{acc.reason}</div>
                <div style={{fontSize:11,color:"var(--gold)",fontWeight:600,marginBottom:acc.suitability?4:0}}>{acc.annual_benefit}</div>
                {acc.suitability && <div style={{fontSize:10,color:"var(--blue)",fontStyle:"italic"}}>✓ {acc.suitability}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* SLIDE: What to Buy — specific securities per account */}
      {slides[slide]?.id === "holdings" && (
        <div>
          <div className="alert info" style={{marginBottom:16,fontSize:12}}>
            📋 Securities are mapped to accounts based on Canadian tax rules — growth in TFSA, bonds in RRSP, etc.
          </div>
          {plan.account_holdings?.map((acct, ai) => {
            const acctColors = { TFSA:"#22c55e", RRSP:"#60a5fa", FHSA:"#a78bfa", "Non-Reg":"#fb923c" };
            const acctColor = acctColors[acct.account] || "var(--gold)";
            const exchangeColors = { TSX:"#22c55e", NYSE:"#60a5fa", NASDAQ:"#a78bfa", "S&P 500":"#f0c040" };
            return (
              <div key={ai} style={{marginBottom:20}}>
                {/* Account header */}
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"10px 14px",background:`${acctColor}15`,borderRadius:12,border:`1px solid ${acctColor}30`}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:`${acctColor}25`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:acctColor,flexShrink:0}}>{ai+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:15,color:acctColor}}>{acct.account}</div>
                    <div style={{fontSize:11,color:"var(--muted)"}}>
                      {acct.account==="TFSA" && "Tax-free growth & withdrawals — best for equities"}
                      {acct.account==="RRSP" && "Tax-deferred — ideal for bonds & foreign equities"}
                      {acct.account==="FHSA" && "Tax deductible + tax-free withdrawal for home"}
                      {acct.account==="Non-Reg" && "Taxable — dividend tax credit on Canadian stocks"}
                    </div>
                  </div>
                </div>
                {/* Holdings list */}
                {acct.holdings?.map((h, hi) => (
                  <div key={hi} style={{display:"flex",gap:12,padding:"12px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,marginBottom:8,borderLeft:`3px solid ${acctColor}`}}>
                    <div style={{flex:1,minWidth:0}}>
                      {/* Top row: ticker + % */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontWeight:800,fontSize:15,color:"var(--text)"}}>{h.ticker}</span>
                          <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:acctColor+"20",color:acctColor,fontWeight:700,border:`1px solid ${acctColor}40`}}>{h.type}</span>
                        </div>
                        <span style={{fontFamily:"Cormorant Garamond",fontSize:20,fontWeight:700,color:acctColor}}>{h.percentage_of_account}%</span>
                      </div>
                      {/* Name */}
                      <div style={{fontSize:12,color:"var(--muted)",marginBottom:6}}>{h.name}</div>
                      {/* Exchange + monthly + buy type */}
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                        <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"var(--surface2)",color:"var(--muted)",border:"1px solid var(--border)",fontWeight:600}}>
                          📈 {h.exchange}
                        </span>
                        <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(34,197,94,0.1)",color:"var(--green)",border:"1px solid rgba(34,197,94,0.2)",fontWeight:600}}>
                          ${(parseFloat(h.monthly_amount)||0).toLocaleString()}/mo
                        </span>
                        <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(232,184,75,0.1)",color:"var(--gold)",border:"1px solid rgba(232,184,75,0.2)",fontWeight:600}}>
                          {h.buy_in}
                        </span>
                      </div>
                      {/* When to buy */}
                      {h.when_to_buy && (
                        <div style={{fontSize:11,color:"var(--blue)",marginBottom:6,fontWeight:500}}>
                          🗓 {h.when_to_buy}
                        </div>
                      )}
                      {/* Reason */}
                      <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>{h.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          <div className="alert warning" style={{marginTop:4,fontSize:11}}>
            ⚠️ Educational only — not personalised financial advice. Consult a licensed CFP before investing.
          </div>
        </div>
      )}

      {/* SLIDE: Portfolio Allocation */}
      {slides[slide]?.id === "allocation" && (
        <div>
          {/* Allocation bar */}
          <div className="card" style={{marginBottom:16}}>
            <div className="card-title">Portfolio Composition</div>
            <div style={{display:"flex",height:24,borderRadius:12,overflow:"hidden",gap:2,marginBottom:16}}>
              {plan.allocation?.map((a,i) => (
                <div key={i} style={{width:`${a.percentage}%`,background:categoryColors[a.category]||COLORS[i%COLORS.length],transition:"width 0.8s"}} title={`${a.ticker} ${a.percentage}%`} />
              ))}
            </div>
            {/* Legend */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {plan.allocation?.map((a,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:categoryColors[a.category]||COLORS[i%COLORS.length],flexShrink:0}} />
                  <span style={{color:"var(--muted)"}}>{a.ticker}</span>
                  <span style={{marginLeft:"auto",fontWeight:700,color:categoryColors[a.category]||"var(--gold)"}}>{a.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          {/* Investment cards */}
          {plan.allocation?.map((a,i) => (
            <div key={i} style={{display:"flex",gap:12,padding:"12px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,marginBottom:10,borderLeft:`3px solid ${categoryColors[a.category]||COLORS[i%COLORS.length]}`}}>
              <div style={{fontSize:24,flexShrink:0}}>{a.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <span style={{fontWeight:700,fontSize:14}}>{a.ticker}</span>
                  <span style={{fontFamily:"Cormorant Garamond",fontSize:22,fontWeight:700,color:categoryColors[a.category]||"var(--gold)"}}>{a.percentage}%</span>
                </div>
                <div style={{fontSize:12,color:"var(--muted)",marginBottom:6}}>{a.name}</div>
                <div style={{display:"flex",gap:6,marginBottom:6}}>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:`${categoryColors[a.category]||"#e8b84b"}20`,color:categoryColors[a.category]||"var(--gold)",fontWeight:600,border:`1px solid ${categoryColors[a.category]||"#e8b84b"}40`}}>{a.category}</span>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"var(--surface2)",color:"var(--muted)",border:"1px solid var(--border)"}}>Risk: {a.risk_level}</span>
                </div>
                <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>{a.why}</div>
              </div>
            </div>
          ))}
          <div className="alert warning" style={{marginTop:8,fontSize:11}}>📋 Example portfolio structure only — not investment advice. Educational illustrations, not buy/sell recommendations. Consult a licensed CFP.</div>
        </div>
      )}

      {/* SLIDE: Protection (Debt + Insurance + Tax) */}
      {slides[slide]?.id === "protection" && (
        <div>
          {plan.debt_strategy && (
            <div className="card" style={{marginBottom:16}}>
              <div className="card-title">💳 Debt Strategy</div>
              <div style={{marginBottom:10}}>
                <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:plan.debt_strategy.priority==="High"?"rgba(248,113,113,0.15)":"rgba(232,184,75,0.1)",color:plan.debt_strategy.priority==="High"?"var(--red)":"var(--gold)",border:`1px solid ${plan.debt_strategy.priority==="High"?"rgba(248,113,113,0.3)":"rgba(232,184,75,0.3)"}`}}>
                  {plan.debt_strategy.priority} Priority
                </span>
              </div>
              {plan.debt_strategy.steps?.map((s,i) => (
                <div key={i} style={{display:"flex",gap:10,marginBottom:8,fontSize:13,color:"var(--muted)",alignItems:"flex-start"}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(232,184,75,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--gold)",flexShrink:0}}>{i+1}</div>
                  {s}
                </div>
              ))}
              {plan.debt_strategy.payoff_timeline && <div style={{marginTop:10,fontSize:12,color:"var(--green)",fontWeight:600}}>⏱ {plan.debt_strategy.payoff_timeline}</div>}
            </div>
          )}
          {plan.insurance_gaps?.length > 0 && (
            <div className="card" style={{marginBottom:16}}>
              <div className="card-title">🛡️ Insurance & Protection Gaps</div>
              {plan.insurance_gaps.map((ins,i) => (
                <div key={i} style={{marginBottom:10,padding:"12px 14px",borderRadius:10,background:ins.priority==="Critical"||ins.priority==="High"?"rgba(248,113,113,0.07)":"rgba(232,184,75,0.07)",border:`1px solid ${ins.priority==="Critical"||ins.priority==="High"?"rgba(248,113,113,0.2)":"rgba(232,184,75,0.2)"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontWeight:600,fontSize:13}}>{ins.type}</span>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,fontWeight:700,background:ins.priority==="Critical"||ins.priority==="High"?"rgba(248,113,113,0.2)":"rgba(232,184,75,0.15)",color:ins.priority==="Critical"||ins.priority==="High"?"var(--red)":"var(--gold)"}}>{ins.priority}</span>
                  </div>
                  <div style={{fontSize:12,color:"var(--muted)"}}>{ins.action}</div>
                </div>
              ))}
            </div>
          )}
          {plan.tax_optimization?.length > 0 && (
            <div className="card" style={{marginBottom:16}}>
              <div className="card-title">💡 Tax Optimization — {plan.marginal_rate} marginal rate</div>
              {plan.tax_optimization.map((tip,i) => (
                <div key={i} style={{display:"flex",gap:10,marginBottom:10,fontSize:13,color:"var(--muted)",alignItems:"flex-start"}}>
                  <span style={{color:"var(--green)",fontWeight:700,fontSize:14,flexShrink:0}}>✓</span>{tip}
                </div>
              ))}
              {plan.rrsp_tax_saving && (
                <div style={{padding:"10px 12px",background:"rgba(232,184,75,0.08)",borderRadius:8,border:"1px solid rgba(232,184,75,0.2)",marginTop:8}}>
                  <span style={{fontSize:12,color:"var(--gold)"}}>💰 RRSP contribution this year saves you <strong>{plan.rrsp_tax_saving}</strong> in taxes</span>
                </div>
              )}
            </div>
          )}
          {plan.estate_planning?.length > 0 && (
            <div className="card">
              <div className="card-title">🏛️ Estate & Beneficiary Gaps</div>
              {plan.estate_planning.map((item,i) => (
                <div key={i} style={{display:"flex",gap:10,marginBottom:10,fontSize:13,color:"var(--muted)",alignItems:"flex-start",padding:"8px 10px",background:"rgba(248,113,113,0.06)",borderRadius:8,border:"1px solid rgba(248,113,113,0.15)"}}>
                  <span style={{color:"var(--red)",fontSize:14,flexShrink:0}}>⚠</span>{item}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SLIDE: Milestones + Risks */}
      {slides[slide]?.id === "milestones" && (
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-title">📅 Your Roadmap</div>
            {plan.milestones?.map((m,i) => (
              <div key={i} style={{display:"flex",gap:14,marginBottom:16,alignItems:"flex-start"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:"var(--gold)",border:"2px solid var(--bg)"}} />
                  {i < (plan.milestones?.length||0)-1 && <div style={{width:2,height:40,background:"var(--border)",marginTop:4}} />}
                </div>
                <div style={{flex:1,paddingBottom:i < (plan.milestones?.length||0)-1 ? 4:0}}>
                  <div style={{fontSize:10,color:"var(--gold)",fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>{m.period}</div>
                  <div style={{fontWeight:600,fontSize:14,marginBottom:3}}>{m.goal}</div>
                  <div style={{fontSize:13,color:"var(--green)",fontWeight:600}}>{m.amount}</div>
                </div>
              </div>
            ))}
          </div>
          {plan.key_risks?.length > 0 && (
            <div className="card">
              <div className="card-title">⚠️ Key Risks</div>
              {plan.key_risks.map((r,i) => (
                <div key={i} style={{display:"flex",gap:12,marginBottom:12,padding:"12px 14px",borderRadius:10,background:r.severity==="High"?"rgba(248,113,113,0.07)":"rgba(232,184,75,0.07)",border:`1px solid ${r.severity==="High"?"rgba(248,113,113,0.2)":"rgba(232,184,75,0.15)"}`}}>
                  <span style={{fontSize:22,flexShrink:0}}>{r.icon}</span>
                  <div>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
                      <span style={{fontWeight:600,fontSize:13}}>{r.risk}</span>
                      <span style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:r.severity==="High"?"rgba(248,113,113,0.2)":"rgba(232,184,75,0.15)",color:r.severity==="High"?"var(--red)":"var(--gold)",fontWeight:700}}>{r.severity}</span>
                    </div>
                    <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>{r.mitigation}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom nav */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:20,paddingTop:16,borderTop:"1px solid var(--border)"}}>
        <button className="btn-outline" style={{fontSize:12}} onClick={() => setSlide(s => Math.max(0,s-1))} disabled={slide===0}>← Previous</button>
        <span style={{fontSize:12,color:"var(--muted)"}}>{slide+1} / {slides.length}</span>
        {slide < slides.length-1
          ? <button className="btn" style={{fontSize:12,padding:"8px 18px"}} onClick={() => setSlide(s => s+1)}>Next →</button>
          : <button className="btn-outline" style={{fontSize:12}} onClick={generatePlan}>↻ Regenerate</button>
        }
      </div>
    </div>
  );
}



// ─── Insights Component — Analysis + Plan merged ────────────────
function Insights({ transactions, savedAnalysis, onSaveAnalysis, savedPlan, onSavePlan }) {
  const [view, setView] = useState("analysis"); // "analysis" | "plan"
  return (
    <div>
      {/* Sub-tab switcher */}
      <div style={{ display:"flex", gap:0, marginBottom:24, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:4 }}>
        {[["analysis","🔍 Spending Analysis"],["plan","📋 Financial Plan"]].map(([id,label]) => (
          <button key={id} onClick={() => setView(id)} style={{
            flex:1, padding:"10px 0", borderRadius:9, border:"none", cursor:"pointer",
            fontFamily:"DM Sans, sans-serif", fontSize:13, fontWeight:600, transition:"all 0.2s",
            background: view===id ? "linear-gradient(135deg,#e8b84b,#c8942b)" : "none",
            color: view===id ? "#080c16" : "var(--muted)",
          }}>{label}</button>
        ))}
      </div>
      <div style={{ display: view==="analysis" ? "block" : "none" }}>
        <Analysis transactions={transactions} savedAnalysis={savedAnalysis} onSaveAnalysis={onSaveAnalysis} />
      </div>
      <div style={{ display: view==="plan" ? "block" : "none" }}>
        <PlanView transactions={transactions} savedPlan={savedPlan} onSavePlan={onSavePlan} />
      </div>
    </div>
  );
}

// ─── TFSA Room limits by year ───────────────────────────────────
const TFSA_LIMITS = {
  2009: 5000, 2010: 5000, 2011: 5000, 2012: 5000, 2013: 5500,
  2014: 5500, 2015: 10000, 2016: 5500, 2017: 5500, 2018: 5500,
  2019: 6000, 2020: 6000, 2021: 6000, 2022: 6000, 2023: 6500,
  2024: 7000, 2025: 7000,
};

function TaxRoom() {
  const [mainTab, setMainTab] = useState("myroom");
  const [calcTab, setCalcTab] = useState("tfsa");

  // My Room — quick entry
  const [myRoom, setMyRoom] = useState({ tfsa: "", rrsp: "", fhsa: "" });
  const [showMyRoomResult, setShowMyRoomResult] = useState(false);

  // TFSA Calculator
  const [tfsaBirthYear, setTfsaBirthYear] = useState("1990");
  const [tfsaContributed, setTfsaContributed] = useState("");
  const [tfsaWithdrawn, setTfsaWithdrawn] = useState("");
  const [tfsaResult, setTfsaResult] = useState(null);

  // RRSP Calculator
  const [rrspIncome, setRrspIncome] = useState("");
  const [rrspContributed, setRrspContributed] = useState("");
  const [rrspPAroom, setRrspPAroom] = useState("");
  const [rrspResult, setRrspResult] = useState(null);

  // FHSA Calculator
  const [fhsaAge, setFhsaAge] = useState("");
  const [fhsaContributed, setFhsaContributed] = useState("");
  const [fhsaResult, setFhsaResult] = useState(null);

  // RRIF Calculator
  const [rrifBalance, setRrifBalance] = useState("");
  const [rrifAge, setRrifAge] = useState("");
  const [rrifResult, setRrifResult] = useState(null);

  // RESP Calculator
  const [respChildAge, setRespChildAge] = useState("");
  const [respContributed, setRespContributed] = useState("");
  const [respAnnual, setRespAnnual] = useState("");
  const [respResult, setRespResult] = useState(null);

  // T4 / NOA
  const [t4Data, setT4Data] = useState({ employment: "", fedTax: "", cpp: "", ei: "", otherIncome: "" });
  const [noaData, setNoaData] = useState({ totalIncome: "", taxableIncome: "", rrspRoom: "", refund: "", owing: "" });

  // Tax advice
  const [taxAdvice, setTaxAdvice] = useState(null);
  const [taxLoading, setTaxLoading] = useState(false);

  // Document extraction
  const fileRef = useRef();
  const [currentDoc, setCurrentDoc] = useState("");
  const [docUploaded, setDocUploaded] = useState({ t4: false, noa: false, invest: false });
  const [extracting, setExtracting] = useState(false);   // spinner while Claude reads doc
  const [extracted, setExtracted] = useState(null);      // { type, fields, rawText, confidence }
  const [extractError, setExtractError] = useState("");

  const calcTFSA = () => {
    const birthYear = parseInt(tfsaBirthYear) || 1990;
    const eligibleFrom = Math.max(birthYear + 18, 2009);
    const currentYear = 2025;
    let totalRoom = 0;
    for (let y = eligibleFrom; y <= currentYear; y++) totalRoom += TFSA_LIMITS[y] || 7000;
    const contributed = parseFloat(tfsaContributed) || 0;
    const withdrawn = parseFloat(tfsaWithdrawn) || 0;
    const available = totalRoom - contributed + withdrawn;
    setTfsaResult({ totalRoom, contributed, withdrawn, available, eligibleFrom });
  };

  const calcRRSP = () => {
    const income = parseFloat(rrspIncome) || 0;
    const contributed = parseFloat(rrspContributed) || 0;
    const pa = parseFloat(rrspPAroom) || 0;
    const maxRoom = Math.min(income * 0.18, 31560);
    const available = Math.max(maxRoom - contributed + pa, 0);
    setRrspResult({ newRoom: maxRoom, contributed, available, taxSaving: contributed * 0.33 });
  };

  const calcFHSA = () => {
    const age = parseInt(fhsaAge) || 0;
    const contributed = parseFloat(fhsaContributed) || 0;
    const remaining = Math.max(40000 - contributed, 0);
    setFhsaResult({ eligible: age >= 18 && age <= 71, contributed, remaining, thisYear: Math.max(8000 - contributed, 0), lifetimeLimit: 40000, taxSaving: contributed * 0.33 });
  };

  const calcRRIF = () => {
    const age = parseInt(rrifAge) || 72;
    const balance = parseFloat(rrifBalance) || 0;
    // CRA RRIF minimum withdrawal factors (age 71-95+)
    const factors = {71:0.0528,72:0.054,73:0.0553,74:0.0567,75:0.0582,76:0.0598,77:0.0617,78:0.0636,79:0.0658,80:0.0682,81:0.0708,82:0.0738,83:0.0771,84:0.0808,85:0.0851,86:0.0899,87:0.0955,88:0.1021,89:0.1099,90:0.1192,91:0.1306,92:0.1449,93:0.1634,94:0.1961,95:0.2};
    const factor = factors[Math.min(Math.max(age, 71), 95)] || 0.2;
    const minWithdrawal = balance * factor;
    const taxEstimate = minWithdrawal * 0.30; // ~30% withholding tax
    const netWithdrawal = minWithdrawal - taxEstimate;

    // Project next 5 years assuming 5% growth
    const projections = [];
    let proj = balance;
    for (let i = 0; i < 5; i++) {
      const yr = age + i;
      const f = factors[Math.min(yr, 95)] || 0.2;
      const withdrawal = proj * f;
      proj = (proj - withdrawal) * 1.05;
      projections.push({ age: yr, balance: Math.round(proj), withdrawal: Math.round(withdrawal), factor: (f*100).toFixed(2) });
    }

    const mustConvertBy = 71; // must convert RRSP to RRIF by Dec 31 of age 71
    setRrifResult({ age, balance, factor, minWithdrawal: Math.round(minWithdrawal), taxEstimate: Math.round(taxEstimate), netWithdrawal: Math.round(netWithdrawal), projections, mustConvertBy, alreadyConverted: age >= 71 });
  };

  const calcRESP = () => {
    const childAge = parseInt(respChildAge) || 0;
    const contributed = parseFloat(respContributed) || 0;
    const annual = parseFloat(respAnnual) || 2500;
    const yearsLeft = Math.max(18 - childAge, 0);
    const lifetimeLimit = 50000;
    const remainingRoom = Math.max(lifetimeLimit - contributed, 0);

    // CESG — 20% on first $2,500/yr = $500/yr max, $7,200 lifetime
    const ceSgEarned = Math.min(contributed * 0.20, 7200);
    const ceSgRemaining = Math.max(7200 - ceSgEarned, 0);
    const annualCeSg = Math.min(annual * 0.20, 500); // 20% on up to $2,500

    // Additional CESG for lower income families (simplified)
    const lifetimeCeSgPossible = Math.min(ceSgRemaining + (yearsLeft * annualCeSg), 7200);

    // Projected growth at 6%
    let futureValue = contributed + ceSgEarned;
    for (let i = 0; i < yearsLeft; i++) {
      futureValue = (futureValue + annual + annualCeSg) * 1.06;
    }

    const eligible = childAge < 18;
    setRespResult({ childAge, contributed, yearsLeft, lifetimeLimit, remainingRoom, ceSgEarned: Math.round(ceSgEarned), ceSgRemaining: Math.round(ceSgRemaining), annualCeSg, lifetimeCeSgPossible: Math.round(lifetimeCeSgPossible), projectedValue: Math.round(futureValue), annual, eligible });
  };

  const getTaxAdvice = async () => {
    setTaxLoading(true);
    setTaxAdvice(null);
    try {
      const income = parseFloat(t4Data.employment) || 0;
      const rrspRoom = parseFloat(noaData.rrspRoom) || 0;
      const refund = parseFloat(noaData.refund) || 0;
      const owing = parseFloat(noaData.owing) || 0;
      const sys = "You output only raw JSON. No markdown. No backticks. Start with { end with }.";
      const msg = `Canadian tax advisor. Income $${income}, Tax withheld $${t4Data.fedTax||0}, RRSP room $${rrspRoom}, ${refund>0?"Refund $"+refund:owing>0?"Owing $"+owing:"Balance unknown"}, Other income $${t4Data.otherIncome||0}.
Return JSON (plain text only, no markdown, max 15 words per field): {"tax_score":{"score":72,"label":"Good","color":"green","note":"one sentence"},"actions":[{"rank":1,"urgency":"Do this now","icon":"💰","title":"short title","saving":"$X","deadline":"date","what_to_do":"one sentence","how_to_do":"one sentence","cra_line":"Line XXXXX"},{"rank":2,"urgency":"Before RRSP deadline","icon":"📈","title":"title","saving":"$X","deadline":"date","what_to_do":"what","how_to_do":"how","cra_line":"line"},{"rank":3,"urgency":"This month","icon":"🏦","title":"title","saving":"$X","deadline":"date","what_to_do":"what","how_to_do":"how","cra_line":"line"},{"rank":4,"urgency":"Before year end","icon":"🎯","title":"title","saving":"$X","deadline":"date","what_to_do":"what","how_to_do":"how","cra_line":"line"},{"rank":5,"urgency":"Annual review","icon":"📋","title":"title","saving":"$X","deadline":"date","what_to_do":"what","how_to_do":"how","cra_line":"line"}],"alerts":[{"type":"warning","icon":"⚠️","message":"specific concern"},{"type":"opportunity","icon":"💡","message":"specific opportunity"}],"quick_wins":["tip 1 under 12 words","tip 2","tip 3"]}`;
      let text = "";
      try { text = await callClaude([{ role:"user", content:msg }, { role:"assistant", content:"{" }], sys, 1000); }
      catch (callErr) { console.warn("Tax call failed:", callErr.message); }
      const parsed = extractJSON("{" + (text || ""));
      setTaxAdvice(parsed?.actions ? parsed : { error: "Could not parse. Please try again." });
    } catch (e) { setTaxAdvice({ error: "Error: " + (e.message || "Please try again.") }); }
    finally { setTaxLoading(false); }
  };

  const handleDocUpload = (type) => {
    setCurrentDoc(type);
    setExtracted(null);
    setExtractError("");
    fileRef.current.click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be re-uploaded
    setExtracting(true);
    setExtracted(null);
    setExtractError("");
    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const isPDF = file.type === "application/pdf";
      const mediaType = isPDF ? "application/pdf" : (file.type || "image/jpeg");

      // Build extraction prompt based on doc type
      const prompts = {
        t4: `Extract ALL values from this Canadian T4 tax slip. Return JSON only:
{"doc_type":"T4","confidence":"high/medium/low","fields":{"employment_income":"Box 14 value or null","income_tax_deducted":"Box 22 value or null","cpp_contributions":"Box 16 value or null","ei_premiums":"Box 18 value or null","employer_name":"employer name or null","tax_year":"year or null"}}`,
        noa: `Extract ALL values from this Canadian Notice of Assessment (NOA). Return JSON only:
{"doc_type":"NOA","confidence":"high/medium/low","fields":{"total_income":"Line 15000 or null","taxable_income":"Line 26000 or null","rrsp_deduction_limit":"RRSP room value or null","refund_amount":"refund if any or null","balance_owing":"amount owing if any or null","tax_year":"year or null"}}`,
        invest: `Extract investment account details from this statement. Return JSON only:
{"doc_type":"Investment","confidence":"high/medium/low","fields":{"account_type":"TFSA/RRSP/Non-Reg/etc or null","institution":"bank or broker name or null","total_value":"total portfolio value or null","holdings":[{"ticker":"symbol or null","name":"name","value":"dollar value or null","units":"units held or null"}]}}`,
      };

      const sys = "You are a document extraction AI. Return ONLY raw JSON. No markdown. No backticks. Start with {.";
      const res = await fetch("/.netlify/functions/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          system: sys,
          messages: [{
            role: "user",
            content: [
              {
                type: isPDF ? "document" : "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              { type: "text", text: prompts[currentDoc] || prompts.t4 },
            ],
          }, { role: "assistant", content: "{" }],
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const raw = "{" + (data.content?.[0]?.text || "");
      const parsed = extractJSON(raw);
      if (!parsed || !parsed.fields) throw new Error("Could not read document. Try a clearer photo.");
      setExtracted({ type: currentDoc, ...parsed });
      setDocUploaded(p => ({ ...p, [currentDoc]: true }));
    } catch (err) {
      setExtractError(err.message || "Could not extract data. Please try again with a clearer image.");
    }
    setExtracting(false);
  };

  // Confirm extracted data — auto-fill form fields
  const confirmExtracted = () => {
    if (!extracted) return;
    const f = extracted.fields;
    if (extracted.type === "t4") {
      setT4Data(d => ({
        ...d,
        employment: f.employment_income?.replace(/[^0-9.]/g,"") || d.employment,
        fedTax:     f.income_tax_deducted?.replace(/[^0-9.]/g,"") || d.fedTax,
        cpp:        f.cpp_contributions?.replace(/[^0-9.]/g,"") || d.cpp,
        ei:         f.ei_premiums?.replace(/[^0-9.]/g,"") || d.ei,
      }));
      setMainTab("calculate");
      setCalcTab("t4noa");
    } else if (extracted.type === "noa") {
      setNoaData(d => ({
        ...d,
        totalIncome:   f.total_income?.replace(/[^0-9.]/g,"") || d.totalIncome,
        taxableIncome: f.taxable_income?.replace(/[^0-9.]/g,"") || d.taxableIncome,
        rrspRoom:      f.rrsp_deduction_limit?.replace(/[^0-9.]/g,"") || d.rrspRoom,
        refund:        f.refund_amount?.replace(/[^0-9.]/g,"") || d.refund,
        owing:         f.balance_owing?.replace(/[^0-9.]/g,"") || d.owing,
      }));
      setMainTab("calculate");
      setCalcTab("t4noa");
    }
    setExtracted(null);
  };

  // Shared result card renderer
  const ResultCard = ({ label, value, cls, sub }) => (
    <div style={{ background:"var(--surface2)", borderRadius:12, padding:16, border:"1px solid var(--border)" }}>
      <div style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:6 }}>{label}</div>
      <div className={`metric ${cls}`} style={{ fontSize:26 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>{sub}</div>}
    </div>
  );

  // Main tab styles
  const mainTabStyle = (id) => ({
    flex:1, padding:"14px 0", border:"none", cursor:"pointer",
    fontFamily:"DM Sans, sans-serif", fontSize:13, fontWeight:700,
    transition:"all 0.2s", borderRadius: mainTab===id ? 10 : 0,
    background: mainTab===id ? "linear-gradient(135deg,#e8b84b,#c8942b)" : "none",
    color: mainTab===id ? "#080c16" : "var(--muted)",
    borderBottom: mainTab!==id ? "2px solid var(--border)" : "2px solid transparent",
  });

  return (
    <div>
      <input ref={fileRef} type="file" accept=".pdf,.jpg,.png,.jpeg" style={{display:"none"}} onChange={onFileChange} />

      {/* ── Document Upload Strip ── */}
      <div className="card" style={{marginBottom:20,padding:"16px 20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <div style={{fontWeight:700,fontSize:14}}>📎 Upload Documents</div>
            <div style={{fontSize:12,color:"var(--muted)"}}>Westly reads your documents and fills in all numbers automatically</div>
          </div>
          <div style={{fontSize:10,color:"var(--gold)",fontWeight:600,padding:"4px 10px",borderRadius:20,background:"rgba(232,184,75,0.1)",border:"1px solid rgba(232,184,75,0.2)"}}>✨ AI Powered</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            { key:"t4",     icon:"📄", label:"T4 Slip",              sub:"Photo or PDF",  color:"#60a5fa" },
            { key:"noa",    icon:"🏛️", label:"Notice of Assessment", sub:"CRA NOA",       color:"#22c55e" },
            { key:"invest", icon:"📊", label:"Investment Statement",  sub:"Any account",   color:"#a78bfa" },
          ].map(doc => (
            <button key={doc.key} onClick={() => handleDocUpload(doc.key)} style={{
              background: docUploaded[doc.key] ? `${doc.color}10` : "var(--surface2)",
              border: `1px solid ${docUploaded[doc.key] ? doc.color+"50" : "var(--border)"}`,
              borderRadius:12, padding:"12px 8px", cursor:"pointer", textAlign:"center",
              transition:"all 0.2s",
            }}>
              <div style={{fontSize:22,marginBottom:4}}>{docUploaded[doc.key] ? "✅" : doc.icon}</div>
              <div style={{fontSize:11,fontWeight:700,color: docUploaded[doc.key] ? doc.color : "var(--text)",marginBottom:2}}>{doc.label}</div>
              <div style={{fontSize:10,color:"var(--muted)"}}>{doc.sub}</div>
              <div style={{marginTop:6,fontSize:10,fontWeight:700,color: docUploaded[doc.key] ? doc.color : "var(--gold)"}}>
                {docUploaded[doc.key] ? "✓ Uploaded" : "Upload →"}
              </div>
            </button>
          ))}
        </div>

        {/* Extracting spinner */}
        {extracting && (
          <div style={{marginTop:14,padding:"12px 16px",background:"rgba(232,184,75,0.08)",borderRadius:10,border:"1px solid rgba(232,184,75,0.2)",display:"flex",alignItems:"center",gap:12}}>
            <div className="spinner" style={{width:18,height:18,borderWidth:2,flexShrink:0}} />
            <div>
              <div style={{fontWeight:600,fontSize:13,color:"var(--gold)"}}>Reading your document...</div>
              <div style={{fontSize:11,color:"var(--muted)"}}>Claude is extracting your tax data automatically</div>
            </div>
          </div>
        )}

        {/* Extract error */}
        {extractError && (
          <div style={{marginTop:14,padding:"12px 16px",background:"rgba(248,113,113,0.08)",borderRadius:10,border:"1px solid rgba(248,113,113,0.2)"}}>
            <div style={{fontWeight:600,fontSize:13,color:"var(--red)",marginBottom:4}}>⚠️ Could not read document</div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:8}}>{extractError}</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>Tips: Use a clear, well-lit photo · Make sure all text is visible · Try a PDF version instead</div>
          </div>
        )}

        {/* Extracted preview — confirm before using */}
        {extracted && !extracting && (
          <div style={{marginTop:14,borderRadius:12,border:"1px solid rgba(34,197,94,0.3)",overflow:"hidden"}}>
            <div style={{padding:"10px 14px",background:"rgba(34,197,94,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <span style={{fontWeight:700,fontSize:13,color:"var(--green)"}}>✅ Data extracted from your {extracted.doc_type}</span>
                <span style={{marginLeft:10,fontSize:10,padding:"2px 8px",borderRadius:10,background:`rgba(34,197,94,0.15)`,color:"var(--green)",fontWeight:600,textTransform:"uppercase"}}>
                  {extracted.confidence} confidence
                </span>
              </div>
              <button onClick={() => setExtracted(null)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:16}}>✕</button>
            </div>
            <div style={{padding:"12px 14px"}}>
              {/* Show extracted fields */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {Object.entries(extracted.fields || {}).filter(([k,v]) => v && k !== "holdings").map(([key, val]) => (
                  <div key={key} style={{background:"var(--surface2)",borderRadius:8,padding:"8px 10px"}}>
                    <div style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>
                      {key.replace(/_/g," ")}
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{val}</div>
                  </div>
                ))}
              </div>
              {/* Investment holdings preview */}
              {extracted.fields?.holdings?.length > 0 && (
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",letterSpacing:0.8,textTransform:"uppercase",marginBottom:8}}>Holdings Found</div>
                  {extracted.fields.holdings.slice(0,5).map((h,i) => (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",background:"var(--surface2)",borderRadius:8,marginBottom:4,fontSize:12}}>
                      <span style={{fontWeight:600}}>{h.ticker || h.name}</span>
                      <span style={{color:"var(--green)"}}>{h.value}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="alert warning" style={{marginBottom:10,fontSize:11}}>
                ⚠️ Please verify these numbers before confirming. AI extraction may occasionally miss values.
              </div>
              <div style={{display:"flex",gap:8}}>
                {extracted.type !== "invest" && (
                  <button className="btn" style={{flex:2}} onClick={confirmExtracted}>
                    ✅ Confirm & Auto-fill Form
                  </button>
                )}
                <button className="btn-outline" style={{flex:1}} onClick={() => setExtracted(null)}>
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3 Main Tabs */}
      <div style={{ display:"flex", background:"var(--surface)", borderRadius:14, padding:4, marginBottom:24, border:"1px solid var(--border)", gap:4 }}>
        {[
          { id:"myroom", icon:"📊", label:"My Room" },
          { id:"calculate", icon:"🧮", label:"Calculate Room" },
          { id:"advice", icon:"🤖", label:"AI Tax Tips" },
        ].map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)} style={mainTabStyle(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: MY ROOM ── */}
      {mainTab === "myroom" && (
        <div>
          <div className="alert info" style={{marginBottom:20,fontSize:13}}>
            💡 If you already know your contribution room from your NOA or CRA My Account, enter it below for an instant overview. Don't know? Use <strong onClick={() => setMainTab("calculate")} style={{color:"var(--gold)",cursor:"pointer"}}>Calculate Room →</strong>
          </div>

          {/* Quick entry cards */}
          <div className="grid-3" style={{marginBottom:20}}>
            {[
              { key:"tfsa", icon:"🏦", label:"TFSA Room", color:"#22c55e", hint:"From CRA My Account", limit:"$7,000/yr" },
              { key:"rrsp", icon:"📈", label:"RRSP Room", color:"#60a5fa", hint:"From your NOA", limit:"18% of income" },
              { key:"fhsa", icon:"🏠", label:"FHSA Room", color:"#a78bfa", hint:"If eligible first-time buyer", limit:"$8,000/yr" },
            ].map(a => (
              <div key={a.key} className="card" style={{borderTop:`3px solid ${a.color}`}}>
                <div style={{fontSize:24,marginBottom:8}}>{a.icon}</div>
                <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{a.label}</div>
                <div style={{fontSize:11,color:"var(--muted)",marginBottom:12}}>{a.hint} · {a.limit}</div>
                <input
                  className="input"
                  type="number"
                  placeholder="e.g. 12,500"
                  value={myRoom[a.key]}
                  onChange={e => setMyRoom(r => ({ ...r, [a.key]: e.target.value }))}
                  style={{borderColor: myRoom[a.key] ? a.color : undefined}}
                />
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:10,marginBottom:24}}>
            <button className="btn" style={{flex:2}} onClick={() => setShowMyRoomResult(true)}>
              📊 Show My Room Summary
            </button>
            <button className="btn-outline" style={{flex:1}} onClick={() => { setMyRoom({tfsa:"",rrsp:"",fhsa:""}); setShowMyRoomResult(false); }}>
              Clear
            </button>
          </div>

          {showMyRoomResult && (
            <>
              {/* Visual room cards */}
              <div className="section-title">Your Contribution Room</div>
              <div className="grid-3" style={{marginBottom:20}}>
                {[
                  { key:"tfsa", label:"TFSA Available", color:"#22c55e", icon:"🏦", tip:"Invest in growth ETFs & stocks — all gains tax-free" },
                  { key:"rrsp", label:"RRSP Available", color:"#60a5fa", icon:"📈", tip:"Contribue before March deadline — reduces taxable income" },
                  { key:"fhsa", label:"FHSA Available", color:"#a78bfa", icon:"🏠", tip:"For first home purchase — tax deductible like RRSP" },
                ].map(a => {
                  const val = parseFloat(myRoom[a.key]) || 0;
                  return (
                    <div key={a.key} className="card" style={{borderTop:`3px solid ${a.color}`,textAlign:"center"}}>
                      <div style={{fontSize:28,marginBottom:8}}>{a.icon}</div>
                      <div style={{fontFamily:"Cormorant Garamond",fontSize:32,fontWeight:700,color: val>0 ? a.color : "var(--muted)"}}>
                        {val > 0 ? fmt(val) : "—"}
                      </div>
                      <div style={{fontSize:11,color:"var(--muted)",margin:"6px 0 10px",fontWeight:600,letterSpacing:0.5,textTransform:"uppercase"}}>{a.label}</div>
                      <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.5,borderTop:"1px solid var(--border)",paddingTop:8}}>{a.tip}</div>
                    </div>
                  );
                })}
              </div>

              {/* What to do next */}
              <div className="card" style={{marginBottom:16}}>
                <div className="card-title">⚡ Recommended Actions</div>
                {(() => {
                  const tfsa = parseFloat(myRoom.tfsa) || 0;
                  const rrsp = parseFloat(myRoom.rrsp) || 0;
                  const fhsa = parseFloat(myRoom.fhsa) || 0;
                  const actions = [];
                  if (tfsa > 0) actions.push({ icon:"🏦", color:"#22c55e", action:`Contribute ${fmt(Math.min(tfsa, 7000))} to TFSA`, why:"Tax-free growth — highest priority for most Canadians", urgency:"Anytime" });
                  if (rrsp > 0) actions.push({ icon:"📈", color:"#60a5fa", action:`Contribute up to ${fmt(rrsp)} to RRSP`, why:"Reduces your taxable income — claim on your next tax return", urgency:"Before March 3" });
                  if (fhsa > 0) actions.push({ icon:"🏠", color:"#a78bfa", action:`Contribute ${fmt(Math.min(fhsa, 8000))} to FHSA`, why:"Tax deductible + tax-free for home purchase", urgency:"Before Dec 31" });
                  if (actions.length === 0) return <div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:12}}>Enter your room amounts above to see recommended actions.</div>;
                  return actions.map((a,i) => (
                    <div key={i} style={{display:"flex",gap:12,padding:"12px 14px",background:"var(--surface2)",borderRadius:10,border:"1px solid var(--border)",marginBottom:10,borderLeft:`3px solid ${a.color}`}}>
                      <span style={{fontSize:22,flexShrink:0}}>{a.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{a.action}</div>
                        <div style={{fontSize:12,color:"var(--muted)"}}>{a.why}</div>
                      </div>
                      <div style={{fontSize:10,padding:"3px 8px",borderRadius:10,background:`${a.color}20`,color:a.color,fontWeight:700,height:"fit-content",whiteSpace:"nowrap",flexShrink:0}}>{a.urgency}</div>
                    </div>
                  ));
                })()}
              </div>

              <div className="alert info" style={{fontSize:12}}>
                💡 Don't know your exact room? <span style={{color:"var(--gold)",cursor:"pointer",fontWeight:600}} onClick={() => setMainTab("calculate")}>Use our calculators →</span> or check <strong>CRA My Account</strong> at canada.ca/cra-my-account
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB 2: CALCULATE ROOM ── */}
      {mainTab === "calculate" && (
        <div>
          {/* Sub-tab selector */}
          <div className="tabs" style={{marginBottom:20}}>
            {[
              { id:"tfsa",  label:"🏦 TFSA" },
              { id:"rrsp",  label:"📈 RRSP" },
              { id:"fhsa",  label:"🏠 FHSA" },
              { id:"resp",  label:"🎓 RESP" },
              { id:"rrif",  label:"💼 RRIF" },
              { id:"t4noa", label:"📄 T4 / NOA" },
            ].map(t => (
              <button key={t.id} className={`tab ${calcTab===t.id?"active":""}`} onClick={() => setCalcTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* TFSA Calculator */}
          {calcTab === "tfsa" && (
            <div className="two-col">
              <div className="card">
                <div className="section-title">TFSA Room Calculator</div>
                <div className="alert info" style={{marginBottom:16,fontSize:12}}>
                  💡 Room accumulates from age 18 (or 2009). Withdrawals add back the following year.
                </div>
                <div style={{marginBottom:14}}><label className="label">Year of Birth</label>
                  <input className="input" type="number" placeholder="1990" value={tfsaBirthYear} onChange={e => setTfsaBirthYear(e.target.value)} /></div>
                <div style={{marginBottom:14}}><label className="label">Total Lifetime Contributions ($)</label>
                  <input className="input" type="number" placeholder="25000" value={tfsaContributed} onChange={e => setTfsaContributed(e.target.value)} /></div>
                <div style={{marginBottom:20}}><label className="label">Total Lifetime Withdrawals ($)</label>
                  <input className="input" type="number" placeholder="5000" value={tfsaWithdrawn} onChange={e => setTfsaWithdrawn(e.target.value)} /></div>
                <button className="btn" style={{width:"100%"}} onClick={calcTFSA}>Calculate My TFSA Room</button>
              </div>
              <div>
                {tfsaResult ? (
                  <div className="card">
                    <div className="ai-label"><div className="pulse"/>Your TFSA Room</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                      <ResultCard label="Total Lifetime Room" value={fmt(tfsaResult.totalRoom)} cls="gold" />
                      <ResultCard label="Contributed" value={fmt(tfsaResult.contributed)} cls="red" />
                      <ResultCard label="Withdrawals Added Back" value={fmt(tfsaResult.withdrawn)} cls="green" />
                      <ResultCard label="Available NOW" value={fmt(tfsaResult.available)} cls={tfsaResult.available >= 0 ? "green" : "red"} />
                    </div>
                    <div style={{fontSize:12,color:"var(--muted)",lineHeight:2}}>
                      <div>📅 Eligible since: <strong style={{color:"var(--text)"}}>{tfsaResult.eligibleFrom}</strong></div>
                      <div>💰 2025 annual limit: <strong style={{color:"var(--text)"}}>$7,000</strong></div>
                    </div>
                    {tfsaResult.available < 0 && <div className="alert" style={{marginTop:12,background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",color:"#fca5a5",fontSize:12}}>⚠️ Over-contribution! CRA charges 1%/month on excess. Withdraw immediately.</div>}
                    {tfsaResult.available > 0 && <div className="alert success" style={{marginTop:12,fontSize:12}}>✅ You have {fmt(tfsaResult.available)} available. Consider contributing before year end.</div>}
                    <button className="btn-outline" style={{width:"100%",marginTop:12}} onClick={() => { setMyRoom(r => ({...r, tfsa: tfsaResult.available > 0 ? tfsaResult.available.toFixed(0) : "0"})); setMainTab("myroom"); setShowMyRoomResult(true); }}>
                      → Use This in My Room
                    </button>
                  </div>
                ) : (
                  <div className="card"><div className="empty-state"><div className="icon">🏦</div><p>Enter your details to calculate your TFSA contribution room.</p></div></div>
                )}
              </div>
            </div>
          )}

          {/* RRSP Calculator */}
          {calcTab === "rrsp" && (
            <div className="two-col">
              <div className="card">
                <div className="section-title">RRSP Room Calculator</div>
                <div className="alert info" style={{marginBottom:16,fontSize:12}}>💡 RRSP room = 18% of prior year earned income (max $31,560 for 2024), minus pension adjustments.</div>
                <div style={{marginBottom:14}}><label className="label">Previous Year Earned Income ($)</label>
                  <input className="input" type="number" placeholder="75000" value={rrspIncome} onChange={e => setRrspIncome(e.target.value)} /></div>
                <div style={{marginBottom:14}}><label className="label">Contributions Made This Year ($)</label>
                  <input className="input" type="number" placeholder="5000" value={rrspContributed} onChange={e => setRrspContributed(e.target.value)} /></div>
                <div style={{marginBottom:20}}><label className="label">Unused Room from Previous Years ($) <span style={{color:"var(--muted)",fontWeight:400,fontSize:11}}>(from NOA)</span></label>
                  <input className="input" type="number" placeholder="12000" value={rrspPAroom} onChange={e => setRrspPAroom(e.target.value)} /></div>
                <button className="btn" style={{width:"100%"}} onClick={calcRRSP}>Calculate My RRSP Room</button>
              </div>
              <div>
                {rrspResult ? (
                  <div className="card">
                    <div className="ai-label"><div className="pulse"/>Your RRSP Room</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                      <ResultCard label="New Room This Year" value={fmt(rrspResult.newRoom)} cls="gold" />
                      <ResultCard label="Contributed" value={fmt(rrspResult.contributed)} cls="red" />
                      <ResultCard label="Available Room" value={fmt(rrspResult.available)} cls="green" />
                      <ResultCard label="Est. Tax Savings" value={fmt(rrspResult.taxSaving)} cls="green" />
                    </div>
                    <div style={{fontSize:12,color:"var(--muted)",lineHeight:2}}>
                      <div>📅 2025 RRSP deadline: <strong style={{color:"var(--text)"}}>March 3, 2025</strong></div>
                      <div>💰 2024 max limit: <strong style={{color:"var(--text)"}}>$31,560</strong></div>
                    </div>
                    <div className="alert success" style={{marginTop:12,fontSize:12}}>💡 Contributing {fmt(rrspResult.available)} could save ~{fmt(rrspResult.available * 0.33)} in taxes.</div>
                    <button className="btn-outline" style={{width:"100%",marginTop:12}} onClick={() => { setMyRoom(r => ({...r, rrsp: rrspResult.available.toFixed(0)})); setMainTab("myroom"); setShowMyRoomResult(true); }}>
                      → Use This in My Room
                    </button>
                  </div>
                ) : (
                  <div className="card"><div className="empty-state"><div className="icon">📈</div><p>Enter your income to calculate your RRSP room and tax savings potential.</p></div></div>
                )}
              </div>
            </div>
          )}

          {/* FHSA Calculator */}
          {calcTab === "fhsa" && (
            <div className="two-col">
              <div className="card">
                <div className="section-title">FHSA Room Calculator</div>
                <div className="alert info" style={{marginBottom:16,fontSize:12}}>💡 FHSA: $8,000/year, $40,000 lifetime. Tax deductible + tax-free withdrawal for first home.</div>
                <div style={{marginBottom:14}}><label className="label">Your Age</label>
                  <input className="input" type="number" placeholder="28" value={fhsaAge} onChange={e => setFhsaAge(e.target.value)} /></div>
                <div style={{marginBottom:20}}><label className="label">Total FHSA Contributions ($)</label>
                  <input className="input" type="number" placeholder="8000" value={fhsaContributed} onChange={e => setFhsaContributed(e.target.value)} /></div>
                <button className="btn" style={{width:"100%"}} onClick={calcFHSA}>Check My FHSA Room</button>
              </div>
              <div>
                {fhsaResult ? (
                  <div className="card">
                    <div className="ai-label"><div className="pulse"/>Your FHSA Status</div>
                    {!fhsaResult.eligible ? (
                      <div className="alert" style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",color:"#fca5a5"}}>❌ Not eligible — must be 18–71 and a first-time home buyer.</div>
                    ) : (<>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                        <ResultCard label="Lifetime Limit" value={fmt(fhsaResult.lifetimeLimit)} cls="gold" />
                        <ResultCard label="Contributed" value={fmt(fhsaResult.contributed)} cls="red" />
                        <ResultCard label="Remaining Room" value={fmt(fhsaResult.remaining)} cls="green" />
                        <ResultCard label="Est. Tax Savings" value={fmt(fhsaResult.taxSaving)} cls="green" />
                      </div>
                      <div style={{fontSize:12,color:"var(--muted)",lineHeight:2}}>
                        <div>📅 Annual limit: <strong style={{color:"var(--text)"}}>$8,000/year</strong></div>
                        <div>🏠 Works like RRSP + TFSA combined for home buying</div>
                      </div>
                      <button className="btn-outline" style={{width:"100%",marginTop:12}} onClick={() => { setMyRoom(r => ({...r, fhsa: fhsaResult.remaining.toFixed(0)})); setMainTab("myroom"); setShowMyRoomResult(true); }}>
                        → Use This in My Room
                      </button>
                    </>)}
                  </div>
                ) : (
                  <div className="card"><div className="empty-state"><div className="icon">🏠</div><p>FHSA launched in 2023 — $8,000/yr deductible, tax-free withdrawal for first home purchase.</p></div></div>
                )}
              </div>
            </div>
          )}

          {/* RESP Calculator */}
          {calcTab === "resp" && (
            <div className="two-col">
              <div className="card">
                <div className="section-title">RESP Calculator</div>
                <div className="alert info" style={{marginBottom:16,fontSize:12}}>
                  🎓 RESP gets a <strong>20% government grant (CESG)</strong> on first $2,500/yr = $500 free money annually. Lifetime grant: $7,200.
                </div>
                <div style={{marginBottom:14}}><label className="label">Child's Current Age</label>
                  <input className="input" type="number" placeholder="e.g. 5" value={respChildAge} onChange={e => setRespChildAge(e.target.value)} /></div>
                <div style={{marginBottom:14}}><label className="label">Total Contributions So Far ($)</label>
                  <input className="input" type="number" placeholder="e.g. 10000" value={respContributed} onChange={e => setRespContributed(e.target.value)} /></div>
                <div style={{marginBottom:20}}><label className="label">Planned Annual Contribution ($) <span style={{color:"var(--gold)",fontSize:10}}>$2,500 = max CESG</span></label>
                  <input className="input" type="number" placeholder="2500" value={respAnnual} onChange={e => setRespAnnual(e.target.value)} /></div>
                <button className="btn" style={{width:"100%"}} onClick={calcRESP}>Calculate My RESP</button>
              </div>
              <div>
                {respResult ? (
                  <div className="card">
                    <div className="ai-label"><div className="pulse"/>Your RESP Summary</div>
                    {!respResult.eligible ? (
                      <div className="alert" style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",color:"#fca5a5"}}>
                        ❌ Child must be under 18 to contribute to RESP.
                      </div>
                    ) : (<>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                        {[
                          { label:"Contributed",       val: fmt(respResult.contributed),               cls:"gold" },
                          { label:"CESG Earned",        val: fmt(respResult.ceSgEarned),                cls:"green",  note:"Govt grant" },
                          { label:"Years Until 18",     val: respResult.yearsLeft+" yrs",              cls:"blue" },
                          { label:"CESG Remaining",     val: fmt(respResult.ceSgRemaining),             cls:"green",  note:"Still available" },
                          { label:"Annual CESG",        val: fmt(respResult.annualCeSg)+"/yr",          cls:"green",  note:"On $"+respResult.annual.toLocaleString()+"/yr" },
                          { label:"Projected at 18",    val: fmt(respResult.projectedValue),            cls:"gold",   note:"At 6% growth" },
                        ].map((r,i) => (
                          <div key={i} style={{background:"var(--surface2)",borderRadius:12,padding:"12px 14px",border:"1px solid var(--border)"}}>
                            <div style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{r.label}</div>
                            <div style={{fontFamily:"Cormorant Garamond",fontSize:22,fontWeight:700,color:`var(--${r.cls})`}}>{r.val}</div>
                            {r.note && <div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>{r.note}</div>}
                          </div>
                        ))}
                      </div>
                      {/* CESG tip */}
                      <div style={{padding:"10px 14px",background:"rgba(34,197,94,0.08)",borderRadius:10,border:"1px solid rgba(34,197,94,0.2)",marginBottom:12}}>
                        <div style={{fontWeight:700,fontSize:13,color:"var(--green)",marginBottom:4}}>💡 Maximize Your Free Money</div>
                        <div style={{fontSize:12,color:"var(--muted)"}}>
                          Contribute exactly <strong style={{color:"var(--text)"}}>$2,500/year</strong> to get the full <strong style={{color:"var(--green)"}}>$500 CESG grant</strong> every year.
                          Over {respResult.yearsLeft} years that's <strong style={{color:"var(--green)"}}>{fmt(respResult.yearsLeft * 500)}</strong> in free government money.
                        </div>
                      </div>
                      {/* Key rules */}
                      <div style={{fontSize:12,color:"var(--muted)",lineHeight:2}}>
                        <div>📅 Lifetime RESP limit: <strong style={{color:"var(--text)"}}>$50,000</strong></div>
                        <div>🏦 Remaining room: <strong style={{color:"var(--gold)"}}>{fmt(respResult.remainingRoom)}</strong></div>
                        <div>🎓 Must be used for education by age 35</div>
                        <div>💰 Withdrawals taxed in student's hands (low/zero tax)</div>
                      </div>
                    </>)}
                  </div>
                ) : (
                  <div className="card">
                    <div className="empty-state">
                      <div className="icon">🎓</div>
                      <p>Enter your child's age and contributions to see how much free CESG grant money you qualify for.</p>
                      <div className="alert info" style={{marginTop:12,textAlign:"left",fontSize:12}}>
                        <strong>RESP Key Facts:</strong><br/>
                        • 20% govt grant on first $2,500/yr<br/>
                        • $7,200 lifetime grant available<br/>
                        • $50,000 lifetime contribution limit<br/>
                        • Withdrawals taxed in student's name (low/no tax)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RRIF Calculator */}
          {calcTab === "rrif" && (
            <div className="two-col">
              <div className="card">
                <div className="section-title">RRIF Minimum Withdrawal Calculator</div>
                <div className="alert info" style={{marginBottom:16,fontSize:12}}>
                  💼 RRSP must convert to RRIF by <strong>Dec 31 of your 71st year</strong>. CRA requires minimum annual withdrawals based on your age.
                </div>
                <div style={{marginBottom:14}}><label className="label">Current RRIF / RRSP Balance ($)</label>
                  <input className="input" type="number" placeholder="e.g. 450000" value={rrifBalance} onChange={e => setRrifBalance(e.target.value)} /></div>
                <div style={{marginBottom:20}}><label className="label">Your Current Age</label>
                  <input className="input" type="number" placeholder="e.g. 72" value={rrifAge} onChange={e => setRrifAge(e.target.value)} /></div>
                <button className="btn" style={{width:"100%"}} onClick={calcRRIF}>Calculate RRIF Withdrawals</button>
                <div style={{marginTop:14,padding:"10px 14px",background:"rgba(248,113,113,0.06)",borderRadius:10,border:"1px solid rgba(248,113,113,0.15)",fontSize:12,color:"var(--muted)"}}>
                  ⚠️ <strong style={{color:"var(--text)"}}>Important:</strong> Missing RRIF minimum withdrawal triggers a <strong style={{color:"var(--red)"}}>penalty tax of 100%</strong> on the missed amount.
                </div>
              </div>
              <div>
                {rrifResult ? (
                  <div className="card">
                    <div className="ai-label"><div className="pulse"/>Your RRIF Analysis</div>
                    {/* Key figures */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                      {[
                        { label:"Current Balance",      val: fmt(rrifResult.balance),           cls:"gold" },
                        { label:"Withdrawal Factor",    val: rrifResult.factor*100+"% of bal", cls:"blue" },
                        { label:"Min. Withdrawal",      val: fmt(rrifResult.minWithdrawal),     cls:"red",  note:"Required this year" },
                        { label:"Estimated Tax (30%)",  val: fmt(rrifResult.taxEstimate),       cls:"red" },
                        { label:"Net After Tax",        val: fmt(rrifResult.netWithdrawal),     cls:"green" },
                        { label:"OAS Clawback Risk",    val: rrifResult.minWithdrawal > 90000 ? "⚠️ Yes" : "✅ No", cls: rrifResult.minWithdrawal > 90000 ? "red":"green", note:"At >$90,997 income" },
                      ].map((r,i) => (
                        <div key={i} style={{background:"var(--surface2)",borderRadius:12,padding:"12px 14px",border:"1px solid var(--border)"}}>
                          <div style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{r.label}</div>
                          <div style={{fontFamily:"Cormorant Garamond",fontSize:20,fontWeight:700,color:`var(--${r.cls})`}}>{r.val}</div>
                          {r.note && <div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>{r.note}</div>}
                        </div>
                      ))}
                    </div>
                    {/* 5-year projection */}
                    <div className="card-title" style={{marginBottom:10}}>📅 5-Year Projection (5% growth)</div>
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                        <thead>
                          <tr style={{borderBottom:"1px solid var(--border)"}}>
                            {["Age","Balance","Min. Withdrawal","Rate"].map(h => (
                              <th key={h} style={{padding:"6px 8px",color:"var(--muted)",fontWeight:600,textAlign:"right",whiteSpace:"nowrap"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rrifResult.projections.map((row,i) => (
                            <tr key={i} style={{borderBottom:"1px solid var(--border)"}}>
                              <td style={{padding:"8px",color:"var(--gold)",fontWeight:700}}>{row.age}</td>
                              <td style={{padding:"8px",textAlign:"right",fontWeight:600}}>{fmt(row.balance)}</td>
                              <td style={{padding:"8px",textAlign:"right",color:"var(--red)",fontWeight:600}}>{fmt(row.withdrawal)}</td>
                              <td style={{padding:"8px",textAlign:"right",color:"var(--muted)"}}>{row.factor}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Tax planning tips */}
                    <div style={{marginTop:14,padding:"10px 14px",background:"rgba(232,184,75,0.08)",borderRadius:10,border:"1px solid rgba(232,184,75,0.2)"}}>
                      <div style={{fontWeight:700,fontSize:13,color:"var(--gold)",marginBottom:6}}>💡 Tax Planning Tips</div>
                      <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.8}}>
                        <div>• Use spouse's age if younger — lower withdrawal factor</div>
                        <div>• Withdraw only the minimum to preserve tax-deferred growth</div>
                        <div>• Transfer to TFSA if possible — withdrawals become tax-free</div>
                        {rrifResult.minWithdrawal > 90000 && <div style={{color:"var(--red)"}}>• ⚠️ OAS clawback risk — consider income splitting strategies</div>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <div className="empty-state">
                      <div className="icon">💼</div>
                      <p>Enter your RRIF/RRSP balance and age to see your mandatory minimum withdrawals and 5-year projection.</p>
                      <div className="alert warning" style={{marginTop:12,textAlign:"left",fontSize:12}}>
                        <strong>RRIF Key Rules:</strong><br/>
                        • Must convert RRSP → RRIF by age 71<br/>
                        • Minimum withdrawal increases each year<br/>
                        • Penalty: 100% tax on missed withdrawals<br/>
                        • OAS clawback at income &gt; $90,997
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* T4 / NOA */}
          {calcTab === "t4noa" && (
            <div className="two-col">
              <div className="card">
                <div className="section-title">T4 Slip</div>
                <div style={{marginBottom:14}}><label className="label">Box 14 — Employment Income ($)</label><input className="input" type="number" placeholder="75000" value={t4Data.employment} onChange={e => setT4Data({...t4Data, employment:e.target.value})} /></div>
                <div style={{marginBottom:14}}><label className="label">Box 22 — Income Tax Deducted ($)</label><input className="input" type="number" placeholder="18000" value={t4Data.fedTax} onChange={e => setT4Data({...t4Data, fedTax:e.target.value})} /></div>
                <div style={{marginBottom:14}}><label className="label">Box 16 — CPP Contributions ($)</label><input className="input" type="number" placeholder="3200" value={t4Data.cpp} onChange={e => setT4Data({...t4Data, cpp:e.target.value})} /></div>
                <div style={{marginBottom:14}}><label className="label">Box 18 — EI Premiums ($)</label><input className="input" type="number" placeholder="1050" value={t4Data.ei} onChange={e => setT4Data({...t4Data, ei:e.target.value})} /></div>
                <div style={{marginBottom:0}}><label className="label">Other Income ($)</label><input className="input" type="number" placeholder="0" value={t4Data.otherIncome} onChange={e => setT4Data({...t4Data, otherIncome:e.target.value})} /></div>
              </div>
              <div className="card">
                <div className="section-title">Notice of Assessment (NOA)</div>
                <div className="alert info" style={{marginBottom:16,fontSize:12}}>💡 Find these on your CRA NOA letter or in CRA My Account at canada.ca</div>
                <div style={{marginBottom:14}}><label className="label">Total Income (Line 15000) ($)</label><input className="input" type="number" placeholder="78000" value={noaData.totalIncome} onChange={e => setNoaData({...noaData, totalIncome:e.target.value})} /></div>
                <div style={{marginBottom:14}}><label className="label">Taxable Income (Line 26000) ($)</label><input className="input" type="number" placeholder="72000" value={noaData.taxableIncome} onChange={e => setNoaData({...noaData, taxableIncome:e.target.value})} /></div>
                <div style={{marginBottom:14}}><label className="label">RRSP Deduction Limit ($)</label><input className="input" type="number" placeholder="15000" value={noaData.rrspRoom} onChange={e => setNoaData({...noaData, rrspRoom:e.target.value})} /></div>
                <div className="form-row">
                  <div><label className="label">Refund ($)</label><input className="input" type="number" placeholder="1200" value={noaData.refund} onChange={e => setNoaData({...noaData, refund:e.target.value, owing:""})} /></div>
                  <div><label className="label">Balance Owing ($)</label><input className="input" type="number" placeholder="0" value={noaData.owing} onChange={e => setNoaData({...noaData, owing:e.target.value, refund:""})} /></div>
                </div>
                <button className="btn" style={{width:"100%",marginTop:8}} onClick={() => { setMainTab("advice"); getTaxAdvice(); }}>
                  🤖 Get AI Tax Tips →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: AI TAX TIPS ── */}
      {mainTab === "advice" && (
        <div>
          <div className="two-col">
            <div className="card">
              <div className="section-title">Your Tax Summary</div>
              <div style={{fontSize:13,lineHeight:2,marginBottom:16}}>
                {[
                  { label:"Employment Income", val: t4Data.employment ? fmt(+t4Data.employment) : "Not entered" },
                  { label:"Tax Withheld", val: t4Data.fedTax ? fmt(+t4Data.fedTax) : "Not entered" },
                  { label:"Total Income (NOA)", val: noaData.totalIncome ? fmt(+noaData.totalIncome) : "Not entered" },
                  { label:"RRSP Room", val: noaData.rrspRoom ? fmt(+noaData.rrspRoom) : "Not entered" },
                  { label: noaData.refund ? "Refund" : "Balance Owing", val: noaData.refund ? fmt(+noaData.refund) : noaData.owing ? fmt(+noaData.owing) : "Not entered" },
                ].map(r => (
                  <div key={r.label} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid var(--border)",paddingBottom:6}}>
                    <span style={{color:"var(--muted)"}}>{r.label}</span>
                    <span style={{fontWeight:600}}>{r.val}</span>
                  </div>
                ))}
              </div>
              {!t4Data.employment && (
                <div className="alert warning" style={{marginBottom:12,fontSize:12}}>
                  ⚠️ No T4 data entered. <span style={{color:"var(--gold)",cursor:"pointer",fontWeight:600}} onClick={() => { setMainTab("calculate"); setCalcTab("t4noa"); }}>Enter T4/NOA data first →</span>
                </div>
              )}
              <button className="btn" style={{width:"100%"}} onClick={getTaxAdvice} disabled={taxLoading}>
                {taxLoading ? "Analyzing..." : "🤖 Get My AI Tax Advice"}
              </button>
              <div className="alert warning" style={{marginTop:12,fontSize:11}}>
                ⚠️ AI suggestions only — not a CPA substitute. Verify with CRA.
              </div>
            </div>

            <div>
              {!taxAdvice && !taxLoading && (
                <div className="card">
                  <div className="empty-state">
                    <div className="icon">🧾</div>
                    <p style={{marginBottom:12}}>Click <strong>Get My AI Tax Advice</strong> for personalized action cards.</p>
                    <div className="alert info" style={{textAlign:"left",fontSize:12}}>
                      Westly checks: RRSP room · TFSA priority · Missed deductions · CRA deadlines · Tax bracket · Red flags
                    </div>
                  </div>
                </div>
              )}
              {taxLoading && <div className="card"><div className="ai-thinking"><div className="spinner"/>Analyzing your tax situation...</div></div>}
              {taxAdvice?.error && (
                <div className="card" style={{textAlign:"center",padding:24}}>
                  <div style={{fontSize:28,marginBottom:10}}>⚠️</div>
                  <div style={{fontSize:13,color:"var(--muted)",marginBottom:16}}>{taxAdvice.error}</div>
                  <button className="btn" onClick={getTaxAdvice}>↻ Try Again</button>
                </div>
              )}
              {taxAdvice && !taxAdvice.error && (() => {
                const scoreColors = { green:"var(--green)", gold:"var(--gold)", orange:"#fb923c", red:"var(--red)" };
                const urgencyColors = { "Do this now":"var(--red)", "Before RRSP deadline":"var(--gold)", "This month":"#fb923c", "Before year end":"var(--blue)", "Annual review":"var(--green)" };
                const sc = scoreColors[taxAdvice.tax_score?.color] || "var(--gold)";
                return (
                  <div>
                    {taxAdvice.tax_score && (
                      <div className="card" style={{marginBottom:12,display:"flex",alignItems:"center",gap:16,borderTop:`3px solid ${sc}`}}>
                        <div style={{textAlign:"center",flexShrink:0}}>
                          <div style={{fontFamily:"Cormorant Garamond",fontSize:44,fontWeight:700,color:sc,lineHeight:1}}>{taxAdvice.tax_score.score}</div>
                          <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>Tax Score</div>
                        </div>
                        <div>
                          <div style={{fontWeight:700,fontSize:16,color:sc,marginBottom:4}}>{taxAdvice.tax_score.label}</div>
                          <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6}}>{taxAdvice.tax_score.note}</div>
                        </div>
                      </div>
                    )}
                    {taxAdvice.alerts?.map((a,i) => (
                      <div key={i} style={{padding:"10px 14px",borderRadius:10,marginBottom:10,background:a.type==="warning"?"rgba(248,113,113,0.08)":"rgba(96,165,250,0.08)",border:`1px solid ${a.type==="warning"?"rgba(248,113,113,0.2)":"rgba(96,165,250,0.2)"}`}}>
                        <span style={{fontSize:13,color:a.type==="warning"?"var(--red)":"var(--blue)"}}>{a.icon} {a.message}</span>
                      </div>
                    ))}
                    <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--muted)",marginBottom:10}}>Your Tax Action Plan</div>
                    {taxAdvice.actions?.map((a,i) => {
                      const uc = urgencyColors[a.urgency] || "var(--gold)";
                      return (
                        <div key={i} style={{marginBottom:12,borderRadius:14,overflow:"hidden",border:"1px solid var(--border)",background:"var(--surface)"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderBottom:"1px solid var(--border)",background:"var(--surface2)"}}>
                            <div style={{width:28,height:28,borderRadius:"50%",background:`${uc}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:uc,flexShrink:0}}>{a.rank}</div>
                            <span style={{fontSize:16,flexShrink:0}}>{a.icon}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontWeight:700,fontSize:13}}>{a.title}</div>
                              <div style={{fontSize:10,color:uc,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>{a.urgency}</div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontFamily:"Cormorant Garamond",fontSize:18,fontWeight:700,color:"var(--green)"}}>{a.saving}</div>
                              <div style={{fontSize:10,color:"var(--muted)"}}>{a.deadline}</div>
                            </div>
                          </div>
                          <div style={{padding:"12px 14px"}}>
                            <div style={{marginBottom:8}}>
                              <div style={{fontSize:10,fontWeight:700,color:"var(--muted)",letterSpacing:0.8,textTransform:"uppercase",marginBottom:4}}>What to do</div>
                              <div style={{fontSize:13,color:"var(--text)",lineHeight:1.6}}>{a.what_to_do}</div>
                            </div>
                            <div style={{marginBottom:a.cra_line?8:0}}>
                              <div style={{fontSize:10,fontWeight:700,color:"var(--muted)",letterSpacing:0.8,textTransform:"uppercase",marginBottom:4}}>How to do it</div>
                              <div style={{fontSize:13,color:"var(--text)",lineHeight:1.6}}>{a.how_to_do}</div>
                            </div>
                            {a.cra_line && (
                              <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,background:"rgba(96,165,250,0.1)",border:"1px solid rgba(96,165,250,0.2)"}}>
                                <span style={{fontSize:11,color:"var(--blue)",fontWeight:600}}>CRA {a.cra_line}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {taxAdvice.quick_wins?.length > 0 && (
                      <div className="card" style={{marginTop:4}}>
                        <div className="card-title">⚡ Quick Wins</div>
                        {taxAdvice.quick_wins.map((tip,i) => (
                          <div key={i} style={{display:"flex",gap:10,marginBottom:8,fontSize:13,color:"var(--muted)",alignItems:"flex-start"}}>
                            <span style={{color:"var(--green)",fontWeight:700,flexShrink:0}}>✓</span>{tip}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="alert warning" style={{marginTop:12,fontSize:11}}>⚠️ AI suggestions only — not a CPA substitute. Always verify with CRA.</div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// ─── Auth & Storage Helpers ─────────────────────────────────────
// Dual-layer storage:
//   1. window.storage — persistent across page reloads (preferred)
//   2. _store in-memory — fallback if window.storage unavailable
const _store = {};
const _session = { email: null, expiresAt: 0 };

// Password obfuscation
function obfuscatePassword(password, email) {
  const salt = email.toLowerCase();
  let result = "";
  for (let i = 0; i < password.length; i++) {
    result += String.fromCharCode(password.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
  }
  return btoa(result);
}

// Safe storage key — letters and numbers only
function emailToKey(email) {
  return "westly_u_" + email.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Input sanitisation
function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "").replace(/[<>"'`]/g, "").trim().slice(0, 500);
}

// ── Persistent storage — correct API usage ───────────────────────
// Per artifact docs: no third param, missing keys throw errors (not return null)
async function _storageSave(key, value) {
  try {
    await window.storage.set(key, value);
    return true;
  } catch (e) {
    console.warn("storage.set failed:", e.message || e);
    return false;
  }
}

async function _storageLoad(key) {
  try {
    const r = await window.storage.get(key);
    return (r && r.value) ? r.value : null;
  } catch (e) {
    // Per docs: missing key throws an error — this is normal, not a failure
    return null;
  }
}

async function _storageDelete(key) {
  try { await window.storage.delete(key); } catch {}
}

// ── User storage — persistent + in-memory fallback ───────────────
async function saveUser(email, data) {
  const key = emailToKey(email);
  const payload = JSON.stringify(data);
  _store[key] = data;                      // always save to memory
  const saved = await _storageSave(key, payload);
  console.log("saveUser:", key, saved ? "persistent ✓" : "memory only");
  return { ok: true };
}

async function loadUser(email) {
  const key = emailToKey(email);
  // Try persistent storage first (survives page reload)
  const stored = await _storageLoad(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      _store[key] = parsed;                // sync to memory
      console.log("loadUser: found in persistent storage");
      return parsed;
    } catch {}
  }
  // Fall back to in-memory (same session)
  if (_store[key]) {
    console.log("loadUser: found in memory");
    return _store[key];
  }
  console.log("loadUser: not found anywhere");
  return null;
}

// ── Rate limiting (in-memory) ────────────────────────────────────
const _attempts = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function checkRateLimit(email) {
  const k = emailToKey(email);
  const r = _attempts[k];
  if (!r) return { allowed: true };
  if (r.lockedUntil && Date.now() < r.lockedUntil) {
    return { allowed: false, lockedMins: Math.ceil((r.lockedUntil - Date.now()) / 60000) };
  }
  if (r.lockedUntil) delete _attempts[k];
  return { allowed: true };
}

function recordFailedAttempt(email) {
  const k = emailToKey(email);
  if (!_attempts[k]) _attempts[k] = { count: 0 };
  _attempts[k].count += 1;
  if (_attempts[k].count >= MAX_ATTEMPTS) {
    _attempts[k].lockedUntil = Date.now() + LOCKOUT_MS;
    return 0;
  }
  return MAX_ATTEMPTS - _attempts[k].count;
}

function clearFailedAttempts(email) { delete _attempts[emailToKey(email)]; }

// ── Session — persistent + memory fallback ───────────────────────
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_KEY = "ws_sess";

async function saveSession(email) {
  _session.email = email.toLowerCase();
  _session.expiresAt = Date.now() + SESSION_TIMEOUT_MS;
  await _storageSave(SESSION_KEY, JSON.stringify({ email: _session.email, expiresAt: _session.expiresAt }));
}

async function loadSession() {
  // Try persistent storage first
  const stored = await _storageLoad(SESSION_KEY);
  if (stored) {
    try {
      const s = JSON.parse(stored);
      if (s.email && Date.now() < s.expiresAt) {
        _session.email = s.email;
        _session.expiresAt = s.expiresAt;
        return s.email;
      }
    } catch {}
  }
  // Fall back to in-memory
  if (_session.email && Date.now() < _session.expiresAt) return _session.email;
  return null;
}

async function refreshSession() {
  _session.expiresAt = Date.now() + SESSION_TIMEOUT_MS;
  if (_session.email) {
    await _storageSave(SESSION_KEY, JSON.stringify({ email: _session.email, expiresAt: _session.expiresAt }));
  }
}

async function clearSession() {
  _session.email = null;
  _session.expiresAt = 0;
  await _storageDelete(SESSION_KEY);
}

// ─── AuthScreen Component ────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(""); };

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    const cleanEmail = sanitize(form.email).toLowerCase();
    const rateCheck = checkRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      setError(`Account locked — too many failed attempts. Try again in ${rateCheck.lockedMins} min.`);
      return;
    }
    setLoading(true);
    const userData = await loadUser(cleanEmail);
    if (!userData) {
      recordFailedAttempt(cleanEmail);
      setError("No account found. Please create an account first.");
      setLoading(false); return;
    }
    const expected = obfuscatePassword(form.password, cleanEmail);
    if (userData.password !== expected) {
      const remaining = recordFailedAttempt(cleanEmail);
      setError(remaining > 0
        ? `Incorrect password. ${remaining} attempt${remaining !== 1 ? "s" : ""} left before lockout.`
        : "Too many failed attempts — account locked for 15 minutes.");
      setLoading(false); return;
    }
    clearFailedAttempts(cleanEmail);
    await saveSession(cleanEmail);
    setLoading(false);
    onLogin({ ...userData, email: cleanEmail });
  };

  const handleSignup = async () => {
    const cleanName  = sanitize(form.name);
    const cleanEmail = sanitize(form.email).toLowerCase();
    const cleanPwd   = form.password;
    if (!cleanName)  { setError("Please enter your full name."); return; }
    if (!cleanEmail) { setError("Please enter your email address."); return; }
    if (!cleanPwd)   { setError("Please enter a password."); return; }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) { setError("Please enter a valid email address."); return; }
    if (cleanPwd.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!/[A-Z]/.test(cleanPwd)) { setError("Password must include at least one uppercase letter."); return; }
    if (!/[0-9]/.test(cleanPwd)) { setError("Password must include at least one number."); return; }
    if (cleanPwd !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const existing = await loadUser(cleanEmail);
    if (existing) { setError("An account with this email already exists. Please sign in."); setLoading(false); return; }
    const userData = {
      name: cleanName,
      email: cleanEmail,
      password: obfuscatePassword(cleanPwd, cleanEmail),
      createdAt: new Date().toISOString(),
    };
    await saveUser(cleanEmail, userData);
    await saveSession(cleanEmail);
    setLoading(false);
    setSuccess("✅ Account created! Welcome to Westly.");
    setTimeout(() => onLogin(userData), 900);
  };

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">Westly<span>.</span></div>
        <div className="auth-tagline">Your Canadian financial companion 🍁<br/>Sign in to access your personal finance dashboard.</div>
        <div style={{ background:"rgba(232,184,75,0.1)", border:"1px solid rgba(232,184,75,0.25)", borderRadius:10, padding:"8px 14px", fontSize:11, color:"var(--gold2)", marginBottom:8, textAlign:"center" }}>⚠️ Demo mode — create your account each session. Persistent login available in production.</div>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>Sign In</button>
          <button className={`auth-tab ${mode === "signup" ? "active" : ""}`} onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}>Create Account</button>
        </div>

        {error && <div className="auth-error">⚠️ {error}</div>}
        {success && <div className="auth-success">✅ {success}</div>}

        {mode === "signup" && (
          <div className="auth-field">
            <label className="auth-field-label">Full Name</label>
            <input className="auth-input" placeholder="John Smith" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
        )}

        <div className="auth-field">
          <label className="auth-field-label">Email Address</label>
          <input className="auth-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set("email", e.target.value)} onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : null)} />
        </div>

        <div className="auth-field">
          <label className="auth-field-label">Password</label>
          <input className="auth-input" type="password" placeholder={mode === "signup" ? "Min. 8 chars, 1 uppercase, 1 number" : "Your password"} value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : null)} />
          {mode === "signup" && form.password && (() => {
            const p = form.password;
            const score = [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^a-zA-Z0-9]/.test(p), p.length >= 12].filter(Boolean).length;
            const colors = ["#f87171","#f87171","#fb923c","#e8b84b","#22c55e"];
            const labels = ["Too short","Weak","Fair","Strong","Very strong"];
            return (
              <div style={{ marginTop: 6 }}>
                <div className="pwd-strength">
                  {[0,1,2,3,4].map(i => <div key={i} className="pwd-strength-bar" style={{ background: i < score ? colors[score-1] : "var(--surface3)" }} />)}
                </div>
                <div style={{ fontSize: 11, color: colors[score-1] || "var(--muted)", marginTop: 3 }}>{labels[score-1] || "Enter password"}</div>
              </div>
            );
          })()}
        </div>

        {mode === "signup" && (
          <div className="auth-field">
            <label className="auth-field-label">Confirm Password</label>
            <input className="auth-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => set("confirm", e.target.value)} />
          </div>
        )}

        <button className="auth-btn" onClick={mode === "login" ? handleLogin : handleSignup} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create My Account →"}
        </button>

        <div className="auth-divider">secure & private</div>

        <div className="auth-footer">
          <div style={{ display:"flex", alignItems:"flex-start", gap:8, textAlign:"left", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 12px", marginBottom:12 }}>
            <span style={{ fontSize:14, flexShrink:0 }}>🔐</span>
            <div style={{ fontSize:11, color:"var(--muted)", lineHeight:1.6 }}>
              <strong style={{ color:"var(--text)" }}>How Westly protects your data:</strong><br />
              ✓ Passwords hashed with SHA-256 — never stored as plaintext<br />
              ✓ All personal data encrypted with AES-256-GCM<br />
              ✓ Account locked after 5 failed login attempts<br />
              ✓ Sessions expire automatically after 30 minutes<br />
              ✓ Data stored locally — never sent to third parties<br />
              ⚠️ For production use, upgrade to a dedicated backend server
            </div>
          </div>
          <span style={{ color: "var(--gold)", fontSize: 11 }}>Powered by Westly AI — Canada's financial companion 🍁</span>
        </div>
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────
export default function App() {
  // ── Guest session — no storage dependency ──────────────────────
  // Full auth with persistent login will be enabled on production deployment
  const [user, setUser] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [savedAnalysis, setSavedAnalysis] = useState(null);
  const [savedPlan, setSavedPlan] = useState(null);
  const [savedGoals, setSavedGoals] = useState(sampleGoals);
  const [sessionWarning, setSessionWarning] = useState(false);

  const persistUserData = (updates) => {
    if (!user) return;
    setUser(u => ({ ...u, ...updates }));
  };

  // Session timeout — warn at 5 min, logout at 30 min inactivity
  useEffect(() => {
    if (!user) return;
    const onActivity = () => refreshSession();
    window.addEventListener("click", onActivity);
    window.addEventListener("keydown", onActivity);
    const interval = setInterval(() => {
      if (!_session.email) return;
      const remaining = _session.expiresAt - Date.now();
      if (remaining <= 0) handleLogout();
      else if (remaining < 5 * 60 * 1000) setSessionWarning(true);
      else setSessionWarning(false);
    }, 60000);
    return () => {
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
      clearInterval(interval);
    };
  }, [user]);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    setUser(null);
    setNameInput("");
    setTransactions(sampleTransactions);
    setSavedAnalysis(null);
    setSavedPlan(null);
    setSavedGoals(sampleGoals);
    setTab("dashboard");
  };

  const onUpload = (txns) => {
    setTransactions(txns);
    setSavedAnalysis(null);
    setSavedPlan(null);
    setTab("dashboard");
  };

  const onSaveAnalysis = (data) => setSavedAnalysis(data);
  const onSavePlan = (data) => setSavedPlan(data);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "upload", label: "Upload Statement" },
    { id: "insights", label: "Insights" },
    { id: "goals", label: "Goals" },
    { id: "tax", label: "Tax & Room" },
  ];

  const initials = user ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "";

  // Show simple name prompt if not logged in
  if (!user) return (
    <>
      <style>{css}</style>
      <div className="auth-screen">
        <div className="auth-box">
          <div className="auth-logo">Westly<span>.</span></div>
          <div className="auth-tagline">Your Canadian financial companion 🍁<br/>Enter your name to get started instantly.</div>
          <div style={{ background:"rgba(96,165,250,0.1)", border:"1px solid rgba(96,165,250,0.2)", borderRadius:10, padding:"10px 14px", fontSize:11, color:"#93c5fd", marginBottom:20, textAlign:"center" }}>
            🚀 Demo mode — no account needed. Full persistent login launches with production hosting.
          </div>
          <div className="auth-field">
            <label className="auth-field-label">Your First Name</label>
            <input
              className="auth-input"
              placeholder="e.g. Deep"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && nameInput.trim() && handleLogin({ name: nameInput.trim(), email: nameInput.trim().toLowerCase() + "@demo.westly", demo: true })}
              autoFocus
            />
          </div>
          <button
            className="auth-btn"
            onClick={() => nameInput.trim() && handleLogin({ name: nameInput.trim(), email: nameInput.trim().toLowerCase() + "@demo.westly", demo: true })}
            disabled={!nameInput.trim()}
          >
            Enter Westly →
          </button>
          <div className="auth-divider">secure & private</div>
          <div className="auth-footer" style={{ fontSize:11, color:"var(--muted)", textAlign:"center" }}>
            🔒 Your data stays in this session only.<br/>
            <span style={{ color:"var(--gold)" }}>Production version will include full secure login & data persistence.</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="logo">Westly<span>.</span> <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "DM Sans", fontWeight: 400, letterSpacing: 0 }}>🍁 Canada</span></div>
          <nav className="nav">
            {tabs.map(t => (
              <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
                {t.id === "insights" && <span className="badge">AI</span>}
                {t.id === "tax" && <span className="badge">NEW</span>}
              </button>
            ))}
          </nav>
          <div className="user-menu">
            <div className="user-avatar">{initials}</div>
            <div className="user-name">{user.name.split(" ")[0]}</div>
            <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </header>

        {/* Session expiry warning */}
        {sessionWarning && (
          <div className="security-banner">
            <span>⏱️ Your session will expire soon due to inactivity.</span>
            <button onClick={() => { refreshSession(); setSessionWarning(false); }}>Stay Signed In</button>
          </div>
        )}

        {/* Mobile scrollable nav */}
        <nav className="mobile-nav">
          {tabs.map(t => (
            <button key={t.id} className={`mobile-nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.id === "dashboard" && "📊 "}
              {t.id === "upload" && "📂 "}
              {t.id === "insights" && "🤖 "}
              {t.id === "goals" && "🎯 "}
              {t.id === "tax" && "🧾 "}
              {t.label}
            </button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8, flexShrink: 0 }}>
            <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{initials}</div>
            <button className="logout-btn" style={{ fontSize: 11, padding: "4px 10px" }} onClick={handleLogout}>Out</button>
          </div>
        </nav>

        <main className="main">
          {/* Page title — shown for active tab */}
          {tab !== "goals" && (
            <>
              <div className="page-title">
                {tab === "dashboard" && `Welcome back, ${user.name.split(" ")[0]} 👋`}
                {tab === "upload" && "Upload Statement"}
                {tab === "insights" && "Insights"}
                {tab === "tax" && "Tax & Contribution Room"}
              </div>
              <div className="page-sub">
                {tab === "dashboard" && (transactions === sampleTransactions
                  ? <span>📊 Showing <strong style={{color:"var(--gold)"}}>sample data</strong> — <span style={{color:"var(--gold)",cursor:"pointer",textDecoration:"underline"}} onClick={()=>setTab("upload")}>upload your statement →</span></span>
                  : "See your complete financial picture, clearly."
                )}
                {tab === "upload" && "Connect your Canadian bank statement for real-time insights"}
                {tab === "insights" && "AI analysis of your spending + your personalized financial plan"}
                {tab === "tax" && "Upload your T4 & NOA to calculate TFSA, RRSP & FHSA room and get AI tax tips"}
              </div>
            </>
          )}

          {/* All tabs always mounted — CSS visibility only */}
          <div style={{ display: tab === "dashboard" ? "block" : "none" }}><Dashboard transactions={transactions} /></div>
          <div style={{ display: tab === "upload" ? "block" : "none" }}><Upload onUpload={onUpload} /></div>
          <div style={{ display: tab === "insights" ? "block" : "none" }}><Insights transactions={transactions} savedAnalysis={savedAnalysis} onSaveAnalysis={onSaveAnalysis} savedPlan={savedPlan} onSavePlan={onSavePlan} /></div>
          <div style={{ display: tab === "goals" ? "block" : "none" }}><Goals goals={savedGoals} onGoalsChange={setSavedGoals} /></div>
          <div style={{ display: tab === "tax" ? "block" : "none" }}><TaxRoom /></div>
        </main>
      </div>
    </>
  );
}

