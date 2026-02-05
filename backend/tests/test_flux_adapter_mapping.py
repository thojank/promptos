import unittest

from backend.adapters import FluxAdapter
from backend.models import BasePrompt, Subject, Environment, Style, TechSpecs


class FluxAdapterMappingTests(unittest.TestCase):
    def setUp(self):
        self.adapter = FluxAdapter()

    def _make_prompt(self, **tech_kwargs):
        return BasePrompt(
            subject=Subject(
                description="Valentina Ruiz, 22, Colombian-Lebanese student",
                attributes=["navy linen blazer", "oval face shape"],
            ),
            environment=Environment(
                location="historic piazza in Bari old town",
                atmosphere="warm, dry air",
                weather="clear sky",
            ),
            style=Style(
                lighting="soft daylight",
                camera="35mm lens",
                film_stock="Kodak Portra 400",
                aesthetics=["photorealistic"],
            ),
            technical=TechSpecs(**tech_kwargs),
        )

    def test_aspect_ratio_mapping_16_9(self):
        base_prompt = self._make_prompt(aspect_ratio="16:9")
        output = self.adapter.adapt(base_prompt)
        self.assertEqual(output["width"], 1344)
        self.assertEqual(output["height"], 768)

    def test_resolution_overrides_aspect_ratio(self):
        base_prompt = self._make_prompt(aspect_ratio="1:1", resolution="1024x1536")
        output = self.adapter.adapt(base_prompt)
        self.assertEqual(output["width"], 1024)
        self.assertEqual(output["height"], 1536)

    def test_seed_only_set_when_provided(self):
        base_prompt = self._make_prompt(aspect_ratio="1:1")
        output = self.adapter.adapt(base_prompt)
        self.assertNotIn("seed", output)

        base_prompt_with_seed = self._make_prompt(aspect_ratio="1:1", seed=123)
        output_with_seed = self.adapter.adapt(base_prompt_with_seed)
        self.assertEqual(output_with_seed["seed"], 123)

    def test_guidance_defaults_when_missing(self):
        base_prompt = self._make_prompt(aspect_ratio="1:1")
        output = self.adapter.adapt(base_prompt)
        self.assertEqual(output["guidance"], 7.0)

    def test_guidance_from_cfg_scale(self):
        base_prompt = self._make_prompt(aspect_ratio="1:1", cfg_scale=9.5)
        output = self.adapter.adapt(base_prompt)
        self.assertEqual(output["guidance"], 9.5)

    def test_sampler_warning_when_unsupported(self):
        base_prompt = self._make_prompt(aspect_ratio="1:1", sampler="weird_sampler")
        output = self.adapter.adapt(base_prompt)
        self.assertNotIn("sampler", output)
        self.assertIn("meta", output)
        self.assertTrue(any("Unsupported sampler" in w for w in output["meta"]["warnings"]))


if __name__ == "__main__":
    unittest.main()
