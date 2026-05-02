"use strict";

module.exports.register = function () {
  this.on("contentAggregated", ({ contentAggregate }) => {
    const docsBucket = contentAggregate.find((b) => b.name == null);
    if (!docsBucket?.nav?.length) return;

    const docsNavPaths = new Set(docsBucket.nav);
    const docsNavFiles = docsBucket.files.filter((f) =>
      docsNavPaths.has(f.path),
    );
    if (!docsNavFiles.length) return;

    const rewrite = (content) =>
      content
        .replace(/xref:midpoint::([^[\n]*)\[/g, "xref:ROOT:$1[")
        .replace(/xref:([^:[\n]+)\[/g, "xref::$1[");

    const rewrittenNavFiles = docsNavFiles.map((f) => ({
      original: f,
      contents: Buffer.from(rewrite(f.contents.toString())),
    }));

    for (const bucket of contentAggregate) {
      if (bucket.name !== "midpoint") continue;

      const mpNavPaths = new Set(bucket.nav);
      bucket.files = bucket.files.filter((f) => !mpNavPaths.has(f.path));

      const injected = rewrittenNavFiles.map(({ original, contents }) => {
        const clone = original.clone();
        clone.src = Object.assign({}, original.src);
        clone.contents = contents;
        return clone;
      });

      bucket.files.push(...injected);
      bucket.nav = injected.map((f) => f.path);
    }
  });
};
