from django.db import models

class Progress(models.Model):
    student = models.ForeignKey(
        'users.Student',
        on_delete=models.CASCADE,
        related_name='progress_reports'
    )
    subject = models.ForeignKey(
        'subjects.Subject',
        on_delete=models.CASCADE,
        related_name='student_progress'
    )
    
    notes = models.TextField()
    level_of_understanding = models.PositiveIntegerField(
        default=1,
        help_text="Escala del 1 al 10"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Progreso'
        verbose_name_plural = 'Progresos'

    def __str__(self):
        return f"Progreso de {self.student.user.username} en {self.subject.name}"
