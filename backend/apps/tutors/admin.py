from django.contrib import admin
from .models import Tutor

@admin.register(Tutor)
class TutorAdmin(admin.ModelAdmin):
    list_display = ('user', 'experience_years', 'hourly_rate', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    filter_horizontal = ('subjects',)
