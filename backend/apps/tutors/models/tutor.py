from django.db import models
from django.conf import settings

class Tutor(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='tutor_profile'
    )
    bio = models.TextField()
    experience_years = models.PositiveIntegerField(default=0)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    subjects = models.ManyToManyField('subjects.Subject', related_name='tutors')
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Tutor'
        verbose_name_plural = 'Tutores'

    def __str__(self):
        return f"Tutor: {self.user.get_full_name() or self.user.username}"
