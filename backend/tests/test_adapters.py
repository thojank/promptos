import unittest

from adapters import FluxAdapter, BananaAdapter, get_adapter
from models import BasePrompt, Subject, Environment, Style, TechSpecs


class AdapterTests(unittest.TestCase):
    def setUp(self):
        self.base_prompt = BasePrompt(
            subject=Subject(
                description="Valentina Ruiz, 22, Colombian-Lebanese student from Medellín",
                attributes=["navy linen blazer", "oval face shape"],
            ),
            environment=Environment(
                location="historic piazza in Bari old town",
                atmosphere="warm, dry air, relaxed afternoon",
                weather="clear sky",
            ),
            style=Style(
                lighting="soft daylight",
                camera="35mm lens, three-quarter view",
                film_stock="Kodak Portra 400",
                aesthetics=["photorealistic", "natural color rendering"],
            ),
            technical=TechSpecs(
                aspect_ratio="16:9",
                seed=42,
                cfg_scale=7.0,
            ),
        )

    def test_flux_adapter(self):
        adapter = FluxAdapter()
        output = adapter.adapt(self.base_prompt)
        self.assertEqual(output["model"], "flux")
        self.assertIn("Valentina Ruiz", output["prompt"])
        self.assertIn("historic piazza", output["prompt"])
        self.assertEqual(output["settings"]["aspect_ratio"], "16:9")

    def test_banana_adapter(self):
        adapter = BananaAdapter()
        output = adapter.adapt(self.base_prompt)
        self.assertEqual(output["model"], "banana-pro")
        self.assertIn("contents", output)
        self.assertEqual(output["contents"][0]["role"], "user")
        self.assertIn("Valentina Ruiz", output["contents"][0]["parts"][0]["text"])

    def test_get_adapter(self):
        self.assertIsInstance(get_adapter("flux"), FluxAdapter)
        self.assertIsInstance(get_adapter("banana-pro"), BananaAdapter)
        with self.assertRaises(ValueError):
            get_adapter("unknown")


if __name__ == "__main__":
    unittest.main()
