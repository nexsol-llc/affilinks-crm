// app/page.jsx
'use client';

import { useState, useEffect, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE CONFIGURATION - Replace with your credentials
// ─────────────────────────────────────────────────────────────────────────────
const supabaseUrl = "https://syqpkqkdgkvsifpqquwg.supabase.co"
const supabaseAnonKey = "sb_publishable_jufiWO0me0NMTS2dKUrZUA_BiZv-PfX"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection on load
if (typeof window !== 'undefined') {
  supabase.from('clients').select('*', { count: 'exact', head: true })
    .then(({ error }) => {
      if (error) {
        console.error('❌ Supabase connection error:', error.message)
        console.log('⚠️ Please run the SQL queries in Supabase SQL Editor first')
      } else {
        console.log('✅ Supabase connected successfully!')
      }
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// SQL QUERIES TO RUN IN SUPABASE SQL EDITOR
// ─────────────────────────────────────────────────────────────────────────────
/*
-- Run these queries in your Supabase SQL Editor (https://supabase.com/dashboard/project/syqpkqkdgkvsifpqquwg/sql)

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  mrr INTEGER DEFAULT 300,
  assigned_to TEXT,
  start_date DATE,
  niche TEXT,
  notes TEXT,
  tags TEXT[]
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  contact TEXT,
  stage TEXT DEFAULT 'discovery',
  value INTEGER DEFAULT 300,
  owner TEXT,
  created_at DATE,
  probability INTEGER
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  assigned_to TEXT,
  due_date DATE,
  priority TEXT,
  status TEXT DEFAULT 'pending',
  client_id TEXT
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  score INTEGER
);

-- Insert sample clients
INSERT INTO clients (id, name, status, mrr, assigned_to, start_date, niche, notes, tags) VALUES 
  ('c1', 'TechNova SaaS', 'active', 300, 'u2', '2025-03-01', 'SaaS', 'Happy client, referred 2 leads', ARRAY['vip']),
  ('c2', 'GrowthLabs', 'active', 300, 'u2', '2025-02-15', 'E-com', 'Monthly review on 15th', ARRAY[]),
  ('c3', 'PixelForge', 'active', 300, 'u2', '2025-04-01', 'Agency', 'Needs custom report', ARRAY['at-risk']),
  ('c4', 'DataStream AI', 'churned', 0, 'u2', '2025-01-01', 'AI', 'Budget cuts', ARRAY[])
ON CONFLICT (id) DO NOTHING;

-- Insert sample deals
INSERT INTO deals (id, company, contact, stage, value, owner, created_at, probability) VALUES 
  ('d1', 'CloudBase', 'Ryan Marsh', 'discovery', 300, 'u1', '2025-05-01', 20),
  ('d2', 'ScaleOps', 'Priya Menon', 'proposal', 300, 'u1', '2025-04-28', 50),
  ('d3', 'MarketMind', 'Jake Torres', 'negotiation', 300, 'u1', '2025-04-20', 70),
  ('d4', 'ViralReach', 'Sam Lin', 'won', 300, 'u1', '2025-04-15', 100),
  ('d5', 'FlowMetrics', 'Dana Fox', 'discovery', 300, 'u1', '2025-05-03', 20),
  ('d6', 'NexusAgency', 'Omar Karim', 'proposal', 300, 'u1', '2025-05-02', 50),
  ('d7', 'BrandBoost', 'Tara Singh', 'won', 300, 'u1', '2025-04-10', 100),
  ('d8', 'AdSphere', 'Leo Park', 'lost', 300, 'u1', '2025-04-05', 0)
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (id, title, assigned_to, due_date, priority, status, client_id) VALUES 
  ('t1', 'Send onboarding doc to TechNova', 'u2', '2025-05-08', 'high', 'pending', 'c1'),
  ('t2', 'Pull Apollo leads — SaaS niche', 'u3', '2025-05-08', 'high', 'pending', NULL),
  ('t3', 'Follow up: ScaleOps proposal', 'u1', '2025-05-09', 'high', 'pending', NULL),
  ('t4', 'Monthly report for GrowthLabs', 'u4', '2025-05-15', 'medium', 'pending', 'c2'),
  ('t5', 'Warm up mailboxes batch 3', 'u3', '2025-05-10', 'medium', 'done', NULL),
  ('t6', 'Update LinkedIn sequence script', 'u5', '2025-05-12', 'low', 'pending', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample leads
INSERT INTO leads (id, company, contact, email, source, status, score) VALUES 
  ('l1', 'Orbit Media', 'Chris Dale', 'chris@orb.io', 'apollo', 'new', 85),
  ('l2', 'LoopBack Inc', 'Nina Ross', 'nina@loop.co', 'linkedin', 'contacted', 72),
  ('l3', 'PeakFunnel', 'Dev Nair', 'dev@peak.io', 'apollo', 'replied', 91),
  ('l4', 'SurgeScale', 'Mia Chen', 'mia@surge.co', 'referral', 'new', 78),
  ('l5', 'ClickMatrix', 'Paul West', 'paul@click.io', 'apollo', 'booked', 95),
  ('l6', 'GrowthNode', 'Sara Kim', 'sara@grow.co', 'linkedin', 'contacted', 60)
ON CONFLICT (id) DO NOTHING;
*/

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSIONS & ROLE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const PERMISSIONS = {
  owner: {
    views: ["pipeline", "clients", "tasks", "leads", "revenue", "team"],
    canEditDeals: true, canDeleteDeals: true,
    canEditClients: true, canDeleteClients: true,
    canEditTasks: true, canAssignTasks: true,
    canEditLeads: true, canViewRevenue: true,
    canManageTeam: true, canExport: true,
  },
  onboarding: {
    views: ["clients", "tasks"],
    canEditDeals: false, canDeleteDeals: false,
    canEditClients: true, canDeleteClients: false,
    canEditTasks: true, canAssignTasks: false,
    canEditLeads: false, canViewRevenue: false,
    canManageTeam: false, canExport: false,
  },
  data: {
    views: ["leads", "tasks", "pipeline"],
    canEditDeals: false, canDeleteDeals: false,
    canEditClients: false, canDeleteClients: false,
    canEditTasks: true, canAssignTasks: false,
    canEditLeads: true, canViewRevenue: false,
    canManageTeam: false, canExport: true,
  },
  ops: {
    views: ["tasks", "clients", "leads"],
    canEditDeals: false, canDeleteDeals: false,
    canEditClients: false, canDeleteClients: false,
    canEditTasks: true, canAssignTasks: false,
    canEditLeads: false, canViewRevenue: false,
    canManageTeam: false, canExport: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS & STYLES
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg: "#070710",
  s1: "#0d0d1c",
  s2: "#111128",
  s3: "#161630",
  border: "#1e1e3a",
  b2: "#2c2c52",
  purple: "#7c6af7",
  violet: "#5b4ee8",
  accent: "#a78bfa",
  pink: "#e879f9",
  green: "#34d399",
  red: "#f87171",
  amber: "#fbbf24",
  blue: "#60a5fa",
  text: "#e2e2f0",
  muted: "#6b6b90",
  dim: "#3a3a60",
};

const ROLE_COLORS = { 
  owner: T.purple, 
  onboarding: T.green, 
  data: T.blue, 
  ops: T.amber 
};

const ROLE_LABELS = { 
  owner: "Owner", 
  onboarding: "Onboarding", 
  data: "Data", 
  ops: "Ops" 
};

const STAGE_ORDER = ["discovery", "proposal", "negotiation", "won", "lost"];
const STAGE_COLORS = { 
  discovery: T.blue, 
  proposal: T.amber, 
  negotiation: T.purple, 
  won: T.green, 
  lost: T.red 
};

const PRIORITY_COLORS = { 
  high: T.red, 
  medium: T.amber, 
  low: T.blue 
};

const LEAD_STATUS_COLORS = { 
  new: T.blue, 
  contacted: T.amber, 
  replied: T.purple, 
  booked: T.green 
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
function useAuth() { return useContext(AuthCtx); }

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ 
      width: 24, 
      height: 24, 
      border: `2px solid ${T.border}`, 
      borderTopColor: T.purple, 
      borderRadius: "50%", 
      animation: "spin 0.7s linear infinite" 
    }} />
  );
}

function Avatar({ initials, color, size = 32 }) {
  return (
    <div style={{
      width: size, 
      height: size, 
      borderRadius: "50%",
      background: `${color}22`, 
      border: `1.5px solid ${color}55`,
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      fontSize: size * 0.32, 
      fontWeight: 700, 
      color,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, style: extra }) {
  const base = {
    display: "inline-flex", 
    alignItems: "center", 
    gap: 6,
    borderRadius: 8, 
    fontWeight: 600, 
    transition: "all 0.15s",
    fontSize: size === "sm" ? 12 : 13,
    padding: size === "sm" ? "5px 12px" : "8px 16px",
    opacity: disabled ? 0.4 : 1, 
    cursor: disabled ? "not-allowed" : "pointer",
    ...extra,
  };
  
  const variants = {
    primary: { background: T.purple, color: "#fff" },
    secondary: { background: T.s2, color: T.text, border: `1px solid ${T.border}` },
    ghost: { background: "transparent", color: T.muted },
    danger: { background: `${T.red}22`, color: T.red, border: `1px solid ${T.red}40` },
    success: { background: `${T.green}22`, color: T.green, border: `1px solid ${T.green}40` },
  };
  
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

function Card({ children, style: extra, onClick }) {
  return (
    <div 
      onClick={onClick} 
      style={{
        background: T.s1, 
        border: `1px solid ${T.border}`, 
        borderRadius: 12,
        padding: 20, 
        animation: "fadeIn 0.2s ease",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s",
        ...extra,
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = T.b2)}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = T.border)}
    >
      {children}
    </div>
  );
}

function Modal({ title, children, onClose, width = 480 }) {
  return (
    <div style={{
      position: "fixed", 
      inset: 0, 
      background: "#000000cc", 
      backdropFilter: "blur(4px)",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      zIndex: 1000,
      padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: T.s1, 
        border: `1px solid ${T.b2}`, 
        borderRadius: 16,
        width: "100%", 
        maxWidth: width, 
        maxHeight: "90vh", 
        overflowY: "auto",
        animation: "fadeIn 0.15s ease",
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "18px 24px", 
          borderBottom: `1px solid ${T.border}` 
        }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", color: T.muted, fontSize: 20, lineHeight: 1, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ 
        display: "block", 
        marginBottom: 6, 
        fontSize: 12, 
        fontWeight: 600, 
        color: T.muted, 
        textTransform: "uppercase", 
        letterSpacing: "0.06em" 
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color = T.purple, icon }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ 
            fontSize: 11, 
            fontWeight: 600, 
            color: T.muted, 
            textTransform: "uppercase", 
            letterSpacing: "0.07em", 
            marginBottom: 8 
          }}>
            {label}
          </div>
          <div style={{ 
            fontSize: 28, 
            fontWeight: 800, 
            color, 
            fontFamily: "monospace", 
            lineHeight: 1 
          }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize: 22, opacity: 0.5 }}>{icon}</div>}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO USERS (Create these in Supabase Auth first)
// ─────────────────────────────────────────────────────────────────────────────
// Go to Supabase Dashboard → Authentication → Users → Add User
// Add each user with their password and metadata:
// {
//   "role": "owner",
//   "name": "Ammad",
//   "avatar": "AM"
// }

const DEMO_USERS = [
  { email: "ammad@affilinks.io", password: "owner123", name: "Ammad", role: "owner", avatar: "AM" },
  { email: "shibrah@affilinks.io", password: "onboard123", name: "Shibrah", role: "onboarding", avatar: "SH" },
  { email: "sudais@affilinks.io", password: "data123", name: "Sudais", role: "data", avatar: "SU" },
  { email: "hamza@affilinks.io", password: "ops123", name: "Hamza", role: "ops", avatar: "HZ" },
  { email: "muneeb@affilinks.io", password: "ops123", name: "Muneeb", role: "ops", avatar: "MN" },
];

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { 
      setError("Enter email and password"); 
      return; 
    }
    setLoading(true); 
    setError("");
    
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    
    setLoading(false);
    if (err) { 
      setError(err.message); 
      return; 
    }
    onLogin(data.session);
  };

  const quickLogin = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setTimeout(() => handleLogin(), 100);
  };

  return (
    <div style={{
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: T.bg, 
      padding: 24, 
      position: "relative", 
      overflow: "hidden",
    }}>
      <div style={{ 
        position: "absolute", 
        top: "20%", 
        left: "50%", 
        transform: "translateX(-50%)", 
        width: 500, 
        height: 500, 
        background: `radial-gradient(circle, ${T.purple}18 0%, transparent 70%)`, 
        pointerEvents: "none" 
      }} />

      <div style={{ width: "100%", maxWidth: 420, animation: "fadeIn 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 10, 
              background: `linear-gradient(135deg, ${T.purple}, ${T.pink})`, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: 18 
            }}>
              🔗
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Affi<span style={{ color: T.accent }}>Links</span>
            </span>
          </div>
          <div style={{ fontSize: 13, color: T.muted }}>Affiliate Management Platform</div>
        </div>

        <Card style={{ padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>Access your team workspace</p>

          {error && (
            <div style={{ 
              background: `${T.red}18`, 
              border: `1px solid ${T.red}40`, 
              borderRadius: 8, 
              padding: "10px 14px", 
              marginBottom: 16, 
              fontSize: 13, 
              color: T.red 
            }}>
              {error}
            </div>
          )}

          <Field label="Email">
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@affilinks.io" 
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%",
                background: T.s2,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "10px 12px",
                color: T.text,
                fontSize: 13,
                outline: "none",
              }}
            />
          </Field>
          <Field label="Password">
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%",
                background: T.s2,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "10px 12px",
                color: T.text,
                fontSize: 13,
                outline: "none",
              }}
            />
          </Field>

          <Btn onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "12px 16px" }}>
            {loading ? <Spinner /> : "Sign In →"}
          </Btn>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
            <div style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              color: T.muted, 
              textTransform: "uppercase", 
              letterSpacing: "0.07em", 
              marginBottom: 12 
            }}>
              Quick Demo Login
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {DEMO_USERS.map(u => (
                <button 
                  key={u.email} 
                  onClick={() => quickLogin(u)} 
                  style={{
                    background: T.s2, 
                    border: `1px solid ${T.border}`, 
                    borderRadius: 20,
                    padding: "4px 10px", 
                    fontSize: 11, 
                    fontWeight: 600, 
                    color: T.muted,
                    cursor: "pointer", 
                    transition: "all 0.15s",
                    display: "flex", 
                    alignItems: "center", 
                    gap: 5,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: ROLE_COLORS[u.role] }} />
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "pipeline", label: "Pipeline", icon: "⬡" },
  { id: "clients", label: "Clients", icon: "◈" },
  { id: "leads", label: "Leads", icon: "◎" },
  { id: "tasks", label: "Tasks", icon: "▣" },
  { id: "revenue", label: "Revenue", icon: "◆" },
  { id: "team", label: "Team", icon: "⬡" },
];

function Sidebar({ activeView, onNav, onLogout }) {
  const { user, permissions } = useAuth();
  const allowedViews = permissions.views;

  return (
    <div style={{
      width: 220, 
      flexShrink: 0, 
      background: T.s1,
      borderRight: `1px solid ${T.border}`,
      display: "flex", 
      flexDirection: "column",
      height: "100vh", 
      position: "sticky", 
      top: 0,
    }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ 
            width: 30, 
            height: 30, 
            borderRadius: 8, 
            background: `linear-gradient(135deg, ${T.purple}, ${T.pink})`, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: 15, 
            flexShrink: 0 
          }}>
            🔗
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Affi<span style={{ color: T.accent }}>Links</span>
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {NAV_ITEMS.filter(n => allowedViews.includes(n.id)).map(item => {
          const active = activeView === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => onNav(item.id)} 
              style={{
                display: "flex", 
                alignItems: "center", 
                gap: 10,
                width: "100%", 
                padding: "9px 12px", 
                borderRadius: 8,
                background: active ? `${T.purple}20` : "transparent",
                color: active ? T.accent : T.muted,
                fontWeight: active ? 700 : 500, 
                fontSize: 13,
                border: active ? `1px solid ${T.purple}30` : "1px solid transparent",
                marginBottom: 2, 
                transition: "all 0.12s",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 14, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
              {active && <span style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: T.purple }} />}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "14px 14px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Avatar initials={user.avatar} color={ROLE_COLORS[user.role]} size={32} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: ROLE_COLORS[user.role], textTransform: "uppercase", letterSpacing: "0.06em" }}>{ROLE_LABELS[user.role]}</div>
          </div>
        </div>
        <Btn variant="ghost" size="sm" onClick={onLogout} style={{ width: "100%", justifyContent: "center", fontSize: 11 }}>
          Sign out
        </Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE VIEW
// ─────────────────────────────────────────────────────────────────────────────
function PipelineView() {
  const { permissions } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ company: "", contact: "", stage: "discovery", value: 300 });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (!error && data) setDeals(data);
    setLoading(false);
  };

  const addDeal = async () => {
    const newDeal = { 
      id: `d${Date.now()}`, 
      ...form, 
      owner: "u1", 
      created_at: new Date().toISOString().split("T")[0],
      probability: { discovery: 20, proposal: 50, negotiation: 70, won: 100, lost: 0 }[form.stage]
    };
    await supabase.from('deals').insert([newDeal]);
    fetchDeals();
    setModal(null);
    setForm({ company: "", contact: "", stage: "discovery", value: 300 });
  };

  const updateStage = async (dealId, stage) => {
    const prob = { discovery: 20, proposal: 50, negotiation: 70, won: 100, lost: 0 };
    await supabase.from('deals').update({ stage, probability: prob[stage] }).eq('id', dealId);
    fetchDeals();
  };

  const deleteDeal = async (dealId) => {
    await supabase.from('deals').delete().eq('id', dealId);
    fetchDeals();
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner /></div>;

  const wonValue = deals.filter(d => d.stage === "won").length * 300;
  const pipelineValue = deals.filter(d => !["won", "lost"].includes(d.stage)).length * 300;
  const totalDeals = deals.filter(d => ["won", "lost"].includes(d.stage)).length;
  const winRate = totalDeals ? Math.round((deals.filter(d => d.stage === "won").length / totalDeals) * 100) : 0;

  return (
    <div style={{ animation: "fadeIn 0.2s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Pipeline</h1>
          <p style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>{deals.length} deals tracked</p>
        </div>
        {permissions.canEditDeals && (
          <Btn onClick={() => setModal("add")}>+ New Deal</Btn>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Won MRR" value={`$${wonValue.toLocaleString()}`} color={T.green} icon="✓" />
        <StatCard label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} color={T.purple} icon="⬡" />
        <StatCard label="Win Rate" value={`${winRate}%`} color={T.amber} icon="◆" />
      </div>

      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
        {STAGE_ORDER.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const color = STAGE_COLORS[stage];
          return (
            <div key={stage} style={{ minWidth: 260, flex: "0 0 260px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color }}>{stage}</span>
                </div>
                <span style={{ fontSize: 11, color: T.muted, fontFamily: "monospace" }}>{stageDeals.length}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stageDeals.map(deal => (
                  <div key={deal.id} style={{
                    background: T.s2, 
                    border: `1px solid ${T.border}`, 
                    borderRadius: 10, 
                    padding: 14,
                    borderLeft: `3px solid ${color}`,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{deal.company}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>{deal.contact}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace", marginBottom: 10 }}>${deal.value}/mo</div>

                    {permissions.canEditDeals && stage !== "won" && stage !== "lost" && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {STAGE_ORDER.filter(s => s !== stage && s !== "lost").map(s => (
                          <button 
                            key={s} 
                            onClick={() => updateStage(deal.id, s)} 
                            style={{
                              fontSize: 10, 
                              padding: "2px 7px", 
                              borderRadius: 4,
                              background: `${STAGE_COLORS[s]}18`, 
                              color: STAGE_COLORS[s],
                              border: `1px solid ${STAGE_COLORS[s]}30`, 
                              cursor: "pointer",
                            }}
                          >
                            → {s}
                          </button>
                        ))}
                      </div>
                    )}
                    {permissions.canDeleteDeals && (
                      <button 
                        onClick={() => deleteDeal(deal.id)} 
                        style={{ 
                          marginTop: 8, 
                          fontSize: 10, 
                          color: T.red, 
                          background: "none", 
                          border: "none", 
                          cursor: "pointer", 
                          opacity: 0.6 
                        }}
                      >
                        remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {modal === "add" && (
        <Modal title="New Deal" onClose={() => setModal(null)}>
          <Field label="Company">
            <input 
              value={form.company} 
              onChange={e => setForm(p => ({ ...p, company: e.target.value }))} 
              placeholder="Company name"
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            />
          </Field>
          <Field label="Contact">
            <input 
              value={form.contact} 
              onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} 
              placeholder="Contact name"
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            />
          </Field>
          <Field label="Stage">
            <select 
              value={form.stage} 
              onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            >
              {STAGE_ORDER.filter(s => s !== "won" && s !== "lost").map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn onClick={addDeal} style={{ flex: 1, justifyContent: "center" }}>Add Deal</Btn>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function ClientsView() {
  const { permissions } = useAuth();
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", niche: "", notes: "", status: "active" });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase.from('clients').select('*');
    if (!error && data) setClients(data);
    setLoading(false);
  };

  const addClient = async () => {
    const newClient = { 
      id: `c${Date.now()}`, 
      mrr: 300, 
      assigned_to: "u2", 
      start_date: new Date().toISOString().split("T")[0], 
      tags: [], 
      ...form 
    };
    await supabase.from('clients').insert([newClient]);
    fetchClients();
    setModal(null);
    setForm({ name: "", niche: "", notes: "", status: "active" });
  };

  const removeClient = async (id) => {
    await supabase.from('clients').delete().eq('id', id);
    fetchClients();
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner /></div>;

  const active = clients.filter(c => c.status === "active").length;
  const mrr = active * 300;

  return (
    <div style={{ animation: "fadeIn 0.2s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Clients</h1>
          <p style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>{active} active · ${mrr.toLocaleString()} MRR</p>
        </div>
        {permissions.canEditClients && (
          <Btn onClick={() => setModal("add")}>+ Add Client</Btn>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {clients.map(client => (
          <Card key={client.id} onClick={() => setSelected(client)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{client.name}</div>
                <span style={{ 
                  display: "inline-flex", 
                  padding: "2px 8px", 
                  borderRadius: 20, 
                  fontSize: 11, 
                  fontWeight: 600, 
                  background: client.status === "active" ? `${T.green}22` : `${T.red}22`,
                  color: client.status === "active" ? T.green : T.red,
                  border: `1px solid ${client.status === "active" ? T.green : T.red}40`,
                }}>
                  {client.status}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.green, fontFamily: "monospace" }}>${client.mrr}</div>
                <div style={{ fontSize: 10, color: T.muted }}>per month</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>
              <span style={{ marginRight: 12 }}>📁 {client.niche}</span>
              <span>📅 {client.start_date}</span>
            </div>
            {client.notes && (
              <div style={{ fontSize: 11, color: T.muted, background: T.s2, borderRadius: 6, padding: "6px 10px", fontStyle: "italic" }}>
                "{client.notes}"
              </div>
            )}
            {client.tags?.includes("vip") && (
              <span style={{ 
                display: "inline-flex", 
                marginTop: 8, 
                padding: "2px 8px", 
                borderRadius: 20, 
                fontSize: 11, 
                background: `${T.purple}22`, 
                color: T.accent, 
                border: `1px solid ${T.purple}40` 
              }}>
                ⭐ VIP
              </span>
            )}
            {client.tags?.includes("at-risk") && (
              <span style={{ 
                display: "inline-flex", 
                marginTop: 8, 
                padding: "2px 8px", 
                borderRadius: 20, 
                fontSize: 11, 
                background: `${T.red}22`, 
                color: T.red, 
                border: `1px solid ${T.red}40` 
              }}>
                ⚠ At Risk
              </span>
            )}
            {permissions.canDeleteClients && (
              <button 
                onClick={e => { e.stopPropagation(); removeClient(client.id); }} 
                style={{ marginTop: 10, fontSize: 10, color: T.red, background: "none", border: "none", cursor: "pointer", opacity: 0.5 }}
              >
                remove
              </button>
            )}
          </Card>
        ))}
      </div>

      {modal === "add" && (
        <Modal title="Add Client" onClose={() => setModal(null)}>
          <Field label="Company Name">
            <input 
              value={form.name} 
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
              placeholder="Client name"
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            />
          </Field>
          <Field label="Niche">
            <input 
              value={form.niche} 
              onChange={e => setForm(p => ({ ...p, niche: e.target.value }))} 
              placeholder="SaaS, E-com, Agency..."
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            />
          </Field>
          <Field label="Notes">
            <textarea 
              value={form.notes} 
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} 
              placeholder="Any notes..." 
              rows={3} 
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text, resize: "vertical" }}
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={addClient} style={{ flex: 1, justifyContent: "center" }}>Add Client</Btn>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              ["Status", selected.status],
              ["MRR", `$${selected.mrr}/mo`],
              ["Niche", selected.niche],
              ["Start Date", selected.start_date],
              ["Notes", selected.notes || "—"],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ color: T.muted, fontSize: 12 }}>{label}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{val}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASKS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function TasksView() {
  const { user, permissions } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", assigned_to: user.id, due_date: "", priority: "medium" });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (!error && data) setTasks(data);
    setLoading(false);
  };

  const addTask = async () => {
    const newTask = { id: `t${Date.now()}`, status: "pending", client_id: null, ...form };
    await supabase.from('tasks').insert([newTask]);
    fetchTasks();
    setModal(false);
    setForm({ title: "", assigned_to: user.id, due_date: "", priority: "medium" });
  };

  const toggleTask = async (id, currentStatus) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    fetchTasks();
  };

  const removeTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner /></div>;

  const myTasks = tasks.filter(t => t.assigned_to === user.id || user.role === "owner");
  const filtered = filter === "all" ? myTasks : myTasks.filter(t => t.status === filter);
  const pending = myTasks.filter(t => t.status === "pending").length;
  const done = myTasks.filter(t => t.status === "done").length;

  return (
    <div style={{ animation: "fadeIn 0.2s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Tasks</h1>
          <p style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>{pending} pending · {done} done</p>
        </div>
        <Btn onClick={() => setModal(true)}>+ New Task</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "pending", "done"].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            style={{
              padding: "5px 14px", 
              borderRadius: 20, 
              fontSize: 12, 
              fontWeight: 600,
              background: filter === f ? T.purple : T.s2,
              color: filter === f ? "#fff" : T.muted,
              border: `1px solid ${filter === f ? T.purple : T.border}`,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(task => {
          const assignee = DEMO_USERS.find(u => u.id === task.assigned_to);
          const overdue = task.status === "pending" && task.due_date && task.due_date < new Date().toISOString().split("T")[0];
          return (
            <div 
              key={task.id} 
              style={{
                background: T.s2, 
                border: `1px solid ${task.status === "done" ? T.border : overdue ? `${T.red}50` : T.border}`,
                borderRadius: 10, 
                padding: "12px 16px",
                display: "flex", 
                alignItems: "center", 
                gap: 12,
                opacity: task.status === "done" ? 0.55 : 1,
              }}
            >
              <button 
                onClick={() => toggleTask(task.id, task.status)} 
                style={{
                  width: 20, 
                  height: 20, 
                  borderRadius: 6, 
                  flexShrink: 0,
                  background: task.status === "done" ? T.green : "transparent",
                  border: `2px solid ${task.status === "done" ? T.green : T.b2}`,
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  cursor: "pointer", 
                  color: "#fff", 
                  fontSize: 11,
                }}
              >
                {task.status === "done" && "✓"}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, textDecoration: task.status === "done" ? "line-through" : "none" }}>
                  {task.title}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center" }}>
                  {task.due_date && <span style={{ fontSize: 11, color: overdue ? T.red : T.muted }}>📅 {task.due_date}</span>}
                  <span style={{ 
                    display: "inline-flex", 
                    padding: "2px 8px", 
                    borderRadius: 20, 
                    fontSize: 11, 
                    fontWeight: 600, 
                    background: task.priority === "high" ? `${T.red}22` : task.priority === "medium" ? `${T.amber}22` : `${T.blue}22`,
                    color: task.priority === "high" ? T.red : task.priority === "medium" ? T.amber : T.blue,
                    border: `1px solid ${task.priority === "high" ? T.red : task.priority === "medium" ? T.amber : T.blue}40`,
                  }}>
                    {task.priority}
                  </span>
                  {assignee && user.role === "owner" && (
                    <span style={{ fontSize: 11, color: T.muted }}>→ {assignee.name}</span>
                  )}
                </div>
              </div>
              {permissions.canEditTasks && (
                <button onClick={() => removeTask(task.id)} style={{ fontSize: 12, color: T.red, background: "none", border: "none", cursor: "pointer", opacity: 0.5 }}>✕</button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: T.dim }}>No tasks found</div>
        )}
      </div>

      {modal && (
        <Modal title="New Task" onClose={() => setModal(false)}>
          <Field label="Task Title">
            <input 
              value={form.title} 
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} 
              placeholder="What needs to be done?"
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            />
          </Field>
          <Field label="Due Date">
            <input 
              type="date" 
              value={form.due_date} 
              onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            />
          </Field>
          <Field label="Priority">
            <select 
              value={form.priority} 
              onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Field>
          {permissions.canAssignTasks && (
            <Field label="Assign To">
              <select 
                value={form.assigned_to} 
                onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))}
                style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
              >
                {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </Field>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={addTask} style={{ flex: 1, justifyContent: "center" }}>Add Task</Btn>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEADS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function LeadsView() {
  const { permissions } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ company: "", contact: "", email: "", source: "apollo", status: "new", score: 70 });

  useEffect(() => { 
    fetchLeads(); 
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase.from('leads').select('*');
    if (!error && data) setLeads(data);
    setLoading(false);
  };

  const addLead = async () => {
    const newLead = { id: `l${Date.now()}`, ...form };
    await supabase.from('leads').insert([newLead]);
    fetchLeads();
    setModal(false);
    setForm({ company: "", contact: "", email: "", source: "apollo", status: "new", score: 70 });
  };

  const updateStatus = async (id, status) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    fetchLeads();
  };

  const removeLead = async (id) => {
    await supabase.from('leads').delete().eq('id', id);
    fetchLeads();
  };

  const STATUSES = ["new", "contacted", "replied", "booked"];
  const STATUS_COLORS = { new: T.blue, contacted: T.amber, replied: T.purple, booked: T.green };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner /></div>;

  return (
    <div style={{ animation: "fadeIn 0.2s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Leads</h1>
          <p style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>{leads.length} leads · {leads.filter(l => l.status === "booked").length} booked</p>
        </div>
        {permissions.canEditLeads && <Btn onClick={() => setModal(true)}>+ Add Lead</Btn>}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              {["Company", "Contact", "Email", "Source", "Score", "Status", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td style={{ padding: "11px 12px", fontWeight: 600, fontSize: 13, borderBottom: `1px solid ${T.border}` }}>{lead.company}</td>
                <td style={{ padding: "11px 12px", fontSize: 13, color: T.muted, borderBottom: `1px solid ${T.border}` }}>{lead.contact}</td>
                <td style={{ padding: "11px 12px", fontSize: 12, color: T.muted, fontFamily: "monospace", borderBottom: `1px solid ${T.border}` }}>{lead.email}</td>
                <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ 
                    display: "inline-flex", 
                    padding: "2px 8px", 
                    borderRadius: 20, 
                    fontSize: 11, 
                    fontWeight: 600, 
                    background: lead.source === "apollo" ? `${T.blue}22` : lead.source === "linkedin" ? `${T.purple}22` : `${T.green}22`,
                    color: lead.source === "apollo" ? T.blue : lead.source === "linkedin" ? T.purple : T.green,
                    border: `1px solid ${lead.source === "apollo" ? T.blue : lead.source === "linkedin" ? T.purple : T.green}40`,
                  }}>
                    {lead.source}
                  </span>
                </td>
                <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 48, height: 4, background: T.s3, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${lead.score}%`, height: "100%", background: lead.score > 80 ? T.green : lead.score > 60 ? T.amber : T.red, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: T.muted }}>{lead.score}</span>
                  </div>
                </td>
                <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.border}` }}>
                  {permissions.canEditLeads ? (
                    <select 
                      value={lead.status} 
                      onChange={e => updateStatus(lead.id, e.target.value)} 
                      style={{ width: "auto", fontSize: 12, padding: "3px 8px", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text }}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span style={{ 
                      display: "inline-flex", 
                      padding: "2px 8px", 
                      borderRadius: 20, 
                      fontSize: 11, 
                      fontWeight: 600, 
                      background: `${STATUS_COLORS[lead.status]}22`,
                      color: STATUS_COLORS[lead.status],
                      border: `1px solid ${STATUS_COLORS[lead.status]}40`,
                    }}>
                      {lead.status}
                    </span>
                  )}
                </td>
                <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.border}` }}>
                  {permissions.canEditLeads && (
                    <button onClick={() => removeLead(lead.id)} style={{ fontSize: 11, color: T.red, background: "none", border: "none", cursor: "pointer", opacity: 0.5 }}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Add Lead" onClose={() => setModal(false)}>
          <Field label="Company">
            <input 
              value={form.company} 
              onChange={e => setForm(p => ({ ...p, company: e.target.value }))} 
              placeholder="Company name"
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            />
          </Field>
          <Field label="Contact">
            <input 
              value={form.contact} 
              onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} 
              placeholder="Contact name"
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            />
          </Field>
          <Field label="Email">
            <input 
              value={form.email} 
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
              placeholder="email@company.com"
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            />
          </Field>
          <Field label="Source">
            <select 
              value={form.source} 
              onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
              style={{ width: "100%", background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text }}
            >
              <option value="apollo">Apollo</option>
              <option value="linkedin">LinkedIn</option>
              <option value="referral">Referral</option>
              <option value="inbound">Inbound</option>
            </select>
          </Field>
          <Field label="Lead Score (0-100)">
            <input 
              type="range" 
              min={0} 
              max={100} 
              value={form.score} 
              onChange={e => setForm(p => ({ ...p, score: parseInt(e.target.value) }))} 
              style={{ width: "100%", border: "none", padding: 0, background: "none" }}
            />
            <span style={{ fontSize: 12, color: T.muted }}>{form.score}</span>
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={addLead} style={{ flex: 1, justifyContent: "center" }}>Add Lead</Btn>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE VIEW (Owner only)
// ─────────────────────────────────────────────────────────────────────────────
function RevenueView() {
  const [clients, setClients] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('deals').select('*')
    ]).then(([{ data: clientsData }, { data: dealsData }]) => {
      if (clientsData) setClients(clientsData);
      if (dealsData) setDeals(dealsData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner /></div>;

  const active = clients.filter(c => c.status === "active");
  const mrr = active.length * 300;
  const arr = mrr * 12;
  const won = deals.filter(d => d.stage === "won").length;
  const pipeline = deals.filter(d => !["won", "lost"].includes(d.stage)).length;
  const churned = clients.filter(c => c.status === "churned").length;
  const churnRate = clients.length ? Math.round((churned / clients.length) * 100) : 0;

  const monthlyData = [
    { month: "Jan", mrr: 600 }, 
    { month: "Feb", mrr: 900 },
    { month: "Mar", mrr: 900 }, 
    { month: "Apr", mrr: 1200 },
    { month: "May", mrr: mrr },
  ];
  const maxMrr = Math.max(...monthlyData.map(d => d.mrr), mrr);

  return (
    <div style={{ animation: "fadeIn 0.2s ease" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Revenue</h1>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 24 }}>Financial overview — visible to Owner only</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="MRR" value={`$${mrr.toLocaleString()}`} color={T.green} icon="💰" sub={`${active.length} active clients × $300`} />
        <StatCard label="ARR" value={`$${arr.toLocaleString()}`} color={T.purple} icon="📈" sub="Annualized" />
        <StatCard label="Won Deals" value={won} color={T.blue} icon="✓" sub={`+${pipeline} in pipeline`} />
        <StatCard label="Churn Rate" value={`${churnRate}%`} color={churnRate > 20 ? T.red : T.amber} icon="⚠" sub={`${churned} churned`} />
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 20 }}>MRR Growth</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
          {monthlyData.map(({ month, mrr: m }) => (
            <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: T.muted }}>${m}</span>
              <div style={{ 
                width: "100%", 
                borderRadius: "4px 4px 0 0", 
                background: `linear-gradient(180deg, ${T.purple}, ${T.violet})`, 
                height: `${(m / maxMrr) * 100}px`, 
                minHeight: 4, 
                transition: "height 0.4s ease" 
              }} />
              <span style={{ fontSize: 11, color: T.muted }}>{month}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Client Breakdown</div>
        {active.map(c => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{c.niche} · since {c.start_date}</div>
            </div>
            <div style={{ fontWeight: 700, color: T.green, fontFamily: "monospace" }}>$300/mo</div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontWeight: 700 }}>
          <span>Total MRR</span>
          <span style={{ color: T.green, fontFamily: "monospace" }}>${mrr}/mo</span>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEAM VIEW (Owner only)
// ─────────────────────────────────────────────────────────────────────────────
function TeamView() {
  return (
    <div style={{ animation: "fadeIn 0.2s ease" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Team & Permissions</h1>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 24 }}>Role-based access control</p>

      <div style={{ display: "grid", gap: 14, marginBottom: 24 }}>
        {DEMO_USERS.map(u => {
          const perms = PERMISSIONS[u.role];
          return (
            <Card key={u.email}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <Avatar initials={u.avatar} color={ROLE_COLORS[u.role]} size={40} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{u.email}</div>
                </div>
                <span style={{ 
                  marginLeft: "auto", 
                  display: "inline-flex", 
                  padding: "2px 8px", 
                  borderRadius: 20, 
                  fontSize: 11, 
                  fontWeight: 600, 
                  background: `${ROLE_COLORS[u.role]}22`, 
                  color: ROLE_COLORS[u.role], 
                  border: `1px solid ${ROLE_COLORS[u.role]}40` 
                }}>
                  {ROLE_LABELS[u.role]}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[
                  ["Edit Deals", perms.canEditDeals], ["Edit Clients", perms.canEditClients],
                  ["Edit Tasks", perms.canEditTasks], ["Assign Tasks", perms.canAssignTasks],
                  ["Edit Leads", perms.canEditLeads], ["View Revenue", perms.canViewRevenue],
                  ["Manage Team", perms.canManageTeam], ["Export", perms.canExport],
                ].map(([label, allowed]) => (
                  <span key={label} style={{ 
                    display: "inline-flex", 
                    padding: "2px 8px", 
                    borderRadius: 20, 
                    fontSize: 11, 
                    fontWeight: 600, 
                    background: allowed ? `${T.green}22` : `${T.dim}22`,
                    color: allowed ? T.green : T.muted,
                    border: `1px solid ${allowed ? T.green : T.dim}40`,
                  }}>
                    {allowed ? "✓" : "✗"} {label}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: T.muted }}>
                Access: <strong style={{ color: T.text }}>{perms.views.join(", ")}</strong>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Supabase Row Level Security</div>
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.8 }}>
          In production, these permissions map to Supabase RLS policies. Each table has policies.
        </div>
        <div style={{ marginTop: 12, background: T.s2, borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 11, color: T.accent, lineHeight: 2 }}>
          <div style={{ color: T.muted }}>-- Example RLS policy for clients table</div>
          <div><span style={{ color: T.purple }}>CREATE POLICY</span> "owners can do all" <span style={{ color: T.purple }}>ON</span> clients</div>
          <div style={{ paddingLeft: 16 }}><span style={{ color: T.purple }}>USING</span> (auth.jwt() -&gt;&gt; 'role' = 'owner');</div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCESS DENIED
// ─────────────────────────────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Access Restricted</h2>
      <p style={{ color: T.muted, maxWidth: 300 }}>Your role doesn't have permission to view this section. Contact Ammad to request access.</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("pipeline");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <Spinner />
      </div>
    );
  }

  if (!session) return <LoginScreen onLogin={setSession} />;

  const user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
    role: session.user.user_metadata?.role || "ops",
    avatar: session.user.user_metadata?.avatar || session.user.email?.substring(0, 2).toUpperCase(),
  };

  const permissions = PERMISSIONS[user.role] || PERMISSIONS.ops;

  const VIEWS = {
    pipeline: PipelineView,
    clients: ClientsView,
    tasks: TasksView,
    leads: LeadsView,
    revenue: RevenueView,
    team: TeamView,
  };

  const ViewComponent = VIEWS[activeView] || PipelineView;
  const hasAccess = permissions.views.includes(activeView);

  return (
    <AuthCtx.Provider value={{ user, permissions }}>
      <div style={{ display: "flex", minHeight: "100vh", background: T.bg }}>
        <Sidebar activeView={activeView} onNav={setActiveView} onLogout={handleLogout} />
        <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxWidth: "100%" }}>
          {hasAccess ? <ViewComponent /> : <AccessDenied />}
        </main>
      </div>
    </AuthCtx.Provider>
  );
}

export default App;