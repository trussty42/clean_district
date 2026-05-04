from django.db import models

from points.models import PickUpPoint
from users.models import User


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    point = models.ForeignKey(PickUpPoint, on_delete=models.CASCADE)
    rating = models.IntegerField(
        choices=[(i, i) for i in range(1, 6)], verbose_name='Оценка'
    )
    text = models.TextField(verbose_name='Текст отзыва')
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name='Создано'
    )
    is_published = models.BooleanField(
        default=False, verbose_name='Опубликовано'
    )

    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        unique_together = ('user', 'point')
        default_related_name = 'review'


class ModerationLog(models.Model):
    content_type = models.CharField(max_length=50)
    object_id = models.CharField(max_length=50)
    moderator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={'is_staff': True}
    )
    action = models.CharField(
        max_length=20,
        choices=[
            ('approve', 'Одобрить'),
            ('reject', 'Отклонить'),
            ('block', 'Заблокировать')
        ]
    )
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Лог модерации'
        verbose_name_plural = 'Логи модерации'
