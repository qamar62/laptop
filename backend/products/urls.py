from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'brands', views.BrandViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'reviews', views.ReviewViewSet, basename='review')
router.register(r'wishlist', views.WishlistViewSet, basename='wishlist')
router.register(r'recently-viewed', views.RecentlyViewedViewSet, basename='recently-viewed')

urlpatterns = [
    path('', include(router.urls)),
]
