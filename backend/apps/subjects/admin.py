from django.contrib import admin
from .models import Subject

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at')
    search_fields = ('name', 'category')
    list_filter = ('category',)
