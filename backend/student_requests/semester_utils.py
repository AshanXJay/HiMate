"""
Semester and Level Utility Functions for HiMate

Semester Calendar:
- 1st Semester: November to March
- 2nd Semester: May to September
- April and October are transition months

Level Mapping (for Academic Year 2025/2026):
- 100 Level: Batch 24-25 (1st-2nd year students)
- 200 Level: Batch 23 (3rd year - NO HOSTEL)
- 300 Level: Batch 22 (4th year)
- 400 Level: Batch 21 (5th year - NO HOSTEL in 2nd semester)

Eligibility Rules:
- 200 Level: NOT eligible for hostel (any semester)
- 400 Level 2nd Semester: NOT eligible for hostel
- All others (100 Level, 300 Level, 400 Level 1st Sem): ELIGIBLE
"""

from datetime import datetime, date

def get_current_semester_info():
    """
    Get current semester details based on current date.
    Returns dict with semester number, academic year, and date range.
    """
    today = date.today()
    month = today.month
    year = today.year
    
    if month >= 11:  # November-December
        # 1st Semester starting
        semester = 1
        academic_year = f"{year}/{year + 1}"
        semester_name = f"{year} 1st Semester"
        start_month = "November"
        end_month = "March"
    elif month <= 3:  # January-March
        # 1st Semester continuing
        semester = 1
        academic_year = f"{year - 1}/{year}"
        semester_name = f"{year - 1} 1st Semester"
        start_month = "November"
        end_month = "March"
    elif month >= 5 and month <= 9:  # May-September
        # 2nd Semester
        semester = 2
        academic_year = f"{year - 1}/{year}"
        semester_name = f"{year} 2nd Semester"
        start_month = "May"
        end_month = "September"
    else:  # April or October - transition months
        # Default to upcoming semester
        if month == 4:
            semester = 2
            academic_year = f"{year - 1}/{year}"
            semester_name = f"{year} 2nd Semester (Upcoming)"
            start_month = "May"
            end_month = "September"
        else:  # October
            semester = 1
            academic_year = f"{year}/{year + 1}"
            semester_name = f"{year} 1st Semester (Upcoming)"
            start_month = "November"
            end_month = "March"
    
    return {
        'semester': semester,
        'academic_year': academic_year,
        'semester_name': semester_name,
        'start_month': start_month,
        'end_month': end_month,
        'display': f"{academic_year} - Semester {semester}"
    }


def get_batch_from_enrollment(enrollment_number):
    """
    Extract batch year from enrollment number.
    
    Supported formats:
    - UWU/CST/22/002 → 22 (slash-separated, batch in 3rd position)
    - cst22001 → 22 (letters followed by digits)
    - bbst23012 → 23
    """
    if not enrollment_number:
        return None
    
    import re
    
    # Try slash-separated format first (e.g., UWU/CST/22/002)
    if '/' in enrollment_number:
        parts = enrollment_number.split('/')
        for part in parts:
            if part.isdigit() and len(part) == 2:
                return int(part)
    
    # Fallback: Find 2 digits after letters (e.g., cst22001)
    match = re.search(r'[a-zA-Z]+(\d{2})', enrollment_number)
    if match:
        return int(match.group(1))
    
    return None


def get_level_from_batch(batch_year):
    """
    Calculate the academic level based on batch year.
    
    Based on user specification:
    For Nov 2025 - March 2026 (academic year 2025/2026):
    - Batch 24 → 100 Level (started 2024/2025, now in 2nd academic year = 100 Level)
    - Batch 23 → 200 Level (started 2023/2024, now in 3rd academic year = 200 Level)
    - Batch 22 → 300 Level (started 2022/2023, now in 4th academic year = 300 Level)
    - Batch 21 → 400 Level (started 2021/2022, now in 5th academic year = 400 Level)
    
    The pattern seems to be: (current_academic_year - batch_full_year) maps to:
    1 year diff → 100 Level
    2 years diff → 200 Level  
    3 years diff → 300 Level
    4 years diff → 400 Level
    """
    if not batch_year:
        return None
    
    today = date.today()
    current_year = today.year
    
    # Get current academic year start
    # Academic year starts in November, so Nov 2025 starts 2025/2026
    if today.month >= 11:
        academic_start_year = current_year
    else:
        academic_start_year = current_year - 1
    
    # Convert 2-digit batch to 4-digit year
    batch_full_year = 2000 + batch_year
    
    # Calculate years since admission
    # Batch year indicates when they started their degree
    # Batch 24 started in Nov 2024 (2024/2025 academic year)
    # In 2025/2026, batch 24 is in their 2nd academic year
    # years_in_system for batch 24 in 2025/2026: 2025 - 2024 + 1 = 2
    years_in_system = academic_start_year - batch_full_year + 1
    
    # Mapping based on user specification:
    # 2025/2026: batch 24 (2 yrs) = 100L, batch 23 (3 yrs) = 200L, 
    #            batch 22 (4 yrs) = 300L, batch 21 (5 yrs) = 400L
    if years_in_system == 1:
        return 100  # Just admitted this year
    elif years_in_system == 2:
        return 100  # 2nd year in system = 100 Level (batch 24 in 2025/2026)
    elif years_in_system == 3:
        return 200  # 3rd year in system = 200 Level (batch 23, no hostel)
    elif years_in_system == 4:
        return 300  # 4th year in system = 300 Level
    elif years_in_system == 5:
        return 400  # 5th year in system = 400 Level
    elif years_in_system > 5:
        return 400  # Cap at 400 level
    else:
        return None  # Future batch or invalid


def check_hostel_eligibility(enrollment_number):
    """
    Check if a student is eligible for hostel accommodation.
    
    Returns:
        dict: {
            'eligible': bool,
            'level': int,
            'semester': int,
            'academic_year': str,
            'reason': str (if not eligible)
        }
    """
    batch = get_batch_from_enrollment(enrollment_number)
    if not batch:
        return {
            'eligible': False,
            'level': None,
            'semester': None,
            'academic_year': None,
            'reason': 'Could not determine batch from enrollment number'
        }
    
    level = get_level_from_batch(batch)
    semester_info = get_current_semester_info()
    semester = semester_info['semester']
    academic_year = semester_info['academic_year']
    
    # Check eligibility rules
    if level == 200:
        return {
            'eligible': False,
            'level': level,
            'semester': semester,
            'academic_year': academic_year,
            'batch': batch,
            'reason': '200 Level students are not eligible for hostel accommodation. Hostels are available for 100, 300, and 400 (1st semester only) levels.'
        }
    
    if level == 400 and semester == 2:
        return {
            'eligible': False,
            'level': level,
            'semester': semester,
            'academic_year': academic_year,
            'batch': batch,
            'reason': '400 Level students are only eligible for hostel in 1st semester. You are in 2nd semester.'
        }
    
    return {
        'eligible': True,
        'level': level,
        'semester': semester,
        'academic_year': academic_year,
        'batch': batch,
        'semester_display': semester_info['semester_name'],
        'reason': None
    }


def get_semester_display(enrollment_number):
    """
    Get a human-readable semester display for a student.
    Format: "300 Level - 1st Semester (2025/2026)"
    """
    eligibility = check_hostel_eligibility(enrollment_number)
    if eligibility['level']:
        return f"{eligibility['level']} Level - Semester {eligibility['semester']} ({eligibility['academic_year']})"
    return "Unknown"
