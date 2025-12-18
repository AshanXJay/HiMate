from django.core.management.base import BaseCommand
from housing.models import Hostel, Room

class Command(BaseCommand):
    help = 'Seeds the database with Hostels and Rooms'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # Boys Hostel
        boys_hostel, created = Hostel.objects.get_or_create(
            name="Block A (Boys)",
            gender_type='MALE',
            defaults={'caretaker_name': 'Mr. John'}
        )
        if created:
            self.stdout.write('Created Block A (Boys)')
        
        for i in range(101, 151):
            Room.objects.get_or_create(
                hostel=boys_hostel,
                room_number=str(i),
                defaults={'capacity': 4}
            )

        # Girls Hostel
        girls_hostel, created = Hostel.objects.get_or_create(
            name="Block B (Girls)",
            gender_type='FEMALE',
            defaults={'caretaker_name': 'Ms. Jane'}
        )
        if created:
            self.stdout.write('Created Block B (Girls)')

        for i in range(101, 151):
            Room.objects.get_or_create(
                hostel=girls_hostel,
                room_number=str(i),
                defaults={'capacity': 4}
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded hostels and rooms'))
