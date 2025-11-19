import csv
from django.core.management.base import BaseCommand, CommandError
from matches.models import MainLeague
from datetime import datetime
from django.db import transaction

class Command(BaseCommand):
    help = 'Imports match data from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The path to the CSV file')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']
        
        try: # <--- Этот try блок для ошибок открытия файла или общих ошибок
            with transaction.atomic():
                with open(csv_file_path, 'r', encoding='utf-8') as file:
                    reader = csv.DictReader(file, delimiter=';')
                    for row_num, row in enumerate(reader, 1):
                        try:
                            MainLeague.objects.create(
                                date=datetime.strptime(row['Date'], '%d.%m.%Y %H:%M'),
                                home=row['Home'],
                                away=row['Away'],
                                one_o=float(row['1(o)']),
                                one_e=float(row['1(e)']),
                                x_o=float(row['X(o)']),
                                x_e=float(row['X(e)']),
                                two_o=float(row['2(o)']),
                                two_e=float(row['2(e)']),
                                bts_o=float(row['BTS(o)']),
                                bts_e=float(row['BTS(e)']),
                                bts_no_o=float(row['BTS_no(o)']),
                                bts_no_e=float(row['BTS_no(e)']),
                                over_o=float(row['Over(o)']),
                                over_e=float(row['Over(e)']),
                                under_o=float(row['Under(o)']),
                                under_e=float(row['Under(e)']),
                                first_half=row['1H'] if row['1H'] else None,
                                match=row['Match'] if row['Match'] else None,
                                goals=row['Goals'] if row['Goals'] else None,
                                league=row['League'] if row['League'] else None,
                                link=row['Link'] if row['Link'] else None,
                                notes=row['Notes'] if row['Notes'] else None,
                            )
                        except ValueError as e:
                            self.stdout.write(self.style.ERROR(f'Error converting data in row {row_num} ({row}): {e}'))
                            continue
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f'Error creating object for row {row_num} ({row}): {e}'))
                            continue
                self.stdout.write(self.style.SUCCESS('Successfully attempted to import match data. Check for errors above.'))
        except FileNotFoundError: # <--- Эти except блоки должны быть на том же уровне, что и внешний try
            raise CommandError(f'File "{csv_file_path}" does not exist')
        except Exception as e:
            raise CommandError(f'An unexpected error occurred during file processing: {e}')