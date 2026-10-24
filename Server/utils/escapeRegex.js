// User ka search text regex me daalne se pehle special chars escape (regex injection / ReDoS se bachav)
module.exports = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
