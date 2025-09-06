from django.db import migrations

def generate_qr_codes(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    
    for product in Product.objects.all():
        if not product.qr_code:
            product.qr_code = f"https://smart-inventory.com/product/{product.sku}"
            product.save(update_fields=['qr_code'])

def reverse_generate_qr_codes(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    
    for product in Product.objects.all():
        if product.qr_code and product.qr_code.startswith('https://smart-inventory.com/product/'):
            product.qr_code = ''
            product.save(update_fields=['qr_code'])

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(generate_qr_codes, reverse_generate_qr_codes),
    ]
