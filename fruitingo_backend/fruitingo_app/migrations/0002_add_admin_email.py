# Generated migration to add admin_email field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fruitingo_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='adminsecurity',
            name='admin_email',
            field=models.EmailField(default='fruitingonaturals@gmail.com', max_length=254),
        ),
    ]
