// Public settings for the website. Nothing secret belongs in this file:
// API keys live only in Supabase (server side) and GitHub secrets.
window.TLS_CONFIG = {
  live: false,                       // false = "opening soon" (no uploads yet)
  openingNote: { en: "Opening January 2027", ro: "Se deschide în ianuarie 2027" },
  contactEmail: "letters@accounted4tax.co.uk",
  phone: "07563 811938",
  aatLicence: "[licence number]",   // fill in once Accounted4Tax Ltd is on the AAT licence
  functionsUrl: "https://pmngappuatunbhodqipn.supabase.co/functions/v1",
  languages: ["en", "ro"],
  defaultLanguage: "en",
  prices: { option2: "£19", option3: "£39", call: "£19" }
};
