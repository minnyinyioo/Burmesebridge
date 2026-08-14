import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const unavailable = [url, anonKey, serviceRoleKey].some(
  (value) => !value || value === "[Sensitive]",
);
if (unavailable) {
  console.error(
    "Missing usable Supabase test variables. Sensitive Vercel values cannot be pulled by the CLI; provide NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in the local process environment.",
  );
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
let moderatorUserId;
let testJobId;

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

  const moderatorEmail = `codex-moderator-${Date.now()}@example.com`;
  const moderatorPassword = `T!${randomUUID()}m8`;
  const { data: createdModerator, error: moderatorCreateError } = await admin.auth.admin.createUser({
    email: moderatorEmail,
    password: moderatorPassword,
    email_confirm: true,
    user_metadata: { full_name: "Temporary moderator test" },
  });
  if (moderatorCreateError) throw moderatorCreateError;
  moderatorUserId = createdModerator.user.id;
  await new Promise((resolve) => setTimeout(resolve, 700));
  const { error: roleError } = await admin.from("profiles").update({ role: "moderator" }).eq("id", moderatorUserId);
  if (roleError) throw roleError;

  const moderator = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: moderatorSignInError } = await moderator.auth.signInWithPassword({
    email: moderatorEmail,
    password: moderatorPassword,
  });
  if (moderatorSignInError) throw moderatorSignInError;

  const uniqueTitle = `SECURITY TEST JOB ${Date.now()}`;
  const { data: createdJob, error: jobCreateError } = await moderator.from("news").insert({
    title: uniqueTitle,
    content: "Temporary security test listing.",
    title_en: uniqueTitle,
    content_en: "Temporary security test listing.",
    category: "jobs",
    status: "draft",
    author_id: moderatorUserId,
    recruitment_verification: "unverified",
    recruitment_safety_confirmed: true,
  }).select("id").single();
  if (jobCreateError) throw jobCreateError;
  testJobId = createdJob.id;

  const moderatorReview = await moderator.from("news").update({
    recruitment_verification: "reviewed",
    recruitment_review_note: "Automated security review.",
  }).eq("id", testJobId).select("recruitment_verification").single();
  check("moderator can mark a job reviewed", !moderatorReview.error && moderatorReview.data?.recruitment_verification === "reviewed");

  const moderatorVerify = await moderator.from("news").update({ recruitment_verification: "verified" }).eq("id", testJobId);
  const finalJob = await admin.from("news").select("recruitment_verification").eq("id", testJobId).single();
  check("moderator cannot verify a job", Boolean(moderatorVerify.error) && finalJob.data?.recruitment_verification === "reviewed");
} finally {
  await admin.from("homepage_ads").delete().eq("title", "SECURITY TEST - SHOULD FAIL");
  if (testJobId) await admin.from("news").delete().eq("id", testJobId);
  if (moderatorUserId) await admin.auth.admin.deleteUser(moderatorUserId);
  if (testUserId) await admin.auth.admin.deleteUser(testUserId);
}

if (results.some(({ passed }) => !passed)) process.exit(2);
