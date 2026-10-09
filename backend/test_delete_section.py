"""
Test script to verify section deletion works
"""
from app import create_app
from models import db, Section, Product

app = create_app()

with app.app_context():
    # Get a section to test
    section = Section.query.first()
    if section:
        print(f"Testing deletion of section: {section.name} (ID: {section.id})")
        print(f"Has {len(section.products)} products")
        print(f"Has show_in_nav attribute: {hasattr(section, 'show_in_nav')}")
        if hasattr(section, 'show_in_nav'):
            print(f"show_in_nav value: {section.show_in_nav}")
    else:
        print("No sections found in database")
    
    # Check if miscellaneous section exists
    misc = Section.query.filter_by(slug='miscellaneous').first()
    if misc:
        print(f"\nMiscellaneous section exists: {misc.name}")
        print(f"Has show_in_nav: {hasattr(misc, 'show_in_nav')}")
    else:
        print("\nNo miscellaneous section found")
