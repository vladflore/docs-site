"use strict";

const fs = require("node:fs");
const path = require("node:path");

module.exports.register = function () {
  const rules = [];

  this.on("navigationBuilt", ({ contentCatalog }) => {
    for (const page of contentCatalog.getPages()) {
      const rawMovedFrom = page.asciidoc?.attributes?.["page-moved-from"];
      if (!rawMovedFrom || !page.pub?.url) continue;

      const targetUrl = page.pub.url;

      for (const entry of rawMovedFrom.split(",")) {
        const trimmed = entry.trim().replace(/\.adoc$/, "");
        if (!trimmed) continue;
        const from = ("/" + trimmed.replace(/^\/+/, "")).replace(/\/+$/, "");
        if (from && from !== "/") {
          const escaped = from.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
          rules.push(`RedirectMatch 301 ^${escaped}(/)?$ ${targetUrl}`);
        }
      }
    }
  });

  this.on("sitePublished", ({ playbook, publications }) => {
    if (!rules.length) return;

    const outputDir =
      publications?.find((p) => p.provider === "fs")?.rootDir ??
      playbook.output?.dir ??
      path.join(playbook.dir, "build/site");
    const outPath = path.join(outputDir, ".htaccess");
    fs.writeFileSync(outPath, rules.join("\n") + "\n");
    this.getLogger().info(
      `htaccess-extension: wrote ${rules.length} redirect rule(s) to ${outPath}`,
    );
  });
};
