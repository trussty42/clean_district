from django_filters import rest_framework as filters
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from points.models import PickUpPoint, PointWasteTypes
from django.db.models import Q


class WasteTypesFilter(filters.FilterSet):

    point = filters.NumberFilter(
        field_name='point'
    )

    waste_type = filters.AllValuesMultipleFilter(
        field_name='waste_type'
    )

    price_min = filters.NumberFilter(
        field_name='price',
        lookup_expr='gte'
    )

    price_max = filters.NumberFilter(
        field_name='price',
        lookup_expr='lte'
    )

    class Meta:
        model = PointWasteTypes
        fields = (
            'point',
            'waste_type',
            'price_min',
            'price_max'
        )


class PickUpPointFilter(filters.FilterSet):

    waste_type = filters.CharFilter(
        method='filter_waste_type'
    )

    rating_from = filters.NumberFilter(
        field_name='avg_rating',
        lookup_expr='gte'
    )

    radius = filters.NumberFilter(
        method='filter_by_radius'
    )

    search = filters.CharFilter(
        method='filter_search'
    )

    class Meta:

        model = PickUpPoint

        fields = [
            'waste_type',
            'rating_from',
            'radius',
            'search'
        ]

    def filter_waste_type(
        self,
        queryset,
        name,
        value
    ):

        waste_types = value.split(',')

        return queryset.filter(
            waste_types__waste_type__in=waste_types
        ).distinct()

    def filter_search(
        self,
        queryset,
        name,
        value
    ):

        return queryset.filter(

            Q(adress__icontains=value)
            | Q(organization__name__icontains=value)

        ).distinct()

    def filter_by_radius(
        self,
        queryset,
        name,
        value
    ):

        lat = self.request.query_params.get(
            'lat'
        )

        lon = self.request.query_params.get(
            'lon'
        )

        if lat and lon and value:

            try:

                user_location = Point(
                    float(lon),
                    float(lat),
                    srid=4326
                )

                return queryset.filter(

                    location__distance_lte=(

                        user_location,
                        D(km=value)

                    )

                )

            except (
                ValueError,
                TypeError
            ):

                return queryset

        return queryset
