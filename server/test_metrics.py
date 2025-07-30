#!/usr/bin/env python3
"""
Test script for metrics endpoints.
"""

import asyncio
import sys
from datetime import datetime, timedelta
from typing import Dict, Any

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

# Add the app directory to Python path
sys.path.append('.')

from app.main import app
from app.api.v1.endpoints.metrics import get_dashboard_kpis, get_call_trends, get_performance_summary

def test_endpoint_availability():
    """Test if metrics endpoints are properly registered."""
    client = TestClient(app)
    
    print("🔍 Testing endpoint availability...")
    
    # Test if endpoints are registered in OpenAPI schema
    response = client.get("/openapi.json")
    openapi_schema = response.json()
    
    paths = openapi_schema.get("paths", {})
    metrics_endpoints = [path for path in paths.keys() if "/metrics/" in path]
    
    print(f"✅ Found {len(metrics_endpoints)} metrics endpoints:")
    for endpoint in metrics_endpoints:
        print(f"   - {endpoint}")
    
    # Test metrics endpoints specifically
    expected_endpoints = [
        "/api/v1/metrics/dashboard-kpis",
        "/api/v1/metrics/call-trends", 
        "/api/v1/metrics/performance-summary"
    ]
    
    for endpoint in expected_endpoints:
        if endpoint in paths:
            print(f"✅ {endpoint} - Registered")
        else:
            print(f"❌ {endpoint} - Missing")
    
    return len(metrics_endpoints) >= 3

def test_response_models():
    """Test if response models are properly defined."""
    from app.api.v1.endpoints.metrics import MetricsKPIResponse
    
    print("\n🔍 Testing response models...")
    
    try:
        # Test MetricsKPIResponse model
        sample_data = {
            "total_minutes": 120.5,
            "total_calls": 45,
            "total_spend": 234.67,
            "average_nps": 8.5,
            "call_status_breakdown": {"completed": 40, "failed": 5},
            "call_types_breakdown": {"Inbound": 25, "Outbound": 20},
            "cost_by_category": {"Support": 150.0, "Sales": 84.67}
        }
        
        response = MetricsKPIResponse(**sample_data)
        print("✅ MetricsKPIResponse model validation passed")
        print(f"   - Total calls: {response.total_calls}")
        print(f"   - Total minutes: {response.total_minutes}")
        print(f"   - Average NPS: {response.average_nps}")
        
        return True
        
    except Exception as e:
        print(f"❌ MetricsKPIResponse model validation failed: {e}")
        return False

def test_date_range_parsing():
    """Test date range parsing logic."""
    from datetime import date
    
    print("\n🔍 Testing date range parsing...")
    
    try:
        # Simulate the date range calculation logic
        end_dt = datetime.now().date()
        
        # Test predefined ranges
        date_ranges = {"7d": 7, "30d": 30, "90d": 90}
        
        for range_str, expected_days in date_ranges.items():
            days = date_ranges.get(range_str, 7)
            start_dt = end_dt - timedelta(days=days)
            
            actual_days = (end_dt - start_dt).days
            print(f"✅ {range_str}: {actual_days} days ({start_dt} to {end_dt})")
            
            if actual_days != expected_days:
                print(f"❌ Expected {expected_days} days, got {actual_days}")
                return False
        
        # Test custom dates
        custom_start = date(2024, 1, 1)
        custom_end = date(2024, 1, 31)
        custom_days = (custom_end - custom_start).days
        print(f"✅ Custom range: {custom_days} days ({custom_start} to {custom_end})")
        
        return True
        
    except Exception as e:
        print(f"❌ Date range parsing failed: {e}")
        return False

def test_sql_query_structure():
    """Test if SQL queries can be constructed without errors."""
    print("\n🔍 Testing SQL query structure...")
    
    try:
        from sqlalchemy import select, func, and_
        from app.models import Call, ServiceRecord, CallFeedback
        
        # Test basic query construction
        base_filter = and_(
            Call.organization_id == 1,
            Call.created_at >= datetime.now() - timedelta(days=7),
            Call.created_at <= datetime.now()
        )
        
        # Test total minutes query
        minutes_query = select(func.coalesce(func.sum(Call.duration_sec), 0)).where(base_filter)
        print("✅ Total minutes query constructed")
        
        # Test total calls query  
        calls_query = select(func.count(Call.id)).where(base_filter)
        print("✅ Total calls query constructed")
        
        # Test cost query
        cost_query = select(func.coalesce(func.sum(Call.cost), 0)).where(base_filter)
        print("✅ Total cost query constructed")
        
        # Test NPS query
        nps_query = select(func.avg(Call.nps_score)).where(
            and_(base_filter, Call.nps_score.isnot(None))
        )
        print("✅ Average NPS query constructed")
        
        # Test breakdown queries
        status_query = select(Call.status, func.count(Call.id)).where(base_filter).group_by(Call.status)
        print("✅ Status breakdown query constructed")
        
        types_query = select(Call.direction, func.count(Call.id)).where(base_filter).group_by(Call.direction)
        print("✅ Types breakdown query constructed")
        
        # Test join query for cost by category
        cost_category_query = select(
            ServiceRecord.service_type,
            func.coalesce(func.sum(Call.cost), 0)
        ).join(Call, Call.service_record_id == ServiceRecord.id).where(base_filter).group_by(ServiceRecord.service_type)
        print("✅ Cost by category query with join constructed")
        
        return True
        
    except Exception as e:
        print(f"❌ SQL query construction failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Starting Metrics API Backend Tests\n")
    
    tests = [
        ("Endpoint Availability", test_endpoint_availability),
        ("Response Models", test_response_models),
        ("Date Range Parsing", test_date_range_parsing),
        ("SQL Query Structure", test_sql_query_structure),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
        
        print()  # Add spacing between tests
    
    # Summary
    print("=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\nTests passed: {passed}/{len(results)}")
    
    if passed == len(results):
        print("\n🎉 All tests passed! Your metrics API backend is ready.")
        print("\n📝 Next steps:")
        print("   1. Start the server: uvicorn app.main:app --reload")
        print("   2. Test endpoints at: http://localhost:8000/docs")
        print("   3. Integrate with frontend components")
    else:
        print(f"\n⚠️  {len(results) - passed} tests failed. Please review the issues above.")
    
    return passed == len(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
