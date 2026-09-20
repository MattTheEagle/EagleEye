import { readFileSync, writeFileSync } from "node:fs";
const [, , which] = process.argv;
const path = "core/request-kernel.ts";
let s = readFileSync(path, "utf8");
if (which === "A") {
  // remove the JSON check of the handler result
  s = s.replace(/\n\s*if \(!isJsonValue\(value\)\) return fail\("handler-failed"[^\n]*\n/, "\n");
} else if (which === "B") {
  // swap step 2 (sender) and step 3 (handler): unknown types are answered before the sender is checked
  const i2 = s.indexOf("      // 2. sender"), i3 = s.indexOf("      // 3. handler"), i4 = s.indexOf("      // 4. version");
  s = s.slice(0, i2) + s.slice(i3, i4) + s.slice(i2, i3) + s.slice(i4);
  // the handler block is now first and `caller` is used later: declare it lazily is not needed, order is what matters
} else if (which === "C") {
  // remove the duplicate-type check
  s = s.replace(/\n\s*if \(byType\.has\(handler\.type\)\) \{[\s\S]*?\n\s*\}\n/, "\n");
}
writeFileSync(path, s);
