# API Contract (Draft)

## POST /api/baseprompt
- input: { text, model }
- output: { base_prompt, defaults_applied, validation_errors?, correlation_id }

## POST /api/adapter
- input: { base_prompt, target_model, params? }
- output: { adapter_output, warnings?, correlation_id }

## POST /api/import/civitai
- input: { url, mode }
- output: { meta, base_prompt, extracted_parts, errors?, correlation_id }

## POST /api/import/comfy-png
- input: multipart PNG
- output: { raw_meta, base_prompt, missing_fields, correlation_id }

## POST /api/keys
- create/list/revoke
