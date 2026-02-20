from django.shortcuts import render

def article_detail(request, slug):
    """
    Рендерит статические шаблоны статей.
    Все шаблоны содержат полный HTML, данные из БД не нужны.
    """
    
    # Определяем язык по URL пути
    current_path = request.path
    
    if current_path.startswith('/en/'):
        template = 'blog/article_detail_en.html'
        canonical_url = f"https://oddsvalue.pro/en/{slug}/"
    elif current_path.startswith('/de/'):
        template = 'blog/article_detail_de.html'
        canonical_url = f"https://oddsvalue.pro/de/{slug}/"
    else:
        # Русская версия по умолчанию
        template = 'blog/article_detail.html'
        canonical_url = f"https://oddsvalue.pro/blog/{slug}/"

    # Минимальный контекст - только canonical URL для hreflang
    context = {
        'canonical_url': canonical_url,
    }

    return render(request, template, context)

