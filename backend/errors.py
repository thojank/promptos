"""
Error Envelope and Error Code definitions for structured API responses
"""

from enum import Enum
from typing import Optional, List, Any
from pydantic import BaseModel, Field
import uuid


class ErrorCode(str, Enum):
    """Standard error codes for API responses"""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    PROVIDER_ERROR = "PROVIDER_ERROR"
    TIMEOUT = "TIMEOUT"
    INTERNAL_ERROR = "INTERNAL_ERROR"


class ErrorDetail(BaseModel):
    """Individual error detail with field path and message"""
    field_path: str = Field(..., description="Dot-notation path to the field, e.g. 'subject.description'")
    message: str = Field(..., description="Human-readable error message")
    
    
class ErrorEnvelope(BaseModel):
    """Standardized error response envelope"""
    error_code: ErrorCode = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error message")
    correlation_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique ID for tracking")
    details: Optional[List[ErrorDetail]] = Field(default=None, description="Detailed field-level errors")
    
    
class SuccessResponse(BaseModel):
    """Standardized success response with defaulting information"""
    success: bool = Field(default=True, description="Indicates successful operation")
    data: Any = Field(..., description="Response data")
    defaults_applied: List[str] = Field(default_factory=list, description="List of field paths where defaults were applied")
    correlation_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique ID for tracking")
