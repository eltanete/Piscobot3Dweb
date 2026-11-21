interface ImportMetaEnv {
  /** '' (Node) o '.php' (hosting estático). Lo define astro.config.mjs. */
  readonly PUBLIC_API_EXT: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly PUBLIC_GA_ID?: string;
  readonly PUBLIC_CLARITY_ID?: string;
  readonly PUBLIC_NOINDEX?: string;
  readonly PUBLIC_KEYSTATIC_GITHUB_APP_SLUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
