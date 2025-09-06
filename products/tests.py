from django.test import TestCase
from .models import Category


class CategoryModelTests(TestCase):
    def test_str(self):
        c = Category.objects.create(name='Electronics')
        self.assertEqual(str(c), 'Electronics')

# Create your tests here.
