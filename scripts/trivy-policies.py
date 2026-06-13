import json
import sys

block_found = False

with open("trivy-results.json", "r") as f:
    data = json.load(f)

for result in data.get("Results", []):

    target = result.get("Target", "Unknown")

    for vuln in result.get("Vulnerabilities", []):

        package = vuln.get("PkgName", "Unknown")
        severity = vuln.get("Severity", "UNKNOWN")
        fixed_version = vuln.get("FixedVersion", "")

        fix_available = fixed_version != ""

        # BLOCK
        if severity == "CRITICAL" and fix_available:
            print(
                f"[BLOCK] {package} | "
                f"Severity={severity} | "
                f"Target={target} | "
                f"FixedVersion={fixed_version}"
            )

            block_found = True

        # TICKET
        elif severity == "HIGH" and fix_available:
            print(
                f"[TICKET] {package} | "
                f"Severity={severity} | "
                f"Target={target} | "
                f"FixedVersion={fixed_version}"
            )

        # WARN
        elif severity == "MEDIUM":
            print(
                f"[WARN] {package} | "
                f"Severity={severity} | "
                f"Target={target}"
            )

        # RISK ACCEPT
        elif severity == "CRITICAL" and not fix_available:
            print(
                f"[RISK ACCEPT] {package} | "
                f"Severity={severity} | "
                f"Target={target} | "
                f"No fix available"
            )

# Final decision
if block_found:
    print("\nPipeline failed due to BLOCK findings.")
    sys.exit(1)
else:
    print("\nNo BLOCK findings. Pipeline passed.")
    sys.exit(0)