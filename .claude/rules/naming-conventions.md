# Naming conventions

Do not use single-letter variable names (`i`, `j`, `k`, `n`, `x`, `m`, `p`, `e`, `s`, `t`, `v`, `r`, `a`, `b`, etc.) for locals, parameters, or `v-for` aliases.

Prefer full words or clear compound names: `index`, `nodeIndex`, `section`, `segment`, `regexMatch`, `inputValue`, `pointerEvent`.

**Callbacks:** use `node` not `n`, `section` not `s`, `changeFile` not `f`.

**Loops:** use `index`, `starIndex`, or domain-specific names instead of `i`.

**Vue `v-for`:** e.g. `(section, sectionIndex)` instead of `(s, i)`.

**Regex:** name the result `match` or `regexMatch`; destructure capture groups to descriptive names.

Rare exceptions: mathematical coordinates (`x`, `y`, `z`) on graph/simulation nodes and canvas math, where they are the domain language.
