import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceRoleKey) {
  console.error("Missing Supabase test environment variables.");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anonymous = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const results = [];
let testUserId;

function check(name, passed) {
  results.push({ name, passed });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
}

try {
  const email = `codex-security-${Date.now()}@example.com`;
  const password = `T!${randomUUID()}a9`;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Temporary security test" },
  });
  if (createError) throw createError;
  testUserId = created.user.id;

  await new Promise((resolve) => setTimeout(resolve, 700));
  const ordinary = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInError } = await ordinary.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  const audit = await anonymous.from("admin_audit_logs").select("id").limit(1);
  check("anonymous cannot read audit logs", !audit.error && audit.data.length === 0);

  const anonymousAd = await anonymous.from("homepage_ads").insert({ title: "SECURITY TEST - SHOULD FAIL" });
  check("anonymous cannot create ads", Boolean(anonymousAd.error));

  const anonymousFeedback = await anonymous.from("feedback_reports").insert({
    category: "bug",
    title: "SECURITY TEST",
    description: "This anonymous insert must fail.",
  });
  check("anonymous cannot submit feedback", Boolean(anonymousFeedback.error));

  const selfPromotion = await ordinary.from("profiles").update({ role: "admin" }).eq("id", testUserId).select("role");
  const finalProfile = await admin.from("profiles").select("role").eq("id", testUserId).single();
  check("ordinary user cannot self-promote", Boolean(selfPromotion.error) && finalProfile.data?.role !== "admin");

  const ordinaryAd = await ordinary.from("homepage_ads").insert({ title: "SECURITY TEST - SHOULD FAIL" });
  check("ordinary user cannot create ads", Boolean(ordinaryAd.error));

  const otherFeedback = await ordinary
    .from("feedback_reports")
    .select("id,user_id")
    .neq("user_id", testUserId)
    .limit(1);
  check("ordinary user cannot read other users' feedback", !otherFeedback.error && otherFeedback.data.length === 0);
} finally {
  await admin.from("homepage_ads").delete().eq("title", "SECURITY TEST - SHOULD FAIL");
  if (testUserId) await admin.auth.admin.deleteUser(testUserId);
}

if (results.some(({ passed }) => !passed)) process.exit(2);
