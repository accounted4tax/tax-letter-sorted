// dev-test: pre-launch test helper – retired at launch (10 Nov 2026). Does nothing.
Deno.serve(() => new Response(JSON.stringify({ error: "gone" }), { status: 410, headers: { "Content-Type": "application/json" } }));
