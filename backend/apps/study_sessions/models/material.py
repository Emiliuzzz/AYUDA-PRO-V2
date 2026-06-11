from django.db import models

class SessionMaterial(models.Model):
    session = models.ForeignKey(
        'study_sessions.Session',
        on_delete=models.CASCADE,
        related_name='materials'
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='session_materials/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Material de Sesión'
        verbose_name_plural = 'Materiales de Sesión'

    def __str__(self):
        return f"{self.title} - {self.session}"
