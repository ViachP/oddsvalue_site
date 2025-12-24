# subscriptions/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

PLAN_CHOICES = (
    (1, '1 month – 19.95 USDT'),
    (3, '3 months – 58 USDT'),
)

class Subscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    trial_end = models.DateTimeField()
    paid_until = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.user.email} trial:{self.trial_end.date()} paid:{self.paid_until}'

    @property
    def is_active(self):
        now = timezone.now()
        return (self.trial_end and self.trial_end > now) or (self.paid_until and self.paid_until > now)

class Payment(models.Model):
    PENDING = 'P'
    APPROVED = 'A'
    STATUS = (
        (PENDING, 'Pending verification'),
        (APPROVED, 'Confirmed'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    months = models.PositiveSmallIntegerField(choices=PLAN_CHOICES)
    usdt_amount = models.DecimalField(max_digits=8, decimal_places=2, editable=False)
    wallet = models.CharField(max_length=64, default='TVzN...')  # your USDT-TRC20
    tx_hash = models.CharField('Transaction TxID', max_length=128, blank=True)
    status = models.CharField(max_length=1, choices=STATUS, default=PENDING)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'

    def __str__(self):
        return f'{self.user}  {self.get_months_display()}  {self.get_status_display()}'

    def save(self, *args, **kwargs):
        self.usdt_amount = {1: 19.95, 3: 58}[self.months]
        super().save(*args, **kwargs)

    def approve(self):
        if self.status != self.APPROVED:
            self.status = self.APPROVED
            self.save(update_fields=['status'])
            sub, created = Subscription.objects.get_or_create(
                user=self.user,
                defaults={
                    'trial_end': timezone.now() + timedelta(days=3),
                    'paid_until': None
                }
            )
            start = max(sub.paid_until or timezone.now(), timezone.now())
            sub.paid_until = start + timedelta(days=30 * self.months)
            sub.save(update_fields=['paid_until'])