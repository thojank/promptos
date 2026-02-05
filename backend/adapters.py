"""
Adapter-Pattern: Universal BasePrompt → modell-spezifische Formate
"""

from typing import Dict, Any, List, Optional, Tuple
import re

from backend.models import BasePrompt


class BaseAdapter:
    model_name: str = "base"

    def adapt(self, base_prompt: BasePrompt) -> Dict[str, Any]:
        raise NotImplementedError


# Flux Adapter Mapping + Policy (P0):
# - prompt = subjects + environment + style parts joined with ", "
# - negative_prompt defaults to empty string when not provided
# - width/height from technical.resolution if present, else aspect_ratio mapping
# - steps default 28 when not set
# - guidance default 7.0 when not set (cfg_scale used if guidance missing)
# - sampler included only if supported, otherwise warning
# - seed included only when provided
# - meta includes baseprompt_version and warnings
class FluxAdapter(BaseAdapter):
    model_name = "flux"

    _ASPECT_RATIO_MAP: Dict[str, Tuple[int, int]] = {
        "1:1": (1024, 1024),
        "16:9": (1344, 768),
        "9:16": (768, 1344),
        "4:3": (1152, 896),
        "3:4": (896, 1152),
    }
    _SUPPORTED_SAMPLERS = {
        "euler",
        "euler_a",
        "ddim",
        "dpmpp_2m",
        "dpmpp_2m_sde",
    }

    def _parse_resolution(self, resolution_value: Any) -> Optional[Tuple[int, int]]:
        if isinstance(resolution_value, str):
            match = re.match(r"^\s*(\d+)\s*x\s*(\d+)\s*$", resolution_value)
            if match:
                return int(match.group(1)), int(match.group(2))
            return None
        if isinstance(resolution_value, dict):
            width = resolution_value.get("width")
            height = resolution_value.get("height")
            if isinstance(width, int) and isinstance(height, int):
                return width, height
        return None

    def _resolve_dimensions(self, base_prompt: BasePrompt) -> Tuple[int, int]:
        technical = base_prompt.technical
        if technical is not None:
            resolution = getattr(technical, "resolution", None)
            parsed = self._parse_resolution(resolution)
            if parsed:
                return parsed

            aspect_ratio = technical.aspect_ratio
            if aspect_ratio and aspect_ratio in self._ASPECT_RATIO_MAP:
                return self._ASPECT_RATIO_MAP[aspect_ratio]

        return self._ASPECT_RATIO_MAP["1:1"]

    def _collect_subject_parts(self, base_prompt: BasePrompt) -> List[str]:
        parts: List[str] = []
        subjects = getattr(base_prompt, "subjects", None)
        if subjects:
            for subject in subjects:
                if subject and subject.description:
                    parts.append(subject.description)
                attributes = getattr(subject, "attributes", None) or []
                parts.extend(attributes)
            return parts

        subject = getattr(base_prompt, "subject", None)
        if subject:
            parts.append(subject.description)
            parts.extend(subject.attributes or [])
        return parts

    def adapt(self, base_prompt: BasePrompt) -> Dict[str, Any]:
        warnings: List[str] = []

        style_parts: List[str] = []
        if base_prompt.style:
            if base_prompt.style.lighting:
                style_parts.append(base_prompt.style.lighting)
            if base_prompt.style.camera:
                style_parts.append(base_prompt.style.camera)
            if base_prompt.style.film_stock:
                style_parts.append(base_prompt.style.film_stock)
            if base_prompt.style.aesthetics:
                style_parts.extend(base_prompt.style.aesthetics)

        prompt_parts = self._collect_subject_parts(base_prompt)

        environment = getattr(base_prompt, "environment", None)
        if environment:
            if environment.location:
                prompt_parts.append(environment.location)
            if environment.atmosphere:
                prompt_parts.append(environment.atmosphere)
            if environment.weather:
                prompt_parts.append(environment.weather)

        prompt_parts.extend(style_parts)

        width, height = self._resolve_dimensions(base_prompt)

        technical = base_prompt.technical
        guidance = None
        steps = None
        sampler = None
        negative_prompt = ""
        seed = None

        if technical is not None:
            guidance = getattr(technical, "guidance", None)
            if guidance is None:
                guidance = technical.cfg_scale
            steps = getattr(technical, "steps", None)
            sampler = getattr(technical, "sampler", None)
            negative_prompt = getattr(technical, "negative_prompt", None) or ""
            seed = technical.seed

        payload: Dict[str, Any] = {
            "model": "flux",
            "prompt": ", ".join([p for p in prompt_parts if p]),
            "negative_prompt": negative_prompt,
            "width": width,
            "height": height,
            "steps": steps if steps is not None else 28,
            "guidance": guidance if guidance is not None else 7.0,
            "meta": {
                "baseprompt_version": "v1",
                "warnings": warnings,
            },
        }

        if sampler:
            if sampler in self._SUPPORTED_SAMPLERS:
                payload["sampler"] = sampler
            else:
                warnings.append(f"Unsupported sampler: {sampler}")

        if seed is not None:
            payload["seed"] = seed

        return payload


class BananaAdapter(BaseAdapter):
    model_name = "banana-pro"

    def adapt(self, base_prompt: BasePrompt) -> Dict[str, Any]:
        text_parts = [
            base_prompt.subject.description,
            *(base_prompt.subject.attributes or []),
            base_prompt.environment.location,
        ]
        if base_prompt.environment.atmosphere:
            text_parts.append(base_prompt.environment.atmosphere)
        if base_prompt.environment.weather:
            text_parts.append(base_prompt.environment.weather)
        if base_prompt.style:
            if base_prompt.style.lighting:
                text_parts.append(base_prompt.style.lighting)
            if base_prompt.style.camera:
                text_parts.append(base_prompt.style.camera)
            if base_prompt.style.film_stock:
                text_parts.append(base_prompt.style.film_stock)
            if base_prompt.style.aesthetics:
                text_parts.extend(base_prompt.style.aesthetics)

        text = ". ".join([p for p in text_parts if p])

        return {
            "model": "banana-pro",
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": text}],
                }
            ],
        }


def get_adapter(model: str) -> BaseAdapter:
    model_normalized = model.lower().strip()
    if model_normalized in {"flux"}:
        return FluxAdapter()
    if model_normalized in {"banana", "banana-pro", "nano banana", "nano-banana"}:
        return BananaAdapter()
    raise ValueError(f"Unbekanntes Modell: {model}")
