/* ===========================================================================
   kg-shell.js - fill the footer attestation chip from the apex endpoint.

   Progressive enhancement: the footer in kg-shell.html works without JS (it
   reads "attestation: checking"). This upgrades the chip to ok / stale / fail
   based on the freshness of the apex deploy attestation, mirroring the apex
   verifier's three-state window (<=30d ok, <=60d stale, older still never reds
   on freshness alone). Needs the apex /.well-known/kg-verify.json to allow
   cross-origin reads; if it does not, the chip degrades to "unverified".
   =========================================================================== */
(function () {
  var el = document.querySelector("[data-kg-attest]");
  if (!el) return;
  var label = el.querySelector(".kg-attest-label");

  fetch("https://kineticgain.com/.well-known/kg-verify.json", { mode: "cors" })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (j) {
      var asOf = (j.audit && j.audit.as_of) || j.as_of;
      var ageDays = asOf ? (Date.now() - Date.parse(asOf)) / 86400000 : Infinity;
      var state = ageDays <= 30 ? "ok" : (ageDays <= 60 ? "stale" : "stale");
      el.setAttribute("data-state", state);
      label.textContent = "attestation: " + (state === "ok" ? "verified" : "verified · stale");
    })
    .catch(function () {
      el.setAttribute("data-state", "");
      label.textContent = "attestation: unverified";
    });
})();
