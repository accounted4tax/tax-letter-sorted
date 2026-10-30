// cleanup-expired: deletes personal data whose retention period has ended.
// Called every hour by pg_cron with a private header. Option 3 cases have no
// delete_after date, so they are never touched here (kept for the AAT period).
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  const { data: settings } = await db.from("app_settings").select("cron_secret").eq("id", 1).single();
  const given = req.headers.get("x-cron-secret") ?? "";
  if (!settings?.cron_secret || given !== settings.cron_secret) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  }

  const { data: due, error } = await db.from("cases")
    .select("id, ref, product")
    .lte("delete_after", new Date().toISOString())
    .is("data_deleted_at", null)
    .limit(200);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const done: string[] = [];
  const failed: string[] = [];

  for (const c of due ?? []) {
    const { data: files } = await db.from("case_files").select("id, storage_path").eq("case_id", c.id).is("deleted_at", null);
    let ok = true;
    const byBucket: Record<string, string[]> = {};
    for (const f of files ?? []) {
      const [bucket, ...rest] = f.storage_path.split("/");
      (byBucket[bucket] ??= []).push(rest.join("/"));
    }
    for (const [bucket, paths] of Object.entries(byBucket)) {
      const r = await db.storage.from(bucket).remove(paths);
      if (r.error) ok = false;
    }
    if (!ok) { failed.push(c.ref); continue; }

    const now = new Date().toISOString();
    await db.from("case_files").update({ deleted_at: now }).eq("case_id", c.id).is("deleted_at", null);
    await db.from("case_answers").delete().eq("case_id", c.id);
    const update: Record<string, unknown> = { address: null, ni_number: null, utr: null, data_deleted_at: now };
    if (c.product === "option1") update.status = "deleted";
    await db.from("cases").update(update).eq("id", c.id);
    await db.from("audit_log").insert({
      actor: "system", action: "retention_delete", case_id: c.id,
      detail: { ref: c.ref, files: files?.length ?? 0 },
    });
    done.push(c.ref);
  }

  // Funnel step records are kept 24 months.
  const cutoff = new Date(Date.now() - 730 * 24 * 3600 * 1000).toISOString();
  await db.from("funnel_events").delete().lt("created_at", cutoff);

  return new Response(JSON.stringify({ deleted: done, failed }), { headers: { "Content-Type": "application/json" } });
});
