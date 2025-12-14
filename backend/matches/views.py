# matches/views.py
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import MainLeague
from .serializers import MainLeagueSerializer
from django.db.models import Q, F, Value, IntegerField, DecimalField
from django.db.models.functions import Cast, Substr, StrIndex, Replace
from django.db.models import Case, When, BooleanField
from django.db.models import Case, When, Value, CharField
import time # <-- Добавляем импорт time
from rest_framework.pagination import LimitOffsetPagination  # <-- ДОБАВЬТЕ ЭТУ СТРОКУ
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json

print("Поля модели MainLeague:", [f.name for f in MainLeague._meta.get_fields()])

class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MainLeague.objects.all().order_by('-date')
    serializer_class = MainLeagueSerializer
    pagination_class = LimitOffsetPagination  # <-- ДОБАВЬТЕ ЭТУ СТРОКУ

    def get_queryset(self):
        start_time = time.time() # <-- Начало измерения времени для get_queryset
        queryset = super().get_queryset()

        # 1. Фильтр по league_id (основной)
        league_id = self.request.query_params.get('league_id')
        if league_id:
            try:
                queryset = queryset.filter(league_id=int(league_id))  # Явное преобразование в число
            except (ValueError, TypeError):
                # Если league_id строка (например, "premier-league")
                queryset = queryset.filter(league_id=league_id)
        
        # 2. Остальные фильтры (оставить без изменений)
        selected_leagues = self.request.query_params.get('leagues')
        if selected_leagues:
            leagues_list = [l.strip() for l in selected_leagues.split(',')]
            q_objects = Q()
            for league_name in leagues_list:
                q_objects |= Q(league__startswith=league_name)
            queryset = queryset.filter(q_objects)

        selected_team = self.request.query_params.get('team')
        location_filter = self.request.query_params.get('location')  # например, 'home', 'away' или 'home,away'

        if selected_team:
            if location_filter:
                locations = location_filter.lower().split(',')
                filters = Q()
                if 'home' in locations:
                    filters |= Q(home__iexact=selected_team)
                if 'away' in locations:
                    filters |= Q(away__iexact=selected_team)
                queryset = queryset.filter(filters)
            else:
                # Если параметр location не передан — показываем все матчи с командой (и дома, и в гостях)
                queryset = queryset.filter(Q(home__iexact=selected_team) | Q(away__iexact=selected_team))


        # --- Фильтры для коэффициентов (o - odds) ---
        selected_one_os = self.request.query_params.get('one_os')
        if selected_one_os:
            one_os_list = [float(o.strip()) for o in selected_one_os.split(',') if o.strip().replace('.', '', 1).isdigit()]
            if one_os_list:
                queryset = queryset.filter(one_o__in=one_os_list)

        selected_x_os = self.request.query_params.get('x_os')
        if selected_x_os:
            x_os_list = [float(o.strip()) for o in selected_x_os.split(',') if o.strip().replace('.', '', 1).isdigit()]
            if x_os_list:
                queryset = queryset.filter(x_o__in=x_os_list)

        selected_two_os = self.request.query_params.get('two_os')
        if selected_two_os:
            two_os_list = [float(o.strip()) for o in selected_two_os.split(',') if o.strip().replace('.', '', 1).isdigit()]
            if two_os_list:
                queryset = queryset.filter(two_o__in=two_os_list)

        selected_bts_os = self.request.query_params.get('bts_os')
        if selected_bts_os:
            bts_os_list = [float(o.strip()) for o in selected_bts_os.split(',') if o.strip().replace('.', '', 1).isdigit()]
            if bts_os_list:
                queryset = queryset.filter(bts_o__in=bts_os_list)

        selected_bts_no_os = self.request.query_params.get('bts_no_os')
        if selected_bts_no_os:
            bts_no_os_list = [float(o.strip()) for o in selected_bts_no_os.split(',') if o.strip().replace('.', '', 1).isdigit()]
            if bts_no_os_list:
                queryset = queryset.filter(bts_no_o__in=bts_no_os_list)

        selected_over_os = self.request.query_params.get('over_os')
        if selected_over_os:
            over_os_list = [float(o.strip()) for o in selected_over_os.split(',') if o.strip().replace('.', '', 1).isdigit()]
            if over_os_list:
                queryset = queryset.filter(over_o__in=over_os_list)

        selected_under_os = self.request.query_params.get('under_os')
        if selected_under_os:
            under_os_list = [float(o.strip()) for o in selected_under_os.split(',') if o.strip().replace('.', '', 1).isdigit()]
            if under_os_list:
                queryset = queryset.filter(under_o__in=under_os_list)

        # --- Фильтры для ожидаемых значений (e - expected) ---
        selected_one_es = self.request.query_params.get('one_es')
        if selected_one_es:
            one_es_list = [float(e.strip()) for e in selected_one_es.split(',') if e.strip().replace('.', '', 1).isdigit()]
            if one_es_list:
                queryset = queryset.filter(one_e__in=one_es_list)

        selected_x_es = self.request.query_params.get('x_es')
        if selected_x_es:
            x_es_list = [float(e.strip()) for e in selected_x_es.split(',') if e.strip().replace('.', '', 1).isdigit()]
            if x_es_list:
                queryset = queryset.filter(x_e__in=x_es_list)

        selected_two_es = self.request.query_params.get('two_es')
        if selected_two_es:
            two_es_list = [float(e.strip()) for e in selected_two_es.split(',') if e.strip().replace('.', '', 1).isdigit()]
            if two_es_list:
                queryset = queryset.filter(two_e__in=two_es_list)

        selected_bts_es = self.request.query_params.get('bts_es')
        if selected_bts_es:
            bts_es_list = [float(e.strip()) for e in selected_bts_es.split(',') if e.strip().replace('.', '', 1).isdigit()]
            if bts_es_list:
                queryset = queryset.filter(bts_e__in=bts_es_list)

        selected_bts_no_es = self.request.query_params.get('bts_no_es')
        if selected_bts_no_es:
            bts_no_es_list = [float(e.strip()) for e in selected_bts_no_es.split(',') if e.strip().replace('.', '', 1).isdigit()]
            if bts_no_es_list:
                queryset = queryset.filter(bts_no_e__in=bts_no_es_list)

        selected_over_es = self.request.query_params.get('over_es')
        if selected_over_es:
            over_es_list = [float(e.strip()) for e in selected_over_es.split(',') if e.strip().replace('.', '', 1).isdigit()]
            if over_es_list:
                queryset = queryset.filter(over_e__in=over_es_list)

        selected_under_es = self.request.query_params.get('under_es')
        if selected_under_es:
            under_es_list = [float(e.strip()) for e in selected_under_es.split(',') if e.strip().replace('.', '', 1).isdigit()]
            if under_es_list:
                queryset = queryset.filter(under_e__in=under_es_list)

        # --- Фильтры для счетов ---
        selected_first_halfs = self.request.query_params.get('first_halfs')
        if selected_first_halfs:
            first_halfs_list = [s.strip() for s in selected_first_halfs.split(',')]
            queryset = queryset.filter(first_half__in=first_halfs_list)

        selected_matches = self.request.query_params.get('matches')
        if selected_matches:
            matches_list = [s.strip() for s in selected_matches.split(',')]
            queryset = queryset.filter(match__in=matches_list)


        queryset = queryset.filter(match__regex=r'^\d+\s*-\s*\d+$')

        dash_index = StrIndex('match', Value(' - '))

        queryset = queryset.annotate(
            home_score_str=Substr('match', 1, dash_index - 1),
            away_score_str=Substr('match', dash_index + 3),
        ).annotate(
            home_score_int=Cast('home_score_str', IntegerField()),
            away_score_int=Cast('away_score_str', IntegerField()),
        ).annotate(  # <-- новое поле outcome
            outcome=Case(
                When(home_score_int__gt=F('away_score_int'), then=Value('home')),
                When(home_score_int=F('away_score_int'), then=Value('draw')),
                default=Value('away'),
                output_field=CharField(max_length=5),
            )
        )

        bts_result_filter = self.request.query_params.get('bts_result')
        if bts_result_filter:
            bts_result_filter_lower = bts_result_filter.lower()
            if bts_result_filter_lower == 'yes':
                queryset = queryset.filter(home_score_int__gt=0, away_score_int__gt=0)
            elif bts_result_filter_lower == 'no':
                queryset = queryset.filter(Q(home_score_int=0) | Q(away_score_int=0))

        total_goals_filter = self.request.query_params.get('total_goals')
        if total_goals_filter:
            queryset = queryset.annotate(
                total_goals_calculated=F('home_score_int') + F('away_score_int')
            )
            try:
                value_str = total_goals_filter.replace('Over ', '').replace('Under ', '')
                value = float(value_str)
                if 'Over' in total_goals_filter:
                    queryset = queryset.filter(total_goals_calculated__gt=value)
                elif 'Under' in total_goals_filter:
                    queryset = queryset.filter(total_goals_calculated__lt=value)
            except (ValueError, TypeError):
                pass
        end_time = time.time() # <-- Конец измерения времени для get_queryset
        print(f"get_queryset execution time: {end_time - start_time:.4f} seconds") # <-- Вывод в консоль
                
        return queryset


    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Возвращает агрегированную статистику и ROI для отфильтрованных матчей.
        """
        filtered_matches = self.get_queryset()

        total_matches = filtered_matches.count()

        stats = {
            'total_matches': total_matches,
            'home_wins_count': 0,
            'draws_count': 0,
            'away_wins_count': 0,
            'bts_yes_count': 0,
            'bts_no_count': 0,
            'over_count': 0,
            'under_count': 0,
            'roi_home': 0.0,
            'roi_draw': 0.0,
            'roi_away': 0.0,
            'roi_bts_yes': 0.0,
            'roi_bts_no': 0.0,
            'roi_over': 0.0,
            'roi_under': 0.0,
        }

        total_stake_home = 0
        total_profit_home = 0
        total_stake_draw = 0
        total_profit_draw = 0
        total_stake_away = 0
        total_profit_away = 0
        total_stake_bts_yes = 0
        total_profit_bts_yes = 0
        total_stake_bts_no = 0
        total_profit_bts_no = 0
        total_stake_over = 0
        total_profit_over = 0
        total_stake_under = 0
        total_profit_under = 0

        for match in filtered_matches:
            home_score = None
            away_score = None
            total_goals = None

            if match.match and ' - ' in match.match:
                try:
                    scores = match.match.split(' - ')
                    home_score = int(scores[0].strip())
                    away_score = int(scores[1].strip())
                    total_goals = home_score + away_score
                except ValueError:
                    home_score = None
                    away_score = None
                    total_goals = None

            if home_score is not None and away_score is not None:
                # Победа Дома (P1)
                if match.one_e and match.one_e > 0:
                    total_stake_home += 1
                    if home_score > away_score:
                        stats['home_wins_count'] += 1
                        total_profit_home += (match.one_e - 1)
                    else:
                        total_profit_home -= 1

                # Ничья (X)
                if match.x_e and match.x_e > 0:
                    total_stake_draw += 1
                    if home_score == away_score:
                        stats['draws_count'] += 1
                        total_profit_draw += (match.x_e - 1)
                    else:
                        total_profit_draw -= 1

                # Победа В гостях (P2)
                if match.two_e and match.two_e > 0:
                    total_stake_away += 1
                    if home_score < away_score:
                        stats['away_wins_count'] += 1
                        total_profit_away += (match.two_e - 1)
                    else:
                        total_profit_away -= 1

                # Обе забьют (Да/Нет)
                bts_result = (home_score > 0 and away_score > 0)

                if match.bts_e and match.bts_e > 0:
                    total_stake_bts_yes += 1
                    if bts_result:
                        stats['bts_yes_count'] += 1
                        total_profit_bts_yes += (match.bts_e - 1)
                    else:
                        total_profit_bts_yes -= 1
                    
                if match.bts_no_e and match.bts_no_e > 0:
                    total_stake_bts_no += 1
                    if not bts_result:
                        stats['bts_no_count'] += 1
                        total_profit_bts_no += (match.bts_no_e - 1)
                    else:
                        total_profit_bts_no -= 1

                # Тотал (Больше/Меньше)
                if total_goals is not None:
                    if match.over_e and match.over_e > 0:
                        total_stake_over += 1
                        if total_goals > 2.5:
                            stats['over_count'] += 1
                            total_profit_over += (match.over_e - 1)
                        else:
                            total_profit_over -= 1
                    
                    if match.under_e and match.under_e > 0:
                        total_stake_under += 1
                        if total_goals < 2.5:
                            stats['under_count'] += 1
                            total_profit_under += (match.under_e - 1)
                        else:
                            total_profit_under -= 1
            
        # Расчет ROI (только если total_stake > 0, чтобы избежать деления на ноль)
        if total_stake_home > 0:
            stats['roi_home'] = total_profit_home 
        if total_stake_draw > 0:
            stats['roi_draw'] = total_profit_draw 
        if total_stake_away > 0:
            stats['roi_away'] = total_profit_away 
        if total_stake_bts_yes > 0:
            stats['roi_bts_yes'] = total_profit_bts_yes 
        if total_stake_bts_no > 0:
            stats['roi_bts_no'] = total_profit_bts_no 
        if total_stake_over > 0:
            stats['roi_over'] = total_profit_over 
        if total_stake_under > 0:
            stats['roi_under'] = total_profit_under 

        return Response(stats)

@csrf_exempt
def ios_test(request):
    """Простой тест для iOS - работает без аутентификации"""
    if request.method == 'GET':
        data = {
            "status": "success",
            "message": "iOS test endpoint is working",
            "timestamp": timezone.now().isoformat(),
            "cors_supported": True
        }
        response = JsonResponse(data)
        # Явно добавляем CORS заголовки
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response
    
    elif request.method == 'OPTIONS':
        # Для preflight запросов
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        response["Access-Control-Max-Age"] = "86400"
        return response
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

