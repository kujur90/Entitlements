import { neon } from "@neondatabase/serverless";

function getSql() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      "No database connection string found. Add a Postgres database to your Vercel project " +
        "(Storage tab) \u2014 it sets DATABASE_URL automatically."
    );
  }
  return neon(connectionString);
}

// ---- Published schemes -----------------------------------------------

export async function listSchemes({ state, category, onlyNew, q } = {}) {
  const sql = getSql();
  const conditions = ["status = 'published'"];
  const params = [];

  if (state && state !== "all") {
    params.push(state);
    conditions.push(`$${params.length} = ANY(states)`);
  }
  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  if (onlyNew) {
    conditions.push(`created_at >= NOW() - INTERVAL '45 days'`);
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(title::text ILIKE $${params.length} OR summary::text ILIKE $${params.length})`);
  }

  const query = `
    SELECT * FROM schemes
    WHERE ${conditions.join(" AND ")}
    ORDER BY created_at DESC
  `;
  return await sql(query, params);
}

export async function getSchemeBySlug(slug) {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM schemes WHERE slug = ${slug} AND status = 'published' LIMIT 1
  `;
  return rows[0] || null;
}

export async function getSchemeById(id) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM schemes WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

export async function createScheme(data) {
  const sql = getSql();
  const {
    slug, states, category, title, summary, description,
    eligibility, benefits, how_to_apply, deadline, source_name, source_url,
  } = data;
  const rows = await sql`
    INSERT INTO schemes
      (slug, states, category, title, summary, description, eligibility,
       benefits, how_to_apply, deadline, source_name, source_url, status)
    VALUES
      (${slug}, ${states}, ${category}, ${title}, ${summary}, ${description},
       ${eligibility}, ${benefits}, ${how_to_apply}, ${deadline || null},
       ${source_name}, ${source_url}, 'published')
    RETURNING *
  `;
  return rows[0];
}

export async function updateScheme(id, data) {
  const sql = getSql();
  const {
    states, category, title, summary, description,
    eligibility, benefits, how_to_apply, deadline, source_name, source_url,
  } = data;
  const rows = await sql`
    UPDATE schemes SET
      states = ${states}, category = ${category}, title = ${title},
      summary = ${summary}, description = ${description},
      eligibility = ${eligibility}, benefits = ${benefits},
      how_to_apply = ${how_to_apply}, deadline = ${deadline || null},
      source_name = ${source_name}, source_url = ${source_url},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function deleteScheme(id) {
  const sql = getSql();
  await sql`DELETE FROM schemes WHERE id = ${id}`;
}

// ---- Pending (scraped, awaiting admin review) -------------------------

export async function listPending() {
  const sql = getSql();
  return await sql`
    SELECT * FROM pending_schemes WHERE status = 'pending_review'
    ORDER BY created_at DESC
  `;
}

export async function getPendingById(id) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM pending_schemes WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

export async function insertPending({ source_name, source_url, excerpt, matched_keyword }) {
  const sql = getSql();
  // Avoid flagging the exact same excerpt from the same source twice.
  const existing = await sql`
    SELECT id FROM pending_schemes
    WHERE source_url = ${source_url} AND excerpt = ${excerpt}
    LIMIT 1
  `;
  if (existing[0]) return null;

  const rows = await sql`
    INSERT INTO pending_schemes (source_name, source_url, excerpt, matched_keyword, status)
    VALUES (${source_name}, ${source_url}, ${excerpt}, ${matched_keyword}, 'pending_review')
    RETURNING *
  `;
  return rows[0];
}

export async function setPendingStatus(id, status) {
  const sql = getSql();
  await sql`UPDATE pending_schemes SET status = ${status} WHERE id = ${id}`;
}

// ---- Scan sources (admin-configured pages the daily scan checks) ------

export async function listScanSources() {
  const sql = getSql();
  return await sql`SELECT * FROM scan_sources ORDER BY name ASC`;
}

export async function createScanSource({ name, url, keywords }) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO scan_sources (name, url, keywords)
    VALUES (${name}, ${url}, ${keywords})
    RETURNING *
  `;
  return rows[0];
}

export async function deleteScanSource(id) {
  const sql = getSql();
  await sql`DELETE FROM scan_sources WHERE id = ${id}`;
}
