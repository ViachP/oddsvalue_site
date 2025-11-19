from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from subscriptions.models import Subscription

User = get_user_model()

@receiver(post_save, sender=User)
def create_sub(sender, instance, created, **kwargs):
    if created:
        Subscription.objects.create(
            user=instance,
            trial_end=timezone.now() + timedelta(days=7)
        )

