"""
Validation and Defaulting logic for BasePrompt
"""

from typing import List, Tuple, Any, Dict
from pydantic import ValidationError
from backend.models import BasePrompt, Subject, Environment, Style, TechSpecs
from backend.errors import ErrorDetail, ErrorCode, ErrorEnvelope


def validate_base_prompt(data: dict) -> Tuple[bool, List[ErrorDetail], BasePrompt]:
    """
    Validate BasePrompt data and return validation results.
    
    Returns:
        Tuple of (is_valid, error_details, prompt_or_none)
    """
    errors = []
    
    try:
        # Attempt to create BasePrompt - Pydantic will validate required fields
        prompt = BasePrompt(**data)
        return True, [], prompt
    except ValidationError as e:
        # Convert Pydantic validation errors to our error format
        for error in e.errors():
            field_path = ".".join(str(loc) for loc in error["loc"])
            message = error["msg"]
            error_type = error["type"]
            
            # Make error messages more user-friendly
            if error_type == "missing":
                message = f"Field is required but missing"
            elif error_type == "value_error":
                message = error.get("msg", "Invalid value")
            
            errors.append(ErrorDetail(
                field_path=field_path,
                message=message
            ))
        
        return False, errors, None
    except Exception as e:
        # Handle unexpected errors
        errors.append(ErrorDetail(
            field_path="unknown",
            message=f"Unexpected validation error: {str(e)}"
        ))
        return False, errors, None


def apply_defaults(data: dict) -> Tuple[dict, List[str]]:
    """
    Apply defaults to optional fields in BasePrompt data.
    
    Returns:
        Tuple of (updated_data, defaults_applied_paths)
    """
    defaults_applied = []
    updated_data = data.copy()
    
    # Apply defaults for Style if missing
    if "style" not in updated_data or updated_data["style"] is None:
        updated_data["style"] = {
            "lighting": "soft daylight",
            "camera": "35mm lens",
            "film_stock": None,
            "aesthetics": None
        }
        defaults_applied.append("style")
        defaults_applied.append("style.lighting")
        defaults_applied.append("style.camera")
    else:
        style = updated_data["style"]
        if isinstance(style, dict):
            if "lighting" not in style or style["lighting"] is None:
                style["lighting"] = "soft daylight"
                defaults_applied.append("style.lighting")
            if "camera" not in style or style["camera"] is None:
                style["camera"] = "35mm lens"
                defaults_applied.append("style.camera")
    
    # Apply defaults for TechSpecs if missing
    if "technical" not in updated_data or updated_data["technical"] is None:
        updated_data["technical"] = {
            "aspect_ratio": "16:9",
            "seed": None,
            "cfg_scale": 7.0
        }
        defaults_applied.append("technical")
        defaults_applied.append("technical.aspect_ratio")
        defaults_applied.append("technical.cfg_scale")
    else:
        technical = updated_data["technical"]
        if isinstance(technical, dict):
            if "aspect_ratio" not in technical or technical["aspect_ratio"] is None:
                technical["aspect_ratio"] = "16:9"
                defaults_applied.append("technical.aspect_ratio")
            if "cfg_scale" not in technical or technical["cfg_scale"] is None:
                technical["cfg_scale"] = 7.0
                defaults_applied.append("technical.cfg_scale")
    
    # Apply defaults for Environment optional fields
    if "environment" in updated_data and isinstance(updated_data["environment"], dict):
        env = updated_data["environment"]
        if "atmosphere" not in env or env["atmosphere"] is None:
            env["atmosphere"] = "natural ambient lighting"
            defaults_applied.append("environment.atmosphere")
        if "weather" not in env or env["weather"] is None:
            env["weather"] = "clear conditions"
            defaults_applied.append("environment.weather")
    
    # Apply defaults for Subject attributes if missing
    if "subject" in updated_data and isinstance(updated_data["subject"], dict):
        subject = updated_data["subject"]
        if "attributes" not in subject or subject["attributes"] is None:
            subject["attributes"] = []
            defaults_applied.append("subject.attributes")
    
    return updated_data, defaults_applied


def create_error_response(error_code: ErrorCode, message: str, details: List[ErrorDetail] = None) -> ErrorEnvelope:
    """
    Create a standardized error response.
    
    Args:
        error_code: The error code enum value
        message: Human-readable error message
        details: Optional list of field-level error details
    
    Returns:
        ErrorEnvelope object
    """
    return ErrorEnvelope(
        error_code=error_code,
        message=message,
        details=details
    )
