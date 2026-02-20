from django.urls import path
from . import views

urlpatterns = [
    # Русские статьи: /blog/название-статьи/
    path('blog/<slug:slug>/', views.article_detail, name='article_detail'),

    # Английские статьи: /en/название-статьи/
    path('en/<slug:slug>/', views.article_detail, name='article_detail_en'),

    # Немецкие статьи: /de/slug/
    path('de/<slug:slug>/', views.article_detail, name='article_detail_de'),
]
