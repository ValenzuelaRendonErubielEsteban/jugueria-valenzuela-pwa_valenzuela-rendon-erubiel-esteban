from django.shortcuts import render

# "Base de datos" simple: una lista de diccionarios en memoria con los 15
# productos de Juguería Valenzuela (los mismos de catalogo.json).
# Lo importante para entender SSR: estos datos se insertan en el HTML
# ANTES de enviarlo al navegador.
PRODUCTOS = [
    {"nombre": "Jugo de naranja", "precio": 35, "stock": 50},
    {"nombre": "Jugo verde", "precio": 45, "stock": 40},
    {"nombre": "Jugo de zanahoria", "precio": 35, "stock": 40},
    {"nombre": "Jugo de betabel", "precio": 40, "stock": 30},
    {"nombre": "Licuado de fresa", "precio": 50, "stock": 35},
    {"nombre": "Licuado de plátano", "precio": 50, "stock": 35},
    {"nombre": "Licuado de mango", "precio": 55, "stock": 30},
    {"nombre": "Smoothie de frutos rojos", "precio": 65, "stock": 25},
    {"nombre": "Smoothie tropical", "precio": 65, "stock": 25},
    {"nombre": "Agua fresca de jamaica", "precio": 25, "stock": 60},
    {"nombre": "Agua fresca de limón", "precio": 25, "stock": 60},
    {"nombre": "Vaso de fruta con chile", "precio": 45, "stock": 30},
    {"nombre": "Ensalada de frutas", "precio": 55, "stock": 20},
    {"nombre": "Shot de jengibre", "precio": 20, "stock": 50},
    {"nombre": "Granola con yogurt", "precio": 50, "stock": 20},
]


def vista_ssr(request):
    """Vista con Renderizado en Servidor (SSR).

    render() toma la plantilla, le inyecta el contexto (los productos) y
    devuelve el HTML final YA CON LOS DATOS ESCRITOS. Por eso, al hacer
    Ctrl+U se ven los nombres y precios en el código fuente.
    """
    contexto = {"productos": PRODUCTOS}
    return render(request, 'catalogo/catalogo_ssr.html', contexto)