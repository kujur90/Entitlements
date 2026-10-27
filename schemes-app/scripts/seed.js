// One-off seed script. Run with: npm run seed
// Needs DATABASE_URL in your environment (pull it with `vercel env pull`,
// or run against your local .env.local that has it).
//
// IMPORTANT: the scheme details below are illustrative starting points, not
// verified current facts. Benefit amounts, deadlines and procedures change.
// Open the admin panel and check each one against its official source
// before telling anyone to rely on it.

const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);

const schemes = [
  {
    slug: "pm-kisan",
    states: ["all"],
    category: "welfare",
    title: { en: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)" },
    summary: { en: "Direct cash support of \u20b96,000 a year, paid to a farmer family's bank account in three instalments." },
    description: {
      en: "A central scheme that pays landholding farmer families \u20b96,000 per year, split into three \u20b92,000 instalments, transferred directly to their bank account. Open to farmer families across India, including the North-East.",
    },
    eligibility: { en: "Farmer families with cultivable landholding records in their name (land records requirements have been relaxed for the North-East in the past \u2014 check current rules). A woman can be the registered landholder and receive the benefit directly." },
    benefits: { en: "\u20b96,000 per year in three instalments, paid directly to the beneficiary's bank account (DBT)." },
    how_to_apply: { en: "Register online at pmkisan.gov.in, or through your local Common Service Centre (CSC) or agriculture extension office, with your land record and Aadhaar-linked bank account." },
    deadline: null,
    source_name: "PM-KISAN official portal",
    source_url: "https://pmkisan.gov.in/",
  },
  {
    slug: "mksp-mahila-kisan",
    states: ["all"],
    category: "training",
    title: { en: "Mahila Kisan Sashaktikaran Pariyojana (MKSP)" },
    summary: { en: "A sub-scheme under the national rural livelihoods mission built specifically for women farmers \u2014 training, collectives, and better access to inputs and markets." },
    description: {
      en: "MKSP works through women's Self-Help Groups (SHGs) under DAY-NRLM to build women farmers' skills, give them a stronger collective voice, and improve their access to sustainable agriculture practices, inputs, and markets. Implemented through state rural livelihood missions, so availability and the exact activities vary by state.",
    },
    eligibility: { en: "Women farmers, usually organised or organising into Self-Help Groups through the State Rural Livelihood Mission (in Assam: ASRLM)." },
    benefits: { en: "Training in agriculture and allied activities, support to set up women-led collectives/producer groups, and help with market linkage." },
    how_to_apply: { en: "Reach out to your local Self-Help Group federation or the State Rural Livelihood Mission office (in Assam, ASRLM) \u2014 MKSP is usually rolled out through existing SHG networks rather than individual applications." },
    deadline: null,
    source_name: "DAY-NRLM, Ministry of Rural Development",
    source_url: "https://rural.gov.in/en/major-schemes/mahila-kisan-sashaktikaran-pariyojna-mksp",
  },
  {
    slug: "pmfby-crop-insurance",
    states: ["all"],
    category: "insurance",
    title: { en: "Pradhan Mantri Fasal Bima Yojana (PMFBY) \u2014 Crop Insurance" },
    summary: { en: "Low-premium crop insurance that pays out if your crop is damaged by drought, flood, pests, or other covered risks." },
    description: {
      en: "Farmers pay a small share of the premium (as little as 1.5\u20132% of sum insured for food/oilseed crops), and the government pays the rest. If the insured crop is damaged by natural causes \u2014 including the floods common across parts of the North-East \u2014 the farmer receives a payout based on assessed loss.",
    },
    eligibility: { en: "Farmers growing notified crops in notified areas for that season, whether owner-cultivators or tenant/sharecropper farmers; women farmers are equally eligible in their own name." },
    benefits: { en: "Payout for crop loss from drought, flood, pest attack, and other notified risks, at a low farmer premium share." },
    how_to_apply: { en: "Apply through your bank (if you have a Kisan Credit Card loan, enrolment may be automatic unless you opt out), a Common Service Centre, an insurance company branch, or the PMFBY portal, before the cut-off date for your crop season." },
    deadline: null,
    source_name: "PMFBY official portal",
    source_url: "https://pmfby.gov.in/",
  },
  {
    slug: "kisan-credit-card",
    states: ["all"],
    category: "credit",
    title: { en: "Kisan Credit Card (KCC)" },
    summary: { en: "A revolving credit line for farming costs \u2014 seed, fertiliser, and other inputs \u2014 at a subsidised interest rate." },
    description: {
      en: "The Kisan Credit Card gives farmers a flexible credit limit for crop production and related needs, at concessional interest, with an interest subvention that can bring the effective rate down further for prompt repayment. Can also cover post-harvest and allied needs for some banks.",
    },
    eligibility: { en: "Farmers, including tenant farmers, sharecroppers and women farmers, with land or cultivation records; SHG members can often apply as a group." },
    benefits: { en: "Short-term credit at concessional interest (commonly discussed as around 4% effective rate for timely repayment, subject to current government interest subvention rules \u2014 confirm with your bank)." },
    how_to_apply: { en: "Apply at any nationalised bank, cooperative bank, or regional rural bank branch with land/cultivation documents and identity proof; many banks now also accept KCC applications online." },
    deadline: null,
    source_name: "Department of Financial Services",
    source_url: "https://www.myscheme.gov.in/schemes/kcc",
  },
  {
    slug: "movcdner-organic-ne",
    states: ["assam", "nagaland", "meghalaya", "manipur", "mizoram", "tripura", "arunachal", "sikkim"],
    category: "marketing",
    title: { en: "Mission Organic Value Chain Development for North Eastern Region (MOVCDNER)" },
    summary: { en: "A North-East-only scheme that supports farmers to grow organic, form producer groups, and link to certified organic markets." },
    description: {
      en: "MOVCDNER is built specifically for the North-East's farmers to develop certified organic value chains \u2014 from farm-level organic production, to Farmer Producer Organisations/Companies, to processing and marketing. Many women-led FPOs and SHGs in the region have accessed this.",
    },
    eligibility: { en: "Farmers and farmer groups (including SHG federations and Farmer Producer Organisations) in the eight North-Eastern states willing to take up certified organic practices." },
    benefits: { en: "Support for organic inputs, certification costs, farmer group formation, post-harvest infrastructure, and market linkage for organic produce." },
    how_to_apply: { en: "Contact your state's Agriculture/Horticulture department or North Eastern Regional Agricultural Marketing Corporation (NERAMAC) office, or ask your local FPO/SHG federation if they are already a MOVCDNER partner." },
    deadline: null,
    source_name: "MOVCDNER official portal",
    source_url: "https://movcdner.gov.in/",
  },
  {
    slug: "stand-up-india",
    states: ["all"],
    category: "credit",
    title: { en: "Stand-Up India" },
    summary: { en: "Bank loans between \u20b910 lakh and \u20b91 crore for women setting up a new enterprise, which can include agri-processing or allied agri-business." },
    description: {
      en: "Every bank branch is expected to support at least one woman borrower under this scheme for a greenfield (new) enterprise in manufacturing, services, trading, or agri-allied activities such as food processing.",
    },
    eligibility: { en: "Women entrepreneurs aged 18+ setting up a new (greenfield) enterprise; at least 51% shareholding/controlling stake must be held by the woman if it's a company or partnership." },
    benefits: { en: "Composite loan (term loan + working capital) between \u20b910 lakh and \u20b91 crore, covering up to 75% of the project cost." },
    how_to_apply: { en: "Apply at any Scheduled Commercial Bank branch, or online through the Stand-Up India portal." },
    deadline: null,
    source_name: "Stand-Up India official portal",
    source_url: "https://www.standupmitra.in/",
  },
];

async function main() {
  for (const s of schemes) {
    await sql`
      INSERT INTO schemes
        (slug, states, category, title, summary, description, eligibility,
         benefits, how_to_apply, deadline, source_name, source_url, status)
      VALUES
        (${s.slug}, ${s.states}, ${s.category}, ${s.title}, ${s.summary},
         ${s.description}, ${s.eligibility}, ${s.benefits}, ${s.how_to_apply},
         ${s.deadline}, ${s.source_name}, ${s.source_url}, 'published')
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log(`Seeded: ${s.slug}`);
  }
  console.log("Done. Open /admin to review, translate, and correct these before sharing the site widely.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
