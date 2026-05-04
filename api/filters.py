from django_filters import rest_framework as filters
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from points.models import PickUpPoint, PointWasteTypes


class WasteTypesFilter(filters.FilterSet):
    waste_type = filters.AllValuesMultipleFilter(field_name='waste_type')
    price_min = filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = filters.NumberFilter(field_name='price', lookup_expr='lte')

    class Meta:
        model = PointWasteTypes
        fields = ['waste_type', 'price_min', 'price_max']


class PickUpPointFilter(filters.FilterSet):
    waste_type = filters.AllValuesMultipleFilter(field_name='waste_types__waste_type')
    
    rating_from = filters.NumberFilter(field_name='avg_rating', lookup_expr='gte')
    
    radius = filters.NumberFilter(method='filter_by_radius')

    class Meta:
        model = PickUpPoint
        fields = ['waste_type', 'rating_from', 'radius']

    def filter_by_radius(self, queryset, name, value):
        lat = self.request.query_params.get('lat')
        lon = self.request.query_params.get('lon')
        
        if lat and lon and value:
            try:
                user_location = Point(float(lon), float(lat), srid=4326)
                return queryset.filter(location__distance_lte=(user_location, D(km=value)))
            except (ValueError, TypeError):
                return queryset
        return queryset
