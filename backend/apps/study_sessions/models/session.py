from django.db import models
from django.conf import settings

class Session(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Programada'
        COMPLETED = 'COMPLETED', 'Completada'
        CANCELED = 'CANCELED', 'Cancelada'
        IN_PROGRESS = 'IN_PROGRESS', 'En progreso'

    tutor = models.ForeignKey(
        'tutors.Tutor',
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    student = models.ForeignKey(
        'users.Student',
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    subject = models.ForeignKey(
        'subjects.Subject',
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED
    )
    
    meeting_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Sesión'
        verbose_name_plural = 'Sesiones'

    def __str__(self):
        return f"{self.subject.name} - {self.tutor.user.username} con {self.student.user.username}"
