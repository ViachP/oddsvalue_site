# backend/users/middleware.py
class TrialAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Пропускаем для auth endpoints (они уже обработаны выше)
        if (request.path.startswith('/admin/') or 
            request.path.startswith('/static/') or
            request.path.startswith('/media/') or
            '/api/auth/' in request.path or
            '/api/verification/' in request.path or
            '/api/send-verification-code' in request.path or
            '/api/verify-code' in request.path or
            '/api/send-login-code' in request.path or
            '/api/verify-login-code' in request.path or
            request.path == '/api/payment/'):
            return response
        
        # Проверяем только аутентифицированных пользователей для остальных запросов
        if request.user.is_authenticated and not request.user.is_superuser:
            if not request.user.has_active_trial:
                if request.path.startswith('/api/'):
                    return JsonResponse({
                        'trial_expired': True,
                        'message': 'Your trial period has expired. Please subscribe.',
                        'payment_required': True
                    }, status=403)
        
        return response