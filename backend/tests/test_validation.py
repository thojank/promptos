"""
Unit tests for validation and defaulting logic
"""

import unittest
from backend.validation import validate_base_prompt, apply_defaults, create_error_response
from backend.errors import ErrorCode, ErrorDetail


class ValidationTests(unittest.TestCase):
    """Test validation logic"""
    
    def test_missing_required_field_subject(self):
        """Given missing required field (subject) When validate Then VALIDATION_ERROR with field path"""
        data = {
            "environment": {
                "location": "historic piazza in Bari old town"
            }
        }
        
        is_valid, error_details, prompt = validate_base_prompt(data)
        
        self.assertFalse(is_valid)
        self.assertIsNone(prompt)
        self.assertGreater(len(error_details), 0)
        
        # Check that error details include the missing field
        field_paths = [error.field_path for error in error_details]
        self.assertIn("subject", field_paths)
        
    def test_missing_required_field_environment(self):
        """Given missing required field (environment) When validate Then VALIDATION_ERROR with field path"""
        data = {
            "subject": {
                "description": "Valentina Ruiz, 22, Colombian-Lebanese student"
            }
        }
        
        is_valid, error_details, prompt = validate_base_prompt(data)
        
        self.assertFalse(is_valid)
        self.assertIsNone(prompt)
        self.assertGreater(len(error_details), 0)
        
        field_paths = [error.field_path for error in error_details]
        self.assertIn("environment", field_paths)
        
    def test_missing_nested_required_field(self):
        """Given missing nested required field When validate Then error includes nested path"""
        data = {
            "subject": {
                # Missing 'description' which is required
            },
            "environment": {
                "location": "historic piazza"
            }
        }
        
        is_valid, error_details, prompt = validate_base_prompt(data)
        
        self.assertFalse(is_valid)
        self.assertGreater(len(error_details), 0)
        
        # Should have error for subject.description
        field_paths = [error.field_path for error in error_details]
        self.assertTrue(any("subject.description" in path for path in field_paths))
        
    def test_valid_minimal_data(self):
        """Given valid minimal data When validate Then no errors"""
        data = {
            "subject": {
                "description": "Valentina Ruiz, 22, Colombian-Lebanese student"
            },
            "environment": {
                "location": "historic piazza in Bari old town"
            }
        }
        
        is_valid, error_details, prompt = validate_base_prompt(data)
        
        self.assertTrue(is_valid)
        self.assertEqual(len(error_details), 0)
        self.assertIsNotNone(prompt)
        self.assertEqual(prompt.subject.description, "Valentina Ruiz, 22, Colombian-Lebanese student")
        
    def test_valid_complete_data(self):
        """Given valid complete data When validate Then no errors"""
        data = {
            "subject": {
                "description": "Valentina Ruiz, 22, Colombian-Lebanese student",
                "attributes": ["navy blazer", "oval face"]
            },
            "environment": {
                "location": "historic piazza",
                "atmosphere": "warm afternoon",
                "weather": "clear sky"
            },
            "style": {
                "lighting": "soft daylight",
                "camera": "35mm lens"
            },
            "technical": {
                "aspect_ratio": "16:9",
                "seed": 42
            }
        }
        
        is_valid, error_details, prompt = validate_base_prompt(data)
        
        self.assertTrue(is_valid)
        self.assertEqual(len(error_details), 0)
        self.assertIsNotNone(prompt)


class DefaultingTests(unittest.TestCase):
    """Test defaulting logic"""
    
    def test_default_style_applied(self):
        """Given missing style When defaulting Then defaults_applied contains style fields"""
        data = {
            "subject": {
                "description": "Valentina Ruiz"
            },
            "environment": {
                "location": "historic piazza"
            }
        }
        
        updated_data, defaults_applied = apply_defaults(data)
        
        # Check that style defaults were applied
        self.assertIn("style", defaults_applied)
        self.assertIn("style.lighting", defaults_applied)
        self.assertIn("style.camera", defaults_applied)
        
        # Check that defaults are in the data
        self.assertIn("style", updated_data)
        self.assertEqual(updated_data["style"]["lighting"], "soft daylight")
        self.assertEqual(updated_data["style"]["camera"], "35mm lens")
        
    def test_default_technical_applied(self):
        """Given missing technical When defaulting Then defaults_applied contains technical fields"""
        data = {
            "subject": {
                "description": "Valentina Ruiz"
            },
            "environment": {
                "location": "historic piazza"
            }
        }
        
        updated_data, defaults_applied = apply_defaults(data)
        
        # Check that technical defaults were applied
        self.assertIn("technical", defaults_applied)
        self.assertIn("technical.aspect_ratio", defaults_applied)
        self.assertIn("technical.cfg_scale", defaults_applied)
        
        # Check that defaults are in the data
        self.assertIn("technical", updated_data)
        self.assertEqual(updated_data["technical"]["aspect_ratio"], "16:9")
        self.assertEqual(updated_data["technical"]["cfg_scale"], 7.0)
        
    def test_default_environment_optional_fields(self):
        """Given missing environment optional fields When defaulting Then defaults_applied tracks them"""
        data = {
            "subject": {
                "description": "Valentina Ruiz"
            },
            "environment": {
                "location": "historic piazza"
                # Missing atmosphere and weather
            }
        }
        
        updated_data, defaults_applied = apply_defaults(data)
        
        # Check that environment defaults were applied
        self.assertIn("environment.atmosphere", defaults_applied)
        self.assertIn("environment.weather", defaults_applied)
        
        # Check that defaults are in the data
        self.assertEqual(updated_data["environment"]["atmosphere"], "natural ambient lighting")
        self.assertEqual(updated_data["environment"]["weather"], "clear conditions")
        
    def test_no_defaults_when_all_provided(self):
        """Given all fields provided When defaulting Then no defaults applied"""
        data = {
            "subject": {
                "description": "Valentina Ruiz",
                "attributes": ["navy blazer"]
            },
            "environment": {
                "location": "historic piazza",
                "atmosphere": "warm afternoon",
                "weather": "sunny"
            },
            "style": {
                "lighting": "golden hour",
                "camera": "50mm lens"
            },
            "technical": {
                "aspect_ratio": "4:3",
                "cfg_scale": 8.0
            }
        }
        
        updated_data, defaults_applied = apply_defaults(data)
        
        # Should only default subject.attributes if it was None, but we provided it
        # So minimal or no defaults should be applied for the main fields
        self.assertNotIn("style", defaults_applied)
        self.assertNotIn("technical", defaults_applied)
        self.assertNotIn("environment.atmosphere", defaults_applied)
        
    def test_partial_style_defaults(self):
        """Given partial style When defaulting Then only missing fields get defaults"""
        data = {
            "subject": {
                "description": "Valentina Ruiz"
            },
            "environment": {
                "location": "historic piazza"
            },
            "style": {
                "lighting": "golden hour"
                # Missing camera
            }
        }
        
        updated_data, defaults_applied = apply_defaults(data)
        
        # Should apply default for camera but not lighting
        self.assertIn("style.camera", defaults_applied)
        self.assertNotIn("style.lighting", defaults_applied)
        
        # Check the values
        self.assertEqual(updated_data["style"]["lighting"], "golden hour")
        self.assertEqual(updated_data["style"]["camera"], "35mm lens")


class ErrorResponseTests(unittest.TestCase):
    """Test error response creation"""
    
    def test_create_validation_error(self):
        """Test creating VALIDATION_ERROR response"""
        details = [
            ErrorDetail(field_path="subject", message="Field is required"),
            ErrorDetail(field_path="environment.location", message="Field is required")
        ]
        
        error = create_error_response(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Validation failed",
            details=details
        )
        
        self.assertEqual(error.error_code, ErrorCode.VALIDATION_ERROR)
        self.assertEqual(error.message, "Validation failed")
        self.assertEqual(len(error.details), 2)
        self.assertIsNotNone(error.correlation_id)
        
    def test_create_provider_error(self):
        """Test creating PROVIDER_ERROR response"""
        error = create_error_response(
            error_code=ErrorCode.PROVIDER_ERROR,
            message="Provider connection failed"
        )
        
        self.assertEqual(error.error_code, ErrorCode.PROVIDER_ERROR)
        self.assertEqual(error.message, "Provider connection failed")
        self.assertIsNone(error.details)
        self.assertIsNotNone(error.correlation_id)
        
    def test_create_timeout_error(self):
        """Test creating TIMEOUT error response"""
        error = create_error_response(
            error_code=ErrorCode.TIMEOUT,
            message="Request timed out"
        )
        
        self.assertEqual(error.error_code, ErrorCode.TIMEOUT)
        self.assertIsNotNone(error.correlation_id)
        
    def test_create_internal_error(self):
        """Test creating INTERNAL_ERROR response"""
        error = create_error_response(
            error_code=ErrorCode.INTERNAL_ERROR,
            message="Unexpected error occurred"
        )
        
        self.assertEqual(error.error_code, ErrorCode.INTERNAL_ERROR)
        self.assertIsNotNone(error.correlation_id)


if __name__ == "__main__":
    unittest.main()
