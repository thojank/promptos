"""
Integration tests for /api/adapt endpoint with validation and error handling
"""

import unittest
from fastapi.testclient import TestClient
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app


class AdaptEndpointIntegrationTests(unittest.TestCase):
    """Integration tests for the /api/adapt endpoint"""
    
    def setUp(self):
        self.client = TestClient(app)
        
    def test_missing_required_field_returns_validation_error(self):
        """Given missing required field When POST to /api/adapt Then VALIDATION_ERROR with details"""
        data = {
            # Missing 'subject' which is required
            "environment": {
                "location": "historic piazza in Bari old town"
            }
        }
        
        response = self.client.post("/api/adapt/flux", json=data)
        
        self.assertEqual(response.status_code, 400)
        json_response = response.json()
        
        # Check error envelope structure
        self.assertIn("error_code", json_response)
        self.assertEqual(json_response["error_code"], "VALIDATION_ERROR")
        self.assertIn("message", json_response)
        self.assertIn("correlation_id", json_response)
        self.assertIn("details", json_response)
        
        # Check that details include field path
        details = json_response["details"]
        self.assertIsInstance(details, list)
        self.assertGreater(len(details), 0)
        
        field_paths = [d["field_path"] for d in details]
        self.assertIn("subject", field_paths)
        
    def test_valid_request_with_defaults(self):
        """Given valid minimal data When POST to /api/adapt Then success with defaults_applied"""
        data = {
            "subject": {
                "description": "Valentina Ruiz, 22, Colombian-Lebanese student"
            },
            "environment": {
                "location": "historic piazza in Bari old town"
            }
        }
        
        response = self.client.post("/api/adapt/flux", json=data)
        
        self.assertEqual(response.status_code, 200)
        json_response = response.json()
        
        # Check success response structure
        self.assertIn("success", json_response)
        self.assertTrue(json_response["success"])
        self.assertIn("data", json_response)
        self.assertIn("defaults_applied", json_response)
        self.assertIn("correlation_id", json_response)
        
        # Check that defaults were applied
        defaults_applied = json_response["defaults_applied"]
        self.assertIsInstance(defaults_applied, list)
        self.assertGreater(len(defaults_applied), 0)
        
        # Should have applied style and technical defaults
        self.assertIn("style", defaults_applied)
        self.assertIn("technical", defaults_applied)
        
    def test_valid_complete_request_minimal_defaults(self):
        """Given complete data When POST to /api/adapt Then success with minimal defaults"""
        data = {
            "subject": {
                "description": "Valentina Ruiz, 22, Colombian-Lebanese student",
                "attributes": ["navy linen blazer", "oval face shape"]
            },
            "environment": {
                "location": "historic piazza in Bari old town",
                "atmosphere": "warm, dry air",
                "weather": "clear sky"
            },
            "style": {
                "lighting": "soft daylight",
                "camera": "35mm lens",
                "film_stock": "Kodak Portra 400",
                "aesthetics": ["photorealistic"]
            },
            "technical": {
                "aspect_ratio": "16:9",
                "seed": 42,
                "cfg_scale": 7.0
            }
        }
        
        response = self.client.post("/api/adapt/flux", json=data)
        
        self.assertEqual(response.status_code, 200)
        json_response = response.json()
        
        self.assertTrue(json_response["success"])
        self.assertIn("data", json_response)
        
        # Should have minimal or no defaults applied
        defaults_applied = json_response["defaults_applied"]
        # Main sections shouldn't be in defaults since they were provided
        self.assertNotIn("style", defaults_applied)
        self.assertNotIn("technical", defaults_applied)
        
    def test_invalid_model_returns_provider_error(self):
        """Given invalid model name When POST to /api/adapt Then PROVIDER_ERROR"""
        data = {
            "subject": {
                "description": "Valentina Ruiz"
            },
            "environment": {
                "location": "historic piazza"
            }
        }
        
        response = self.client.post("/api/adapt/unknown-model", json=data)
        
        self.assertEqual(response.status_code, 400)
        json_response = response.json()
        
        # Should return PROVIDER_ERROR for unknown model
        self.assertEqual(json_response["error_code"], "PROVIDER_ERROR")
        self.assertIn("correlation_id", json_response)
        self.assertIn("message", json_response)
        
    def test_correlation_id_present_in_success(self):
        """Given valid request When POST to /api/adapt Then response includes correlation_id"""
        data = {
            "subject": {
                "description": "Valentina Ruiz"
            },
            "environment": {
                "location": "historic piazza"
            }
        }
        
        response = self.client.post("/api/adapt/flux", json=data)
        
        self.assertEqual(response.status_code, 200)
        json_response = response.json()
        
        self.assertIn("correlation_id", json_response)
        correlation_id = json_response["correlation_id"]
        
        # Should be a valid UUID format (36 characters with dashes)
        self.assertEqual(len(correlation_id), 36)
        self.assertIn("-", correlation_id)
        
    def test_correlation_id_present_in_error(self):
        """Given invalid request When POST to /api/adapt Then error includes correlation_id"""
        data = {
            # Missing required fields
        }
        
        response = self.client.post("/api/adapt/flux", json=data)
        
        self.assertEqual(response.status_code, 400)
        json_response = response.json()
        
        self.assertIn("correlation_id", json_response)
        self.assertIsNotNone(json_response["correlation_id"])
        
    def test_adapted_output_structure_flux(self):
        """Given valid request for Flux When POST to /api/adapt Then data contains Flux-specific structure"""
        data = {
            "subject": {
                "description": "Valentina Ruiz, 22, Colombian-Lebanese student"
            },
            "environment": {
                "location": "historic piazza in Bari old town"
            }
        }
        
        response = self.client.post("/api/adapt/flux", json=data)
        
        self.assertEqual(response.status_code, 200)
        json_response = response.json()
        
        # Check Flux-specific output structure
        data_output = json_response["data"]
        self.assertIn("model", data_output)
        self.assertEqual(data_output["model"], "flux")
        self.assertIn("prompt", data_output)
        self.assertIn("settings", data_output)
        
    def test_adapted_output_structure_banana(self):
        """Given valid request for Banana When POST to /api/adapt Then data contains Banana-specific structure"""
        data = {
            "subject": {
                "description": "Valentina Ruiz, 22, Colombian-Lebanese student"
            },
            "environment": {
                "location": "historic piazza in Bari old town"
            }
        }
        
        response = self.client.post("/api/adapt/banana-pro", json=data)
        
        self.assertEqual(response.status_code, 200)
        json_response = response.json()
        
        # Check Banana-specific output structure
        data_output = json_response["data"]
        self.assertIn("model", data_output)
        self.assertEqual(data_output["model"], "banana-pro")
        self.assertIn("contents", data_output)


if __name__ == "__main__":
    unittest.main()
