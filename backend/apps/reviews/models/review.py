from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    session = models.OneToOneField(
        'study_sessions.Session',
        on_delete=models.CASCADE,
        related_name='review'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Evaluación'
        verbose_name_plural = 'Evaluaciones'

    def __str__(self):
        return f"Review {self.rating}* para {self.session}"
