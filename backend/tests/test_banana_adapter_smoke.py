"""
Smoke tests for BananaAdapter with realistic fixtures.
Tests that BananaAdapter correctly adapts BasePrompt to Banana-compatible format.
"""

import unittest
import json
import os
from pathlib import Path

from backend.adapters import BananaAdapter
from backend.models import BasePrompt, Subject, Environment, Style, TechSpecs
from backend.validation import validate_base_prompt


class BananaAdapterSmokeTests(unittest.TestCase):
    """Smoke tests for BananaAdapter with fixture-based scenarios."""

    @classmethod
    def setUpClass(cls):
        """Load fixtures once for all tests."""
        fixture_path = Path(__file__).parent.parent / "fixtures" / "banana_smoke_fixtures.json"
        with open(fixture_path, 'r', encoding='utf-8') as f:
            cls.fixtures = json.load(f)
        cls.adapter = BananaAdapter()

    def _prepare_prompt(self, fixture_dict: dict) -> BasePrompt:
        """Convert fixture dict to validated BasePrompt."""
        is_valid, errors, prompt = validate_base_prompt(fixture_dict)
        self.assertTrue(is_valid, f"Fixture validation failed: {errors}")
        return prompt

    def test_minimal_portrait_smoke(self):
        """
        Smoke test 1: minimal_portrait
        - Only subject.description
        - Minimal environment
        - No style, no technical
        """
        fixture = self.fixtures["minimal_portrait"]
        prompt = self._prepare_prompt(fixture)

        output = self.adapter.adapt(prompt)

        # Assert structure
        self.assertEqual(output["model"], "banana-pro")
        self.assertIn("contents", output)
        self.assertEqual(len(output["contents"]), 1)
        self.assertEqual(output["contents"][0]["role"], "user")
        self.assertIn("parts", output["contents"][0])
        self.assertEqual(len(output["contents"][0]["parts"]), 1)

        # Assert content
        text = output["contents"][0]["parts"][0]["text"]
        self.assertIsInstance(text, str)
        self.assertIn("Valentina", text)
        self.assertIn("studio", text)

        # Assert no seed when not provided
        self.assertNotIn("seed", output)

        # No meta unless technical provided
        if "technical" not in fixture or fixture["technical"] is None:
            self.assertNotIn("meta", output)

    def test_product_shot_smoke(self):
        """
        Smoke test 2: product_shot
        - Subject with description + attributes
        - Full environment (location, atmosphere, weather)
        - Full style (lighting, camera, film_stock, aesthetics)
        """
        fixture = self.fixtures["product_shot"]
        prompt = self._prepare_prompt(fixture)

        output = self.adapter.adapt(prompt)

        # Assert structure
        self.assertEqual(output["model"], "banana-pro")
        text = output["contents"][0]["parts"][0]["text"]

        # Assert all content is included
        self.assertIn("leather handbag", text)
        self.assertIn("cognac brown", text)
        self.assertIn("white seamless", text)
        self.assertIn("soft diffused light", text)
        self.assertIn("macro lens", text)
        self.assertIn("luxury product photography", text)

        # No seed when not provided
        self.assertNotIn("seed", output)

        # Verify text is joined with ". "
        self.assertIn(". ", text)

    def test_cinematic_scene_smoke(self):
        """
        Smoke test 3: cinematic_scene
        - All prompt fields populated
        - Technical fields (seed, steps, guidance)
        - Verify seed only included when present
        """
        fixture = self.fixtures["cinematic_scene"]
        prompt = self._prepare_prompt(fixture)

        output = self.adapter.adapt(prompt)

        # Assert structure
        self.assertEqual(output["model"], "banana-pro")
        text = output["contents"][0]["parts"][0]["text"]

        # Assert all content
        self.assertIn("Elena", text)
        self.assertIn("detective", text)
        self.assertIn("Los Angeles", text)
        self.assertIn("film noir", text)

        # Assert seed is present (fixture includes seed=12345)
        self.assertIn("seed", output)
        self.assertEqual(output["seed"], 12345)

        # Assert steps is present
        self.assertIn("steps", output)
        self.assertEqual(output["steps"], 30)

        # Assert meta
        self.assertIn("meta", output)
        self.assertEqual(output["meta"]["baseprompt_version"], "v1")
        self.assertTrue(output["meta"].get("seed_provided", False))

    def test_banana_no_breaking_changes_for_flux(self):
        """
        Verify BananaAdapter doesn't break existing structure.
        All payloads should have: model, contents[0]{role, parts[0]{text}}.
        """
        for fixture_name, fixture_dict in self.fixtures.items():
            prompt = self._prepare_prompt(fixture_dict)
            output = self.adapter.adapt(prompt)

            # Core structure must always be present
            self.assertEqual(output["model"], "banana-pro")
            self.assertIsInstance(output["contents"], list)
            self.assertEqual(len(output["contents"]), 1)
            self.assertEqual(output["contents"][0]["role"], "user")
            self.assertIsInstance(output["contents"][0]["parts"], list)
            self.assertEqual(len(output["contents"][0]["parts"]), 1)
            text = output["contents"][0]["parts"][0]["text"]
            self.assertIsInstance(text, str)
            self.assertGreater(len(text), 0, f"Empty text in fixture {fixture_name}")

    def test_seed_only_when_technical_provided(self):
        """
        Verify seed logic: only set if technical.seed exists.
        Test both with and without seed.
        """
        # minimal_portrait: no technical -> no seed
        fixture_minimal = self.fixtures["minimal_portrait"]
        prompt_minimal = self._prepare_prompt(fixture_minimal)
        output_minimal = self.adapter.adapt(prompt_minimal)
        self.assertNotIn("seed", output_minimal)

        # cinematic_scene: has technical.seed -> seed present
        fixture_cinematic = self.fixtures["cinematic_scene"]
        prompt_cinematic = self._prepare_prompt(fixture_cinematic)
        output_cinematic = self.adapter.adapt(prompt_cinematic)
        self.assertIn("seed", output_cinematic)
        self.assertEqual(output_cinematic["seed"], 12345)

    def test_defaults_no_crash(self):
        """
        Verify adaptation handles missing optional fields gracefully.
        Create a minimal fixture and ensure no AttributeError or KeyError.
        """
        minimal = {
            "subject": {"description": "Test subject"},
            "environment": {"location": "Test location"},
        }

        prompt = self._prepare_prompt(minimal)
        output = self.adapter.adapt(prompt)

        # Should not crash and produce valid output
        self.assertIsNotNone(output)
        self.assertEqual(output["model"], "banana-pro")
        text = output["contents"][0]["parts"][0]["text"]
        self.assertIn("Test subject", text)
        self.assertIn("Test location", text)


if __name__ == "__main__":
    unittest.main()
