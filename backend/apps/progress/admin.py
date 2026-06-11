from django.contrib import admin
from .models import Progress

@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'level_of_understanding', 'updated_at')
    list_filter = ('level_of_understanding', 'subject')
    search_fields = ('student__user__username', 'subject__name')
