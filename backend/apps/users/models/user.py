from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Roles(models.TextChoices):
        STUDENT = 'STUDENT', 'Estudiante'
        TUTOR = 'TUTOR', 'Tutor'
        ADMIN = 'ADMIN', 'Administrador'

    email = models.EmailField(unique=True, blank=False, null=False)
    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.STUDENT
    )
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # Podremos añadir más campos después
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
