"""
Test script to verify timezone conversion
Run this to check if timezone conversion is working correctly
"""
from datetime import datetime
import pytz

# Get current time
now_utc = datetime.utcnow()
now_local = datetime.now()

print("=" * 60)
print("TIMEZONE CONVERSION TEST")
print("=" * 60)

print(f"\n1. System Times:")
print(f"   datetime.utcnow():  {now_utc}")
print(f"   datetime.now():     {now_local}")
print(f"   Difference:         {(now_local - now_utc).total_seconds() / 3600:.1f} hours")

# Test IST conversion
ist_tz = pytz.timezone('Asia/Kolkata')

# Method 1: Localize naive UTC datetime
utc_aware = pytz.utc.localize(now_utc)
ist_time = utc_aware.astimezone(ist_tz)

print(f"\n2. Timezone Conversion:")
print(f"   UTC (naive):        {now_utc}")
print(f"   UTC (aware):        {utc_aware}")
print(f"   IST (converted):    {ist_time}")
print(f"   IST formatted:      {ist_time.strftime('%B %d, %Y %I:%M %p IST')}")

# Test with a known UTC time
test_utc = datetime(2024, 1, 15, 10, 30, 0)  # Jan 15, 2024 10:30 AM UTC
test_utc_aware = pytz.utc.localize(test_utc)
test_ist = test_utc_aware.astimezone(ist_tz)

print(f"\n3. Test Case (Known Time):")
print(f"   UTC:  {test_utc.strftime('%B %d, %Y %I:%M %p')}")
print(f"   IST:  {test_ist.strftime('%B %d, %Y %I:%M %p IST')}")
print(f"   Expected: January 15, 2024 04:00 PM IST")

# Check if system is already in IST
if abs((now_local - now_utc).total_seconds() - 19800) < 60:  # 19800 seconds = 5.5 hours
    print(f"\n⚠️  WARNING: System appears to be in IST timezone!")
    print(f"   This means datetime.utcnow() is NOT returning UTC time.")
    print(f"   Database timestamps might be stored in IST, not UTC.")
else:
    print(f"\n✅ System appears to be in UTC or other timezone.")
    print(f"   datetime.utcnow() should be returning UTC time.")

print("\n" + "=" * 60)
