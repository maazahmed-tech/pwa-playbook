import { defineConfig } from "@neon/config/v1";

/**
 * Neon services this app uses — Postgres plus Object Storage.
 * The private bucket holds user uploads (item photos, avatar photos, generated
 * renders and 3D files) keyed by rows in Postgres and served only through the
 * app's authenticated storage proxy. Product and advert images live under a
 * `public/` prefix in the same bucket and are served without a session.
 *
 * `neon deploy` creates the bucket on the linked branch and pulls the S3-style
 * credentials into the env file; `neon env pull` validates a branch against this
 * declaration. Never re-pull the env for a branch whose credentials feed CI
 * secrets — pulling mints new credentials and invalidates the old ones.
 */
export default defineConfig({
  preview: {
    buckets: {
      "[bucket-name]": { access: "private" },
    },
  },
});
