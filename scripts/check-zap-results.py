import json
import sys
import os

print("🔍 Checking ZAP scan results...\n")

# Read report files
user_report_path = "zap-reports/zap-user-report.json"
admin_report_path = "zap-reports/zap-admin-report.json"

# Check if files exist
if not os.path.exists(user_report_path):
    print(f"❌ User report not found!")
    sys.exit(1)

if not os.path.exists(admin_report_path):
    print(f"❌ Admin report not found!")
    sys.exit(1)

# Read JSON files
with open(user_report_path) as f:
    user_report = json.load(f)

with open(admin_report_path) as f:
    admin_report = json.load(f)

# Extract alerts
user_alerts = user_report.get("site", [{}])[0].get("alerts", [])
admin_alerts = admin_report.get("site", [{}])[0].get("alerts", [])

# Count by severity (riskcode: '3' = High, '2' = Medium)
user_high = len([a for a in user_alerts if a.get("riskcode") == "3"])
user_medium = len([a for a in user_alerts if a.get("riskcode") == "2"])

admin_high = len([a for a in admin_alerts if a.get("riskcode") == "3"])
admin_medium = len([a for a in admin_alerts if a.get("riskcode") == "2"])

# Print results
print(f"📊 User Context: {user_high} High, {user_medium} Medium")
print(f"📊 Admin Context: {admin_high} High, {admin_medium} Medium")

total_high = user_high + admin_high
total_medium = user_medium + admin_medium

print(f"\n📈 Total: {total_high} High, {total_medium} Medium\n")

# Decision: Block or Pass
if total_high > 0:
    print("❌ BLOCKED: High severity vulnerabilities found!")
    
    # Show which vulnerabilities
    all_alerts = user_alerts + admin_alerts
    high_alerts = [a for a in all_alerts if a.get("riskcode") == "3"]
    
    print("\nHigh severity findings:")
    for alert in high_alerts:
        print(f"  - {alert.get('name', 'Unknown')}")
    
    sys.exit(1)  # Exit with error = Block CI

elif total_medium > 5:
    print("⚠️  WARNING: More than 5 medium severity issues")
    print("   Pipeline will continue...\n")
    sys.exit(0)  # Exit success = Allow CI

else:
    print("✅ PASSED: No blocking security issues!\n")
    sys.exit(0)
