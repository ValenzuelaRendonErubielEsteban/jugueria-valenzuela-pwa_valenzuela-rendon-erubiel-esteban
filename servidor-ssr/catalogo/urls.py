from django.urls import path
from . import views

urlpatterns = [
    # http://127.0.0.1:8000/catalogo/  ->  ejecuta la función vista_ssr()
    path('catalogo/', views.vista_ssr, name='catalogo_ssr'),
]