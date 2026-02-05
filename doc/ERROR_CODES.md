# Error Handling Documentation

## Error Codes

The API uses structured error responses with standardized error codes for consistent error handling.

### Error Codes (MVP)

| Error Code | Description | HTTP Status | When Used |
|------------|-------------|-------------|-----------|
| `VALIDATION_ERROR` | Request validation failed | 400 | Missing required fields, invalid field values, schema violations |
| `PROVIDER_ERROR` | External provider error | 400 | Unknown model, adapter failures, configuration errors |
| `TIMEOUT` | Request timeout | 408 | Long-running operations exceed time limit |
| `INTERNAL_ERROR` | Internal server error | 500 | Unexpected errors, system failures |

## Error Envelope Structure

All error responses follow this standardized structure:

```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Human-readable error description",
  "correlation_id": "550e8400-e29b-41d4-a716-446655440000",
  "details": [
    {
      "field_path": "subject.description",
      "message": "Field is required but missing"
    }
  ]
}
```

### Fields

- **error_code** (string, required): Machine-readable error code from the list above
- **message** (string, required): Human-readable error message
- **correlation_id** (string, required): Unique UUID for tracking and debugging
- **details** (array, optional): Field-level error details for validation errors

## Success Response Structure

Successful requests return:

```json
{
  "success": true,
  "data": { /* ... adapted prompt data ... */ },
  "defaults_applied": [
    "style",
    "style.lighting",
    "style.camera",
    "technical.aspect_ratio"
  ],
  "correlation_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Fields

- **success** (boolean): Always `true` for successful responses
- **data** (object): The response data (adapted prompt in model-specific format)
- **defaults_applied** (array): List of field paths where default values were applied
- **correlation_id** (string): Unique UUID for tracking

## Examples

### Example 1: Validation Error (Missing Required Field)

**Request:**
```bash
POST /api/adapt/flux
Content-Type: application/json

{
  "environment": {
    "location": "historic piazza in Bari"
  }
}
```

**Response (400):**
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed for BasePrompt",
  "correlation_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "details": [
    {
      "field_path": "subject",
      "message": "Field is required but missing"
    }
  ]
}
```

### Example 2: Successful Request with Defaults

**Request:**
```bash
POST /api/adapt/flux
Content-Type: application/json

{
  "subject": {
    "description": "Valentina Ruiz, 22, Colombian-Lebanese student from Medellín"
  },
  "environment": {
    "location": "historic piazza in Bari old town"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "model": "flux",
    "prompt": "Valentina Ruiz, 22, Colombian-Lebanese student from Medellín, historic piazza in Bari old town, natural ambient lighting, clear conditions, soft daylight, 35mm lens",
    "settings": {
      "aspect_ratio": "16:9",
      "seed": null,
      "cfg_scale": 7.0
    }
  },
  "defaults_applied": [
    "style",
    "style.lighting",
    "style.camera",
    "technical",
    "technical.aspect_ratio",
    "technical.cfg_scale",
    "environment.atmosphere",
    "environment.weather",
    "subject.attributes"
  ],
  "correlation_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
}
```

### Example 3: Provider Error (Unknown Model)

**Request:**
```bash
POST /api/adapt/unknown-model
Content-Type: application/json

{
  "subject": {
    "description": "Valentina Ruiz"
  },
  "environment": {
    "location": "historic piazza"
  }
}
```

**Response (400):**
```json
{
  "error_code": "PROVIDER_ERROR",
  "message": "Unbekanntes Modell: unknown-model",
  "correlation_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "details": null
}
```

### Example 4: Complete Request with Minimal Defaults

**Request:**
```bash
POST /api/adapt/banana-pro
Content-Type: application/json

{
  "subject": {
    "description": "Valentina Ruiz, 22, Colombian-Lebanese student",
    "attributes": ["navy linen blazer", "oval face shape"]
  },
  "environment": {
    "location": "historic piazza in Bari old town",
    "atmosphere": "warm, dry air, relaxed afternoon",
    "weather": "clear sky"
  },
  "style": {
    "lighting": "soft daylight",
    "camera": "35mm lens, three-quarter view",
    "film_stock": "Kodak Portra 400",
    "aesthetics": ["photorealistic", "natural color rendering"]
  },
  "technical": {
    "aspect_ratio": "16:9",
    "seed": 42,
    "cfg_scale": 7.0
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "model": "banana-pro",
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "Valentina Ruiz, 22, Colombian-Lebanese student. navy linen blazer. oval face shape. historic piazza in Bari old town. warm, dry air, relaxed afternoon. clear sky. soft daylight. 35mm lens, three-quarter view. Kodak Portra 400. photorealistic. natural color rendering"
          }
        ]
      }
    ]
  },
  "defaults_applied": [],
  "correlation_id": "d4e5f6a7-b8c9-0123-def0-123456789013"
}
```

## Default Values

When optional fields are not provided, the following defaults are applied:

| Field Path | Default Value |
|------------|---------------|
| `style.lighting` | `"soft daylight"` |
| `style.camera` | `"35mm lens"` |
| `technical.aspect_ratio` | `"16:9"` |
| `technical.cfg_scale` | `7.0` |
| `environment.atmosphere` | `"natural ambient lighting"` |
| `environment.weather` | `"clear conditions"` |
| `subject.attributes` | `[]` (empty array) |

## Correlation IDs

Every response (success or error) includes a `correlation_id` field with a unique UUID. Use this ID for:

- **Debugging**: Track requests across logs and systems
- **Support**: Reference specific requests when reporting issues
- **Monitoring**: Correlate events across distributed systems

The correlation ID is automatically generated for each request and remains consistent throughout the request lifecycle.

## Best Practices

1. **Always check `success` or `error_code`**: Use these fields to determine if the request succeeded
2. **Use correlation IDs for debugging**: Include correlation IDs in logs and error reports
3. **Handle validation errors gracefully**: Parse the `details` array to show field-specific errors to users
4. **Track defaults_applied**: Use this information to inform users which values were auto-filled
5. **Implement retry logic**: For `TIMEOUT` and `INTERNAL_ERROR` codes, consider implementing exponential backoff

## Testing Examples

### Unit Test: Missing Required Field

```python
def test_missing_required_field():
    data = {"environment": {"location": "test"}}
    is_valid, errors, prompt = validate_base_prompt(data)
    
    assert not is_valid
    assert len(errors) > 0
    assert "subject" in [e.field_path for e in errors]
```

### Unit Test: Defaults Applied

```python
def test_defaults_applied():
    data = {
        "subject": {"description": "Test"},
        "environment": {"location": "Test location"}
    }
    updated_data, defaults = apply_defaults(data)
    
    assert "style" in defaults
    assert "technical" in defaults
    assert updated_data["style"]["lighting"] == "soft daylight"
```

### Integration Test: Provider Error

```python
def test_provider_error():
    response = client.post("/api/adapt/unknown", json=valid_data)
    
    assert response.status_code == 400
    assert response.json()["error_code"] == "PROVIDER_ERROR"
    assert "correlation_id" in response.json()
```
