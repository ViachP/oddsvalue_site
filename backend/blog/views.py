from django.shortcuts import render, get_object_or_404
from .models import Article

def article_detail(request, slug):
    article = get_object_or_404(Article, slug=slug, published=True)
    
    context = {
        'article': article,
        'title': article.meta_title or article.title,
        'meta_description': article.meta_description,
        'canonical_url': f"https://oddsvalue.pro/blog/{slug}/",
    }
    
    return render(request, 'blog/article_detail.html', context)
